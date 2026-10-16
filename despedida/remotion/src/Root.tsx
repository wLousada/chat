import React from 'react';
import { Composition } from 'remotion';
import { Despedida, FPS, totalFrames } from './Despedida';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Despedida"
    component={Despedida}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
