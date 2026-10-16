"""Simple, light acoustic background: plucked guitar (Karplus-Strong) + soft claps/shaker.
Usage: python3 music.py <duration_seconds> <out.wav>
"""
import sys, wave
import numpy as np

SR = 44100
BPM = 112.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(11)
dur = float(sys.argv[1]); out = sys.argv[2]
N = int((dur + 3) * SR)
L = np.zeros(N); R = np.zeros(N)


def midi(n): return 440.0 * 2 ** ((n - 69) / 12.0)


def add(buf, start, sig, gain):
    i = int(start * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[: j - i] * gain


def addst(start, sig, gain=1.0, pan=0.0):
    add(L, start, sig, gain * np.sqrt(0.5 * (1 - pan)))
    add(R, start, sig, gain * np.sqrt(0.5 * (1 + pan)))


_cache = {}
def string(note, length=1.6, bright=0.5):
    key = (note, length, bright)
    if key in _cache: return _cache[key]
    f = midi(note); n = int(length * SR); p = int(round(SR / f))
    buf = rng.uniform(-1, 1, p)
    # soften the excitation
    for _ in range(int(3 * (1 - bright)) + 1):
        buf = 0.5 * (buf + np.roll(buf, 1))
    y = np.zeros(n); y[:p] = buf
    decay = 0.996
    for i in range(p, n):
        y[i] = decay * 0.5 * (y[i - p] + y[i - p - 1 if i - p - 1 >= 0 else 0])
    y *= np.exp(-np.arange(n) / SR / 1.4)
    # body: gentle low-pass
    y = np.convolve(y, np.ones(3) / 3, mode="same")
    _cache[key] = y
    return y


def shaker():
    n = int(0.09 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - np.convolve(x, np.ones(3) / 3, mode="same")
    return x * np.sin(np.pi * np.minimum(t / 0.09, 1)) ** 2 * 0.05


def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - np.convolve(x, np.ones(5) / 5, mode="same")
    e = np.exp(-t / 0.06)
    for o in (0.01, 0.02): e += 0.5 * np.where(t > o, np.exp(-(t - o) / 0.008), 0)
    return x * e * 0.08


def kick():
    n = int(0.3 * SR); t = np.arange(n) / SR
    f = 55 + 70 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * 0.35


# G - D - Em - C, guitar voicings (strings low->high)
CHORDS = [
    [43, 47, 50, 55, 59, 67],   # G
    [50, 57, 62, 66],           # D
    [40, 47, 52, 55, 59, 64],   # Em
    [48, 52, 55, 60, 64],       # C
]
# fingerpicking pattern on 8ths: index into chord (0 = bass)
PICK = [0, 3, 2, 3, -1, 3, 2, 3]

nbars = int(np.ceil(dur / BAR)) + 1
for b in range(nbars):
    t0 = b * BAR
    ch = CHORDS[b % 4]
    groove = b >= 2 and (dur - t0) > BAR * 2
    for i, p in enumerate(PICK):
        idx = len(ch) - 1 if p == -1 else min(p, len(ch) - 1)
        if p == 0 and i == 0: idx = 0
        note = ch[idx]
        if i == 4: note = ch[1] if len(ch) > 4 else ch[0] + 7
        sw = 0.02 if i % 2 else 0.0   # light swing
        addst(t0 + i * BEAT / 2 + sw, string(note, bright=0.4 if i else 0.2), 0.55 if i else 0.7, pan=-0.2 + 0.08 * (i % 3))
    if groove:
        # strum accent on beats 2 and 4 (second guitar, right)
        for beat in (1, 3):
            for k, note in enumerate(ch[-4:]):
                addst(t0 + beat * BEAT + k * 0.012, string(note + 12 if note < 55 else note, 0.9, 0.7), 0.18, pan=0.5)
            addst(t0 + beat * BEAT, clap(), 1.0, 0.1)
        for beat in (0, 2):
            addst(t0 + beat * BEAT, kick(), 1.0)
        for h in range(8):
            addst(t0 + h * BEAT / 2 + (0.02 if h % 2 else 0), shaker(), 1.0 if h % 2 else 0.6, 0.4)

# small room reverb
def reverb(x, seed):
    r = np.random.default_rng(seed); n = int(1.2 * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t / 0.25); ir[: int(0.015 * SR)] = 0; ir /= np.sqrt(np.sum(ir ** 2))
    m = len(x) + n; nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]

L = L + 0.12 * reverb(L, 1); R = R + 0.12 * reverb(R, 2)
n_out = int(dur * SR); L, R = L[:n_out], R[:n_out]
t = np.arange(n_out) / SR
fade = np.clip((dur - t) / 4.0, 0, 1) * np.clip(t / 0.5, 0, 1)
st = np.stack([L * fade, R * fade], 1)
st = st / np.max(np.abs(st)) * 0.8
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("wrote", out, dur)
