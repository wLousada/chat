import { Config } from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
if (!process.env.AUDIO_ONLY) {
  Config.setCodec('h264');
  Config.setCrf(18);
}
Config.setConcurrency(4);
// Use the Chromium already installed on this machine instead of downloading one.
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
