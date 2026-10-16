import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';

export const FPS = 30;
const W = 1080;
const H = 1920;
const T = 20; // transition length in frames

const NAVY = '#0e1e4e';
const BLUE = '#1c3fa0';
const DEEP = '#060e2c';
const YELLOW = '#ffc400';

// ---------- timeline ----------
type Scene =
  | { kind: 'intro'; frames: number }
  | { kind: 'outro'; frames: number }
  | { kind: 'photo'; src: string; frames: number; full?: boolean; tilt?: number }
  | { kind: 'video'; src: string; frames: number; cover: boolean; audio: boolean };

const PH = 135; // photo length (4.5 s)

const SCENES: Scene[] = [
  { kind: 'intro', frames: 165 },
  { kind: 'photo', src: '292dd45f.jpg', frames: 150, tilt: -2 },
  { kind: 'video', src: 'v27.mp4', frames: 540, cover: true, audio: true },
  { kind: 'photo', src: '27ed2512.jpg', frames: 110, full: true },
  { kind: 'photo', src: '89fb09a3.jpg', frames: PH, tilt: 3 },
  { kind: 'video', src: 'v29.mp4', frames: 276, cover: false, audio: true },
  { kind: 'photo', src: '9cb7f89d.jpg', frames: PH, full: true },
  { kind: 'photo', src: '3b8adca3.jpg', frames: PH, tilt: 2 },
  { kind: 'video', src: 'v28.mp4', frames: 158, cover: false, audio: true },
  { kind: 'photo', src: '96d3afa9.jpg', frames: PH, tilt: -3 },
  { kind: 'video', src: 'v24.mp4', frames: 204, cover: true, audio: true },
  { kind: 'photo', src: '20389ce0.jpg', frames: PH, full: true },
  { kind: 'video', src: 'v30.mp4', frames: 211, cover: false, audio: true },
  { kind: 'photo', src: '2a8b6098.jpg', frames: PH, full: true },
  { kind: 'photo', src: 'ed9f56df.jpg', frames: PH, full: true },
  { kind: 'video', src: 'v23.mp4', frames: 145, cover: true, audio: true },
  { kind: 'video', src: 'v26.mp4', frames: 90, cover: true, audio: true },
  { kind: 'video', src: 'v32.mp4', frames: 232, cover: true, audio: true },
  { kind: 'photo', src: 'ddf32009.jpg', frames: PH, full: true },
  { kind: 'video', src: 'v31.mp4', frames: 312, cover: true, audio: false },
  { kind: 'photo', src: '850e5cee.jpg', frames: PH, tilt: -2 },
  { kind: 'photo', src: '066f8324.jpg', frames: PH, tilt: 2.5 },
  { kind: 'photo', src: '22d02337.jpg', frames: PH, tilt: -2 },
  { kind: 'photo', src: 'ca2ca98b.jpg', frames: 160, full: true },
  { kind: 'outro', frames: 270 },
];

const starts: number[] = [];
{
  let s = 0;
  SCENES.forEach((sc, i) => {
    starts.push(s);
    s += sc.frames - (i < SCENES.length - 1 ? T : 0);
  });
}
export const totalFrames = starts[starts.length - 1] + SCENES[SCENES.length - 1].frames;

const GALVAO_AT = 8; // frames
const MUSIC_AT = 105; // music comes in right after "Bem, amigos... terminou!"

// ---------- fonts ----------
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      ['Black', 900],
      ['ExtraBold', 800],
      ['Bold', 700],
      ['SemiBold', 600],
    ].map(([n, w]) => new FontFace('InterDisplay', `url(${staticFile(`InterDisplay-${n}.otf`)})`, { weight: String(w) }));
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

// ---------- brand pieces ----------
const HouseIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect width="100" height="100" rx="22" fill={YELLOW} />
    <path d="M22 50 50 25 78 50M30 47v29h40V47" fill="none" stroke={NAVY} strokeWidth="8.5" strokeLinejoin="round" strokeLinecap="round" />
    <rect x="43" y="58" width="14" height="18" fill={NAVY} />
  </svg>
);

const Lockup: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 * scale }}>
    <HouseIcon size={110 * scale} />
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontWeight: 900, fontSize: 82 * scale, lineHeight: 0.9, color: 'white', letterSpacing: -1 }}>casa</div>
      <div style={{ fontWeight: 700, fontSize: 40 * scale, color: YELLOW }}>do construtor</div>
    </div>
  </div>
);

