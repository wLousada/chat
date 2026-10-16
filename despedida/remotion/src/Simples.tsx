import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

// Plain version: photos and clips on black, simple crossfades, no titles or effects.
const T = 15;
const PH = 105; // 3.5 s per photo

type Item = { src: string; frames: number; video?: boolean; audio?: boolean } | { end: true; frames: number };

const ITEMS: Item[] = [
  { src: '292dd45f.jpg', frames: 130 },
  { src: 'v27.mp4', frames: 540, video: true, audio: true },
  { src: '27ed2512.jpg', frames: PH },
  { src: '89fb09a3.jpg', frames: PH },
  { src: 'v29.mp4', frames: 276, video: true, audio: true },
  { src: '9cb7f89d.jpg', frames: PH },
  { src: '3b8adca3.jpg', frames: PH },
  { src: 'v28.mp4', frames: 158, video: true, audio: true },
  { src: '96d3afa9.jpg', frames: PH },
  { src: 'v24.mp4', frames: 204, video: true, audio: true },
  { src: '20389ce0.jpg', frames: PH },
  { src: 'v30.mp4', frames: 211, video: true, audio: true },
  { src: '2a8b6098.jpg', frames: PH },
  { src: 'ed9f56df.jpg', frames: PH },
  { src: 'v23.mp4', frames: 145, video: true, audio: true },
  { src: 'v26.mp4', frames: 90, video: true, audio: true },
  { src: 'v32.mp4', frames: 232, video: true, audio: true },
  { src: 'ddf32009.jpg', frames: PH },
  { src: 'v31.mp4', frames: 312, video: true },
  { src: '850e5cee.jpg', frames: PH },
  { src: '066f8324.jpg', frames: PH },
  { src: '22d02337.jpg', frames: PH },
  { src: 'ca2ca98b.jpg', frames: PH },
  { end: true, frames: 120 },
];

const starts: number[] = [];
{
  let s = 0;
  ITEMS.forEach((it, i) => {
    starts.push(s);
    s += it.frames - (i < ITEMS.length - 1 ? T : 0);
  });
}
export const simplesFrames = starts[starts.length - 1] + ITEMS[ITEMS.length - 1].frames;

const MUSIC_AT = 105;
const ducks = ITEMS.map((it, i) => ({ it, s: starts[i] }))
  .filter(({ it }) => 'video' in it && it.audio)
  .map(({ it, s }) => [s, s + it.frames] as const);

const musicVolume = (f: number) => {
  const g = f + MUSIC_AT;
  let v = 0.16;
  for (const [a, b] of ducks) {
    const d = interpolate(g, [a - 10, a + 10, b - 15, b + 10], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    v = Math.min(v, 0.16 - d * 0.13);
  }
  const fadeIn = interpolate(f, [0, 45], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(g, [simplesFrames - 75, simplesFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return v * fadeIn * fadeOut;
};

const Clip: React.FC<{ src: string; frames: number }> = ({ src, frames }) => {
  const frame = useCurrentFrame();
  const vol = interpolate(frame, [0, 8, frames - 12, frames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <OffthreadVideo src={staticFile(src)} volume={vol} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
};

const End: React.FC = () => (
  <AbsoluteFill style={{ background: 'black', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 84 }}>Valeu, parceiro!</div>
  </AbsoluteFill>
);

export const Simples: React.FC = () => (
  <AbsoluteFill style={{ background: 'black' }}>
    <TransitionSeries>
      {ITEMS.flatMap((it, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={it.frames}>
            <AbsoluteFill style={{ background: 'black' }}>
              {'end' in it ? (
                <End />
              ) : it.video ? (
                <Clip src={it.src} frames={it.frames} />
              ) : (
                <Img src={staticFile(it.src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </AbsoluteFill>
          </TransitionSeries.Sequence>
        );
        return i === ITEMS.length - 1
          ? [seq]
          : [seq, <TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: T })} />];
      })}
    </TransitionSeries>
    <Sequence from={8}>
      <Audio src={staticFile('galvao.wav')} />
    </Sequence>
    <Sequence from={MUSIC_AT}>
      <Audio src={staticFile('music.wav')} volume={musicVolume} />
    </Sequence>
  </AbsoluteFill>
);
