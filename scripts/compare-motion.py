"""Build labelled time-normalized comparisons; source recordings are never modified."""
import json
import pathlib
import subprocess
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path('artifacts/motion')
out = root / 'comparisons'
out.mkdir(exist_ok=True)
font = ImageFont.load_default(size=17)
small = ImageFont.load_default(size=13)

def duration(path):
    data = json.loads(subprocess.check_output(['ffprobe', '-v', 'quiet', '-show_format', '-of', 'json', str(path)]))
    return float(data['format']['duration'])

def frame(path, second, output):
    subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(max(0, second)), '-i', str(path), '-frames:v', '1', '-vf', 'scale=360:225', '-y', str(output)], check=True)
    return Image.open(output).convert('RGB')

def strip(name, files, title):
    sheet = Image.new('RGB', (1800, 285), '#e0e0da')
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 7), title, font=font, fill='#282828')
    for i, file in enumerate(files):
        sheet.paste(Image.open(file).convert('RGB').resize((360,225)), (i*360, 60))
        draw.text((i*360+10, 36), f'{i*25}% internal scene progress', font=small, fill='#282828')
    sheet.save(out / f'{name}.jpg', quality=94)

for reference in sorted(pathlib.Path('references/motion/recordings').glob('*.webm')):
    local = root / 'video' / reference.name
    if not local.exists():
        raise RuntimeError(f'Missing local counterpart: {local}')
    rd, ld = duration(reference), duration(local)
    sheet = Image.new('RGB', (1800, 560), '#e0e0da')
    draw = ImageDraw.Draw(sheet)
    draw.text((10, 5), reference.stem + ' - normalized video time, NOT matched scroll progress', font=font, fill='#282828')
    for row, (source, seconds, label) in enumerate([(reference, rd, 'SUPPLIED REFERENCE'), (local, ld, 'PHASE 1.5 LOCAL')]):
        y = 35 + row * 262
        for i, p in enumerate([0, .25, .5, .75, 1]):
            timestamp = min(seconds - .08, seconds*p)
            png = root / 'review' / f'{reference.stem}-{row}-{i}.png'
            shot = frame(source, timestamp, png)
            draw.text((i*360+7, y), f'{label} / {p*100:.0f}% / {timestamp:.2f}s', font=small, fill='#282828')
            sheet.paste(shot, (i*360, y+24))
    sheet.save(out / f'{reference.stem}.jpg', quality=94)
    # Equal 12-second durations permit simultaneous inspection; speed is deliberately normalized.
    filtergraph = (
        f'[0:v]setpts={12/rd}*PTS,scale=720:450,setsar=1,fps=24,'
        "drawtext=text='REFERENCE - normalized time':x=12:y=12:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.7[a];"
        f'[1:v]setpts={12/ld}*PTS,scale=720:450,setsar=1,fps=24,'
        "drawtext=text='LOCAL - normalized time':x=12:y=12:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.7[b];[a][b]hstack=shortest=1[v]"
    )
    subprocess.run(['ffmpeg', '-v','error','-i',str(reference),'-i',str(local),'-filter_complex',filtergraph,'-map','[v]','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','8','-crf','32','-b:v','0','-threads','4','-pix_fmt','yuv420p','-t','12','-y',str(out / f'{reference.stem}.webm')], check=True)

for feature in range(1,6):
    strip(f'feature-{feature}-progress', [root / 'frames' / f'feature-{feature}-{p}.png' for p in [0,25,50,75,100]], f'Dashboard feature {feature}: internal scene progression (same viewport and drawing)')
for name in ['workflow', 'ink']:
    strip(f'{name}-progress', [root / 'frames' / f'{name}-{p}.png' for p in [0,25,50,75,100]], f'{name.title()}: 0 / 25 / 50 / 75 / 100% scroll progress (boundary frames intentionally retained)')
print('Created 13 filmstrips and six normalized side-by-side videos.')

from html import escape
sections = []
for reference in sorted(pathlib.Path('references/motion/recordings').glob('*.webm')):
    name = reference.stem
    sections.append(f'''<section><h2>{escape(name)}</h2>
<p>Reference at left, local at right. Each clip is normalized to 12 seconds; these are not synchronized scroll positions. The original workflow and dashboard videos do not cover their complete narratives.</p>
<video controls preload="none" poster="comparisons/{name}.jpg" src="comparisons/{name}.webm"></video>
<p><a href="video/{name}.webm">Local recording at original speed</a> · <a href="../../references/motion/recordings/{reference.name}">Supplied recording</a></p>
<a href="comparisons/{name}.jpg"><img loading="lazy" alt="Reference and local filmstrip: {escape(name)}" src="comparisons/{name}.jpg"></a></section>''')
for name in ['workflow-progress', *[f'feature-{i}-progress' for i in range(1,6)], 'ink-progress']:
    sections.append(f'''<section><h2>{escape(name.replace('-', ' '))}</h2><a href="comparisons/{name}.jpg"><img loading="lazy" alt="Five controlled progress samples of {escape(name)}" src="comparisons/{name}.jpg"></a></section>''')
(root / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Heron — Phase 1.5 motion review</title>
<style>body{margin:0;background:#e0e0da;color:#282828;font:16px/1.5 system-ui}main{max-width:1440px;margin:auto;padding:32px}h1{font-size:40px;line-height:1.1}h2{font-size:23px}p{max-width:85ch}section{border-top:1px solid #b3b3af;padding:24px 0}img,video{display:block;width:100%;height:auto;margin:16px 0}a{color:inherit}video{background:#282828}code{font-size:14px}</style>
<main><h1>Heron · Motion review</h1><p>Phase 1.5 preserves the existing design and adds coordinated model and interface motion. This gallery shows intermediate states, full local recordings, and the limits of the supplied reference coverage.</p>
<p>Desktop capture: 1440 × 900. Additional viewport frames are in <code>frames/</code>. Detailed geometry samples: <a href="browser-findings.json">browser-findings.json</a>. Tests: <a href="playwright-production.log">production results</a>. Audit: <a href="../../MOTION_GAP_AUDIT.md">motion gap audit</a>.</p>
<p>The workflow video 03 ends on an initial floor plan; dashboard video 05 remains on One View. Missing-stage motion is reconstructed from the requested behavior and technical specifications. No motion-perfect fidelity is claimed.</p>''' + '\n'.join(sections) + '</main></html>')
assert len(list(out.glob('*.jpg'))) == 13
assert len(list(out.glob('*.webm'))) == 6
