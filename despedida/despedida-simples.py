import subprocess, sys, os
P = sys.argv[1]; S = sys.argv[2]
items = [('292dd45f.jpg',4.3),('v27.mp4',18.0),('27ed2512.jpg',3.5),('89fb09a3.jpg',3.5),('v29.mp4',9.2),('9cb7f89d.jpg',3.5),('3b8adca3.jpg',3.5),('v28.mp4',5.25),('96d3afa9.jpg',3.5),('v24.mp4',6.8),('20389ce0.jpg',3.5),('v30.mp4',7.0),('2a8b6098.jpg',3.5),('ed9f56df.jpg',3.5),('v23.mp4',4.8),('v26.mp4',3.0),('v32.mp4',7.7),('ddf32009.jpg',3.5),('v31.mp4',10.4),('850e5cee.jpg',3.5),('066f8324.jpg',3.5),('22d02337.jpg',3.5),('ca2ca98b.jpg',3.5)]
T = 0.5
inputs, fc = [], []
for i, (f, d) in enumerate(items):
    src = os.path.join(P, f)
    inputs += (['-loop', '1', '-t', str(d), '-i', src] if f.endswith('.jpg') else ['-t', str(d), '-i', src])
    fc.append(f"[{i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p,trim=duration={d},setpts=PTS-STARTPTS[v{i}]")
n = len(items)
inputs += ['-f', 'lavfi', '-t', '4', '-i', 'color=black:s=1080x1920:r=30']
fc.append(f"[{n}:v]drawtext=fontfile=/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf:text='Valeu, parceiro!':fontcolor=white:fontsize=84:x=(w-tw)/2:y=(h-th)/2,format=yuv420p,setsar=1[v{n}]")
durs = [d for _, d in items] + [4]
off = 0; last = 'v0'
for i in range(1, n + 1):
    off += durs[i - 1] - T
    fc.append(f"[{last}][v{i}]xfade=transition=fade:duration={T}:offset={off:.3f}[x{i}]"); last = f"x{i}"
total = off + durs[-1]
starts = []; s = 0
for d in durs:
    starts.append(s); s += d - T
al = []
for i, (f, d) in enumerate(items):
    if f.endswith('.mp4') and f != 'v31.mp4':
        fc.append(f"[{i}:a]atrim=0:{d},afade=in:d=0.2,afade=out:st={d - 0.4}:d=0.4,adelay={int(starts[i] * 1000)}:all=1[a{i}]"); al.append(f"[a{i}]")
g, m = n + 1, n + 2
inputs += ['-i', os.path.join(P, 'galvao.wav'), '-i', os.path.join(P, 'music.wav')]
fc.append(f"[{g}:a]adelay=250:all=1,apad[gal]")
fc.append(f"{''.join(al)}amix=inputs={len(al)}:normalize=0,apad[clips]")
fc.append("[clips]asplit[c1][key]")
fc.append(f"[{m}:a]volume=0.16,adelay=3500:all=1,afade=in:st=3.5:d=1.5,afade=out:st={total - 3}:d=3,apad[mus]")
fc.append("[mus][key]sidechaincompress=threshold=0.02:ratio=10:attack=60:release=700[duck]")
fc.append(f"[duck][c1][gal]amix=inputs=3:normalize=0,atrim=0:{total},alimiter=limit=0.9[aout]")
open(os.path.join(S, 'fc.txt'), 'w').write(';\n'.join(fc))
cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex_script', os.path.join(S, 'fc.txt'), '-map', f'[{last}]', '-map', '[aout]', '-t', f'{total:.3f}',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', os.path.join(S, 'simples.mp4')]
subprocess.run(cmd, check=True); print('total', total)
