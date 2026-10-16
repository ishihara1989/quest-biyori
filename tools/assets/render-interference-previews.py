"""Mechanical playback previews of the generated, extracted RGBA frames."""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
for folder, name, character in [
    ('public/assets/paladin/motions/break-strike', 'break-strike', True),
    ('public/assets/skills/paladin/effects/break-impact', 'break-impact', False),
]:
    base = ROOT / folder
    preview = ROOT / folder.replace("public/assets/", "development/assets/")
    preview.mkdir(parents=True, exist_ok=True)
    frames = [Image.open(base / f'{name}-{i:02d}.png').convert('RGBA').resize((512, 512), Image.Resampling.NEAREST) for i in range(1, 5)]
    frames[0].save(preview / (f'paladin-{name}-preview.gif' if character else f'{name}-preview.gif'),
                   save_all=True, append_images=frames[1:],
                   duration=[150, 90, 100, 320] if character else [140, 140, 140, 140], disposal=2)
    Image.open(base / f'{name}.png').save(preview / 'review.png')
print('Saved GIF playback previews and RGBA contact sheets.')
