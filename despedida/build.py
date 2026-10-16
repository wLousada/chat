"""Build the farewell video. Usage: python3 -I build.py <uploads_dir> <work_dir> <out.mp4>"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

UP, WORK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
HERE = os.path.dirname(os.path.abspath(__file__))
SEG = os.path.join(WORK, "segs"); os.makedirs(SEG, exist_ok=True)
W, H, FPS = 1080, 1920, 30
T = 0.7  # transition duration
NOCAP = True

NAVY = (14, 30, 78)
BLUE = (28, 63, 160)
YEL = (255, 196, 0)
WHITE = (255, 255, 255)
FD = "/usr/share/fonts/opentype/inter/"
def font(name, size): return ImageFont.truetype(FD + name, size)


def ease(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_back(x):
    x = min(max(x, 0.0), 1.0)
    c1 = 1.70158; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


# ---------- brand pieces ----------
def house_icon(size, bg=YEL, fg=NAVY):
    s = size * 4
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=bg)
    lw = int(s * 0.085)
    cx = s / 2
    roof = [(s * 0.22, s * 0.50), (cx, s * 0.25), (s * 0.78, s * 0.50)]
    d.line(roof, fill=fg, width=lw, joint="curve")
    d.line([(s * 0.30, s * 0.47), (s * 0.30, s * 0.76), (s * 0.70, s * 0.76), (s * 0.70, s * 0.47)], fill=fg, width=lw, joint="curve")
    d.rectangle([cx - s * 0.07, s * 0.58, cx + s * 0.07, s * 0.76], fill=fg)
    return im.resize((size, size), Image.LANCZOS)


def brand_lockup(scale=1.0, color=WHITE):
    ic = house_icon(int(96 * scale))
    f1 = font("InterDisplay-Black.otf", int(64 * scale))
    f2 = font("InterDisplay-SemiBold.otf", int(34 * scale))
    w1 = f1.getbbox("casa")[2]; w2 = f2.getbbox("do construtor")[2]
    w = ic.width + int(22 * scale) + max(w1, w2)
    h = ic.height
    im = Image.new("RGBA", (w + 4, h + 10), (0, 0, 0, 0))
    im.alpha_composite(ic, (0, 0))
    d = ImageDraw.Draw(im)
    x = ic.width + int(22 * scale)
    d.text((x, int(-8 * scale)), "casa", font=f1, fill=color)
    d.text((x + 4, int(58 * scale)), "do construtor", font=f2, fill=YEL)
    return im


def wrap(text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if f.getbbox(t)[2] <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = wd
    lines.append(cur)
    return lines


def caption_img(text, tag="momentos"):
    """Lower-third: small blue chip with icon + yellow bar with navy text."""
    f = font("InterDisplay-ExtraBold.otf", 64)
    ft = font("InterDisplay-Bold.otf", 30)
    lines = wrap(text, f, 860)
    lh = 78
    bw = max(f.getbbox(l)[2] for l in lines) + 80
    bh = lh * len(lines) + 46
    tw = ft.getbbox(tag.upper())[2] + 110
    im = Image.new("RGBA", (W, bh + 90 + 30), (0, 0, 0, 0))
    # shadow
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ds = ImageDraw.Draw(sh)
    ds.rounded_rectangle([60, 74 + 10, 60 + bw, 74 + 10 + bh], radius=28, fill=(0, 0, 0, 140))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    im.alpha_composite(sh)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([60, 74, 60 + bw, 74 + bh], radius=28, fill=YEL)
    for i, l in enumerate(lines):
        d.text((100, 74 + 20 + i * lh), l, font=f, fill=NAVY)
    d.rounded_rectangle([60, 0, 60 + tw, 62], radius=31, fill=BLUE)
    ic = house_icon(44)
    im.alpha_composite(ic, (72, 9))
    d.text((128, 13), tag.upper(), font=ft, fill=WHITE)
    return im


def stripes(w, h, phase=0.0, band=60, c1=YEL, c2=NAVY):
    """Hazard stripes (construction tape)."""
    yy, xx = np.mgrid[0:h, 0:w]
    v = ((xx + yy + phase) // band) % 2
    arr = np.where(v[..., None] == 0, np.array(c1), np.array(c2)).astype(np.uint8)
    return Image.fromarray(arr, "RGB").convert("RGBA")


def gradient_bg(t=0.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = W * (0.5 + 0.15 * math.sin(t * 0.6)); cy = H * 0.38
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (H * 0.9)
    r = np.clip(r, 0, 1)[..., None]
    a = np.array(BLUE, np.float32); b = np.array((6, 14, 44), np.float32)
    arr = a * (1 - r) + b * r
    return Image.fromarray(arr.astype(np.uint8), "RGB").convert("RGBA")


# ---------- encoder helpers ----------
def encoder(path, dur):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-f", "lavfi", "-t", f"{dur}", "-i", "anullsrc=r=44100:cl=stereo",
           "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def render(path, dur, frame_fn):
    p = encoder(path, dur)
    n = int(round(dur * FPS))
    for i in range(n):
        im = frame_fn(i / FPS, i, n)
        p.stdin.write(im.convert("RGB").tobytes())
    p.stdin.close(); p.wait()
    assert p.returncode == 0, path


def cover(im, w, h):
    return ImageOps.fit(im, (w, h), Image.LANCZOS)


def blurred_bg(im):
    bg = cover(im, W // 4, H // 4).filter(ImageFilter.GaussianBlur(10)).resize((W, H), Image.BICUBIC)
    arr = np.asarray(bg, np.float32) * 0.45 + np.array(NAVY, np.float32) * 0.25
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert("RGBA")


def paste_caption(frame, cap, t, start=0.45, y=1440):
    if cap is None or t < start:
        return
    k = ease_back((t - start) / 0.55)
    a = ease((t - start) / 0.35)
    c = cap
    if a < 1:
        c = cap.copy(); c.putalpha(c.getchannel("A").point(lambda v: int(v * a)))
    frame.alpha_composite(c, (int(-120 * (1 - k)), y))


# ---------- photo segment ----------
def photo_segment(path, dur, caption, crop=None, mode="auto", zoom=(1.0, 1.10), pan=(0, 0), tilt=-2.5, tag="momentos"):
    src = Image.open(os.path.join(UP, path)).convert("RGB")
    if crop:
        src = src.crop(crop)
    ar = src.width / src.height
    if mode == "auto":
        mode = "full" if abs(ar - W / H) / (W / H) < 0.12 else "card"
    cap = caption_img(caption, tag) if caption and not NOCAP else None
    if mode == "full":
        base = cover(src, int(W * 1.25), int(H * 1.25))
        def fn(t, i, n):
            p = i / max(n - 1, 1)
            z = zoom[0] + (zoom[1] - zoom[0]) * p
            s = z / 1.25
            cx = base.width / 2 + pan[0] * p * base.width; cy = base.height / 2 + pan[1] * p * base.height
            fr = base.transform((W, H), Image.AFFINE, (1 / s, 0, cx - W / 2 / s, 0, 1 / s, cy - H / 2 / s), Image.BICUBIC).convert("RGBA")
            vig(fr)
            paste_caption(fr, cap, t)
            return fr
    else:
        bg = blurred_bg(src)
        maxw, maxh = (940, 1420) if NOCAP else (920, 1240)
        sc = min(maxw / src.width, maxh / src.height)
        cw, ch = int(src.width * sc), int(src.height * sc)
        card = Image.new("RGBA", (cw + 40, ch + 40), WHITE + (255,))
        card.paste(src.resize((cw, ch), Image.LANCZOS), (20, 20))
        shadow = Image.new("RGBA", (card.width + 120, card.height + 120), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rectangle([60, 75, 60 + card.width, 75 + card.height], fill=(0, 0, 0, 170))
        shadow = shadow.filter(ImageFilter.GaussianBlur(24))
        comp = shadow.copy(); comp.alpha_composite(card, (60, 60))
        comp = comp.resize((comp.width * 2, comp.height * 2), Image.BICUBIC)
        def fn(t, i, n):
            p = i / max(n - 1, 1)
            fr = bg.copy()
            z = (zoom[0] + (zoom[1] - zoom[0]) * 0.6 * p) / 2
            ang = tilt * (1 - 0.6 * p)
            intro = ease_back(t / 0.6)
            z *= 0.85 + 0.15 * intro
            c = comp.rotate(ang, resample=Image.BICUBIC, expand=True)
            c = c.resize((max(1, int(c.width * z)), max(1, int(c.height * z))), Image.BICUBIC)
            fr.alpha_composite(c, (W // 2 - c.width // 2, int(H * (0.48 if NOCAP else 0.42)) - c.height // 2))
            paste_caption(fr, cap, t)
            return fr
    return fn


VIG = None
def vig(fr):
    global VIG
    if VIG is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        a = np.clip((r - 0.75) / 0.7, 0, 1) * 150
        g = np.clip((yy - H * 0.62) / (H * 0.38), 0, 1) * 120
        al = np.clip(a + g, 0, 200).astype(np.uint8)
        VIG = Image.fromarray(np.dstack([np.zeros_like(al)] * 3 + [al]), "RGBA")
    fr.alpha_composite(VIG)


# ---------- title cards ----------
def intro_fn():
    lock = brand_lockup(1.2)
    f_big = font("InterDisplay-Black.otf", 180)
    f_mid = font("InterDisplay-Bold.otf", 52)
    st = stripes(W + 400, 110)
    def fn(t, i, n):
        fr = gradient_bg(t)
        d = ImageDraw.Draw(fr)
        # tape strips sliding in
        for k, (y, ang, dirn) in enumerate([(250, -8, 1), (1600, 6, -1)]):
            p = ease((t - 0.1 * k) / 0.8)
            s = stripes(W + 600, 110, phase=t * 120 * dirn)
            s = s.rotate(ang, expand=True, resample=Image.BICUBIC)
            x = int((-s.width) * (1 - p) * dirn + (W - s.width) / 2 * p) if dirn > 0 else int(W * (1 - p) + (W - s.width) / 2 * p)
            fr.alpha_composite(s, (x, y - s.height // 2))
        # lockup
        a = ease((t - 0.3) / 0.6)
        if a > 0:
            l = lock.copy(); l.putalpha(l.getchannel("A").point(lambda v: int(v * a)))
            fr.alpha_composite(l, (W // 2 - l.width // 2, 470 - int(40 * (1 - a))))
        # big words pop
        for k, (word, col, y) in enumerate([("VALEU,", WHITE, 760), ("PARCEIRO!", YEL, 960)]):
            p = ease_back((t - 0.8 - 0.35 * k) / 0.6)
            if p <= 0: continue
            fs = int(170 * p) if word == "VALEU," else int(150 * p)
            if fs < 4: continue
            ff = font("InterDisplay-Black.otf", fs)
            w = ff.getbbox(word)[2]
            d.text((W // 2 - w // 2 + 6, y + 8), word, font=ff, fill=(0, 0, 0))
            d.text((W // 2 - w // 2, y), word, font=ff, fill=col)
        a = ease((t - 1.8) / 0.6)
        if a > 0:
            for k, line in enumerate(["Uma homenagem de toda a equipe", "para quem fez parte da nossa história"]):
                w = f_mid.getbbox(line)[2]
                col = tuple(int(c * a + NAVY[j] * (1 - a)) for j, c in enumerate(WHITE))
                d.text((W // 2 - w // 2, 1200 + k * 70 + int(20 * (1 - a))), line, font=f_mid, fill=col)
        return fr
    return fn


def outro_fn(thumbs):
    f_big = font("InterDisplay-Black.otf", 120)
    f_mid = font("InterDisplay-Bold.otf", 56)
    f_sm = font("InterDisplay-SemiBold.otf", 44)
    lock = brand_lockup(1.0)
    # thumbnails as polaroids circling
    tiles = []
    for p in thumbs:
        im = ImageOps.fit(Image.open(os.path.join(UP, p)).convert("RGB"), (240, 300), Image.LANCZOS)
        card = Image.new("RGBA", (264, 324), WHITE + (255,)); card.paste(im, (12, 12))
        tiles.append(card)
    rng = np.random.default_rng(3)
    pos = [(80 + (k % 4) * 240 + rng.integers(-30, 30), [40, 1420, 290][k // 4] + rng.integers(-20, 30) + (60 if k // 4 == 2 and k % 2 else 0), rng.uniform(-12, 12)) for k in range(len(tiles))]
    def fn(t, i, n):
        fr = gradient_bg(t + 3)
        for k, (card, (x, y, ang)) in enumerate(zip(tiles, pos)):
            p = ease_back((t - 0.08 * k) / 0.7)
            if p <= 0: continue
            c = card.rotate(ang + 4 * math.sin(t + k), expand=True, resample=Image.BICUBIC)
            c = c.resize((max(1, int(c.width * p)), max(1, int(c.height * p))), Image.BICUBIC)
            fr.alpha_composite(c, (int(x + 130 - c.width / 2), int(y + 160 - c.height / 2)))
        d = ImageDraw.Draw(fr)
        lines = [("OBRIGADO", f_big, WHITE, 640, 0.6), ("POR TUDO!", f_big, YEL, 770, 0.9),
                 ("Sucesso na nova jornada.", f_mid, WHITE, 960, 1.6),
                 ("Aqui você sempre terá amigos.", f_mid, WHITE, 1035, 2.0)]
        for txt, ff, col, y, st in lines:
            a = ease((t - st) / 0.6)
            if a <= 0: continue
            w = ff.getbbox(txt)[2]
            col2 = tuple(int(c * a + NAVY[j] * (1 - a)) for j, c in enumerate(col))
            d.text((W // 2 - w // 2, y + int(30 * (1 - a))), txt, font=ff, fill=col2)
        a = ease((t - 2.8) / 0.7)
        if a > 0:
            txt = "Com carinho, equipe"
            w = f_sm.getbbox(txt)[2]
            col2 = tuple(int(c * a + NAVY[j] * (1 - a)) for j, c in enumerate((200, 210, 240)))
            d.text((W // 2 - w // 2, 1170), txt, font=f_sm, fill=col2)
            l = lock.copy(); l.putalpha(l.getchannel("A").point(lambda v: int(v * a)))
            fr.alpha_composite(l, (W // 2 - l.width // 2, 1240))
        # final fade to black
        fo = ease((t - (n / FPS - 1.2)) / 1.2)
        if fo > 0:
            blk = Image.new("RGBA", (W, H), (0, 0, 0, int(255 * fo)))
            fr.alpha_composite(blk)
        return fr
    return fn


# ---------- video segment ----------
def video_segment(path, out, caption, ss=0.0, to=None, tag="momentos", gain_db=0.0):
    src = os.path.join(UP, path)
    info = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", src]))
    vs = [s for s in info["streams"] if s["codec_type"] == "video"][0]
    has_a = any(s["codec_type"] == "audio" for s in info["streams"])
    end = to if to else float(info["format"]["duration"])
    dur = round((end - ss) * FPS) / FPS
    vw, vh = int(vs["width"]), int(vs["height"])
    capp = os.path.join(SEG, os.path.basename(out) + ".cap.png")
    caption_img(caption, tag).save(capp)
    if os.path.exists(out):
        return dur
    ar = vw / vh
    if abs(ar - W / H) / (W / H) < 0.05:
        fg = f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}"
        fgpos = "0:0"
    else:
        fg = f"scale={W - 60}:{H}:force_original_aspect_ratio=decrease:flags=lanczos"
        fgpos = "(W-w)/2:(H-h)/2" if NOCAP else "(W-w)/2:(H-h)/2-120"
    fc = (f"[0:v]fps={FPS},setpts=PTS-STARTPTS,split[a][b];"
          f"[a]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,boxblur=12:2,scale={W}:{H},eq=brightness=-0.18:saturation=1.2[bg];"
          f"[b]{fg}[fg];[bg][fg]overlay={fgpos}" + (",format=yuv420p,setsar=1[v]" if NOCAP else "[v0];") + ("" if NOCAP else
          f"[1:v]format=rgba,fade=in:st=0.5:d=0.35:alpha=1[cap];"
          f"[v0][cap]overlay=x='-120*pow(1-min(max((t-0.5)/0.55,0),1),3)':y=1440:eval=frame:shortest=1,"
          f"format=yuv420p,setsar=1[v]"))
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", f"{dur}", "-i", src,
           "-loop", "1", "-framerate", str(FPS), "-t", f"{dur}", "-i", capp]
    a_idx = 2
    if has_a:
        fc += (f";[0:a]aresample=44100,aformat=channel_layouts=stereo,volume={gain_db}dB,"
               f"afade=in:d=0.15,afade=out:st={dur - 0.3}:d=0.3,apad,atrim=0:{dur}[a]")
    else:
        cmd += ["-f", "lavfi", "-t", f"{dur}", "-i", "anullsrc=r=44100:cl=stereo"]
        fc += ";[2:a]anull[a]"
    cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", f"{dur}", "-r", str(FPS),
            "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-c:a", "aac", "-b:a", "192k", out]
    subprocess.run(cmd, check=True)
    return dur


# ---------- timeline ----------
P = {  # photo files
    "duo": "27ed2512-image.jpg", "debi": "89fb09a3-image.jpg", "natal": "292dd45f-image.jpg",
    "celular": "3b8adca3-image.jpg", "vassoura": "9cb7f89d-image.jpg", "soro": "20389ce0-image.jpg",
    "saida": "ca2ca98b-image.jpg", "selfie_gorro": "2a8b6098-image.jpg", "gorro_risada": "ed9f56df-image.jpg",
    "tela": "ddf32009-image.jpg", "cowboy": "96d3afa9-image.jpg",
}
V = {
    "23": "0733823d-VID-20261016-WA0023.mp4", "24": "d82b6c75-VID-20261016-WA0024.mp4",
    "26": "ed8b5c22-VID-20261016-WA0026.mp4", "27": "91122834-VID-20261016-WA0027.mp4",
    "28": "cf660fff-VID-20261016-WA0028.mp4", "29": "b3feee3d-VID-20261016-WA0029.mp4",
    "30": "a895b088-VID-20261016-WA0030.mp4", "31": "b5bba860-VID-20261016-WA0031.mp4",
    "32": "7a115ae5-VID-20261016-WA0032.mp4",
}

PD = 4.4  # photo duration
timeline = [
    ("title", "intro", 5.5),
    ("photo", dict(path=P["natal"], caption="Uma equipe. Uma família.", crop=(0, 243, 900, 1440), tag="nossa equipe"), PD + 0.4),
    ("video", dict(path=V["27"], caption="Mais um dia normal na oficina", tag="bastidores")),
    ("photo", dict(path=P["duo"], caption="A dupla...", zoom=(1.0, 1.12), tag="parceria"), 3.6),
    ("photo", dict(path=P["debi"], caption="...qualquer semelhança é mera coincidência", tilt=3, tag="parceria"), PD),
    ("video", dict(path=V["29"], caption="Queda de braço valendo o cargo", tag="competição")),
    ("photo", dict(path=P["vassoura"], caption="Um varre, o outro supervisiona", pan=(0, -0.03)), PD),
    ("photo", dict(path=P["celular"], caption="Reunião estratégica", tilt=2), PD),
    ("video", dict(path=V["28"], caption="Treino de boxe ou dança?", tag="talentos")),
    ("photo", dict(path=P["cowboy"], caption="Rodeio no showroom", tilt=-3), PD),
    ("video", dict(path=V["24"], caption="Ninguém estava seguro", tag="pegadinhas")),
    ("photo", dict(path=P["soro"], caption="Nem o soro segurou", tag="guerreiro", pan=(0, 0.02)), PD),
    ("video", dict(path=V["30"], caption="Flagrado pelas câmeras", tag="ao vivo")),
    ("photo", dict(path=P["selfie_gorro"], caption="Espírito natalino em alta", tag="fim de ano"), PD),
    ("photo", dict(path=P["gorro_risada"], caption="Alegria que contagia", tag="fim de ano", pan=(0, -0.02)), PD),
    ("video", dict(path=V["23"], caption="Testando o equipamento", tag="bastidores")),
    ("video", dict(path=V["26"], caption="Estrela do TikTok", tag="talentos")),
    ("video", dict(path=V["32"], caption="Lá vai!", tag="bastidores")),
    ("photo", dict(path=P["tela"], caption="Até o papel de parede é da firma", tag="orgulho"), PD),
    ("video", dict(path=V["31"], caption="Pausa merecida", tag="descanso")),
    ("photo", dict(path="850e5cee-image.jpg", caption="Todo motivo vira festa", tag="comemorações"), PD),
    ("photo", dict(path="066f8324-image.jpg", caption="Parceiros pra toda hora", tag="amizade", tilt=2.5), PD),
    ("photo", dict(path="22d02337-image.jpg", caption="Momentos que ficam pra sempre", tag="comemorações", tilt=-2), PD),
    ("photo", dict(path=P["saida"], caption="A placa que ninguém queria ver...", tag="despedida", zoom=(1.0, 1.14)), PD + 0.6),
    ("title", "outro", 7.5),
]
TRANS = ["smoothup", "circleopen", "slideleft", "zoomin", "smoothleft", "wipeup", "radial", "coverleft",
         "fade", "smoothright", "diagtl", "revealup", "circleopen", "slideright", "zoomin", "smoothdown",
         "coverup", "fade", "radial", "smoothleft", "fadeblack"]

segs = []
thumbs = [P[k] for k in ["natal", "duo", "vassoura", "cowboy", "soro", "selfie_gorro", "gorro_risada", "tela"]] + ["850e5cee-image.jpg", "066f8324-image.jpg", "22d02337-image.jpg", P["vassoura"]]
for k, (kind, arg, *rest) in enumerate(timeline):
    out = os.path.join(SEG, f"s{k:02d}.mp4")
    if kind == "title":
        dur = rest[0]
        fn = intro_fn() if arg == "intro" else outro_fn(thumbs)
        if not os.path.exists(out):
            render(out, dur, fn)
    elif kind == "photo":
        dur = rest[0]
        a = dict(arg)
        if not os.path.exists(out):
            render(out, dur, photo_segment(a.pop("path"), dur, a.pop("caption"), **a))
    else:
        a = dict(arg)
        dur = video_segment(a.pop("path"), out, a.pop("caption"), **a)
    segs.append((out, dur))
    print(k, kind, round(dur, 2), flush=True)

# ---------- assemble with transitions ----------
inputs, fc = [], []
for p, _ in segs:
    inputs += ["-i", p]
for i in range(len(segs)):
    fc.append(f"[{i}:v]settb=AVTB,fps={FPS},format=yuv420p[v{i}]")
    fc.append(f"[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo[a{i}]")
off = 0.0; lv, la = "v0", "a0"
for i in range(1, len(segs)):
    off += segs[i - 1][1] - T
    tr = TRANS[(i - 1) % len(TRANS)]
    fc.append(f"[{lv}][v{i}]xfade=transition={tr}:duration={T}:offset={off:.3f}[x{i}]")
    fc.append(f"[{la}][a{i}]acrossfade=d={T}:c1=tri:c2=tri[y{i}]")
    lv, la = f"x{i}", f"y{i}"
total = off + segs[-1][1]
print("total", total)

music = os.path.join(WORK, "music.wav")
GAL = os.path.join(WORK, "galvao.wav")
MDELAY = 3.25 if os.path.exists(GAL) else 0.0
subprocess.run([sys.executable, "-I", os.path.join(HERE, "music.py"), f"{total - MDELAY:.3f}", music], check=True)
inputs += ["-i", music]
m = len(segs)
fc.append(f"[{la}]loudnorm=I=-16:TP=-2:LRA=11,aresample=44100,asplit=2[clips][key]")
fc.append(f"[{m}:a]volume=-9dB,adelay={int(MDELAY*1000)}:all=1,apad[mus]")
fc.append("[mus][key]sidechaincompress=threshold=0.02:ratio=6:attack=80:release=900:makeup=1[duck]")
if MDELAY:
    inputs += ["-i", GAL]
    fc.append(f"[{m+1}:a]adelay=250:all=1,volume=0.9,apad[gal]")
    fc.append("[duck][clips][gal]amix=inputs=3:normalize=0:duration=shortest,alimiter=limit=0.9[aout]")
else:
    fc.append("[duck][clips]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=11[aout]")
fcs = ";\n".join(fc)
with open(os.path.join(WORK, "assemble.txt"), "w") as fh:
    fh.write(fcs)
cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex_script", os.path.join(WORK, "assemble.txt"),
       "-map", f"[{lv}]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
       "-profile:v", "high", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", "-t", f"{total:.3f}", OUT]
subprocess.run(cmd, check=True)
print("done", OUT)