const Tape: React.FC<{ top: number; rotate: number; dir: 1 | -1; delay: number }> = ({ top, rotate, dir, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: -300,
        width: W + 600,
        top,
        height: 112,
        rotate: `${rotate}deg`,
        transform: `translateX(${(1 - p) * dir * -1700}px)`,
        background: `repeating-linear-gradient(45deg, ${YELLOW} 0 56px, ${NAVY} 56px 112px)`,
        backgroundPosition: `${frame * 3 * dir}px 0`,
        boxShadow: '0 18px 50px rgba(0,0,0,.45)',
      }}
    />
  );
};

const Bg: React.FC<{ shift?: number }> = ({ shift = 0 }) => {
  const frame = useCurrentFrame();
  const x = 50 + 12 * Math.sin((frame + shift) / 40);
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}% 38%, ${BLUE}, ${DEEP} 85%)` }} />;
};

// ---------- scenes ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: frame - d, fps, config: { damping: 9, stiffness: 140 } });
  const rise = (d: number) => interpolate(frame, [d, d + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Bg />
      <Tape top={230} rotate={-8} dir={1} delay={0} />
      <Tape top={1560} rotate={6} dir={-1} delay={4} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 60, textAlign: 'center' }}>
        <div style={{ opacity: rise(8), transform: `translateY(${(1 - rise(8)) * 40}px)` }}>
          <Lockup scale={1.15} />
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 190, lineHeight: 0.95, color: 'white', transform: `scale(${pop(24)})`, textShadow: '8px 8px 0 rgba(0,0,0,.45)' }}>
            VALEU,
          </div>
          <div style={{ fontWeight: 900, fontSize: 160, lineHeight: 1, color: YELLOW, transform: `scale(${pop(36)})`, textShadow: '8px 8px 0 rgba(0,0,0,.45)' }}>
            PARCEIRO!
          </div>
        </div>
        <div style={{ opacity: rise(58), transform: `translateY(${(1 - rise(58)) * 30}px)`, fontWeight: 700, fontSize: 50, lineHeight: 1.35, color: '#c8d2f0', maxWidth: 860 }}>
          Uma homenagem de toda a equipe para quem fez parte da nossa história
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ src: string; frames: number; full?: boolean; tilt?: number }> = ({ src, frames, full, tilt = -2.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = frame / frames;
  if (full) {
    const z = interpolate(p, [0, 1], [1.0, 1.12]);
    return (
      <AbsoluteFill style={{ background: DEEP, overflow: 'hidden' }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateY(${-p * 1.5}%)` }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 60%, rgba(4,10,35,.55))' }} />
      </AbsoluteFill>
    );
  }
  const s = spring({ frame, fps, config: { damping: 11, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: DEEP, overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', inset: -80, width: W + 160, height: H + 160, objectFit: 'cover', filter: 'blur(40px) brightness(.45) saturate(1.2)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: 'white',
            padding: 22,
            boxShadow: '0 30px 80px rgba(0,0,0,.6)',
            transform: `scale(${0.85 + 0.15 * s + 0.04 * p}) rotate(${tilt * (1 - 0.6 * p)}deg) translateY(${-p * 20}px)`,
          }}
        >
          <Img src={staticFile(src)} style={{ display: 'block', width: 920, height: 'auto' }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ src: string; cover: boolean; frames: number }> = ({ src, cover, frames }) => {
  const frame = useCurrentFrame();
  // soften the clip's own audio at the edges so transitions don't click
  const vol = interpolate(frame, [0, 8, frames - 12, frames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: DEEP, overflow: 'hidden' }}>
      {!cover && (
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{ position: 'absolute', inset: -80, width: W + 160, height: H + 160, objectFit: 'cover', filter: 'blur(40px) brightness(.4) saturate(1.2)' }}
        />
      )}
      <OffthreadVideo src={staticFile(src)} volume={vol} style={{ width: '100%', height: '100%', objectFit: cover ? 'cover' : 'contain' }} />
    </AbsoluteFill>
  );
};

const POLAS = ['292dd45f.jpg', '850e5cee.jpg', '066f8324.jpg', '22d02337.jpg', '27ed2512.jpg', '2a8b6098.jpg', 'ed9f56df.jpg', '9cb7f89d.jpg'];
const POS: [number, number, number][] = [
  [30, 40, -8], [290, 10, 6], [560, 50, -5], [800, 20, 9],
  [40, 1500, 7], [300, 1540, -6], [560, 1510, 5], [810, 1550, -9],
];

