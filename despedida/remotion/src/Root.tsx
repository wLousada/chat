import React from 'react';
import { Composition } from 'remotion';
import { Despedida, FPS, totalFrames } from './Despedida';
import { Simples, simplesFrames } from './Simples';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="Simples" component={Simples} durationInFrames={simplesFrames} fps={FPS} width={1080} height={1920} />
  <Composition
    id="Despedida"
    component={Despedida}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1080}
    height={1920}
  />
  </>
);