const Outro: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: frame - d, fps, config: { damping: 10, stiffness: 130 } });
  const rise = (d: number) => interpolate(frame, [d, d + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const black = interpolate(frame, [frames - 45, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Bg shift={90} />
      {POLAS.map((p, i) => (
        <div
          key={p}
          style={{
            position: 'absolute',
            left: POS[i][0],
            top: POS[i][1],
            width: 250,
            background: 'white',
            padding: '12px 12px 34px',
            boxShadow: '0 12px 30px rgba(0,0,0,.5)',
            transform: `scale(${pop(i * 3)}) rotate(${POS[i][2] + 3 * Math.sin((frame + i * 20) / 30)}deg)`,
          }}
        >
          <Img src={staticFile(p)} style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }} />
        </div>
      ))}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 44, textAlign: 'center' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 130, lineHeight: 1, color: 'white', transform: `scale(${pop(18)})`, textShadow: '7px 7px 0 rgba(0,0,0,.45)' }}>OBRIGADO</div>
          <div style={{ fontWeight: 900, fontSize: 130, lineHeight: 1.05, color: YELLOW, transform: `scale(${pop(28)})`, textShadow: '7px 7px 0 rgba(0,0,0,.45)' }}>POR TUDO!</div>
        </div>
        <div style={{ opacity: rise(50), transform: `translateY(${(1 - rise(50)) * 30}px)`, fontWeight: 700, fontSize: 56, lineHeight: 1.35, color: 'white' }}>
          Sucesso na nova jornada.
          <br />
          Aqui você sempre terá amigos.
        </div>
        <div style={{ opacity: rise(85), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 42, color: '#c8d2f0' }}>Com carinho, equipe</div>
          <Lockup />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'black', opacity: black }} />
    </AbsoluteFill>
  );
};

// ---------- transitions ----------
const transitionFor = (i: number) => {
  const list = [
    () => slide({ direction: 'from-bottom' }),
    () => clockWipe({ width: W, height: H }),
    () => slide({ direction: 'from-right' }),
    () => fade(),
    () => wipe({ direction: 'from-left' }),
    () => flip({ direction: 'from-right' }),
    () => wipe({ direction: 'from-top-left' }),
    () => fade(),
  ];
  return list[i % list.length]();
};

// ---------- audio ----------
const videoRanges = SCENES.map((s, i) => ({ s, start: starts[i] }))
  .filter(({ s }) => s.kind === 'video' && s.audio)
  .map(({ s, start }) => [start, start + s.frames] as const);

const musicVolume = (f: number) => {
  const g = f + MUSIC_AT; // global frame
  let v = 0.2;
  for (const [a, b] of videoRanges) {
    const d = interpolate(g, [a - 10, a + 10, b - 15, b + 10], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    v = Math.min(v, 0.2 - d * 0.16);
  }
  const fadeIn = interpolate(f, [0, 45], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(g, [totalFrames - 90, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return v * fadeIn * fadeOut;
};

export const Despedida: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: DEEP, fontFamily: 'InterDisplay, sans-serif' }}>
      <TransitionSeries>
        {SCENES.flatMap((s, i) => {
          const el = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.frames}>
              {s.kind === 'intro' && <Intro />}
              {s.kind === 'outro' && <Outro frames={s.frames} />}
              {s.kind === 'photo' && <Photo src={s.src} frames={s.frames} full={s.full} tilt={s.tilt} />}
              {s.kind === 'video' && <Clip src={s.src} cover={s.cover} frames={s.frames} />}
            </TransitionSeries.Sequence>
          );
          if (i === SCENES.length - 1) return [el];
          return [
            el,
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={transitionFor(i)}
              timing={i % 3 === 1 ? springTiming({ config: { damping: 200 }, durationInFrames: T }) : linearTiming({ durationInFrames: T })}
            />,
          ];
        })}
      </TransitionSeries>
      <Sequence from={GALVAO_AT}>
        <Audio src={staticFile('galvao.wav')} volume={1} />
      </Sequence>
      <Sequence from={MUSIC_AT}>
        <Audio src={staticFile('music.wav')} volume={musicVolume} />
      </Sequence>
    </AbsoluteFill>
  );
};
