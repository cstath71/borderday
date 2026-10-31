"""Cut the BorderDay split-calendar logo out of logo-concepts-2.jpg, pixel for pixel.
Gus picked the top-left concept (calendar + BorderDay wordmark). Do not redraw or restyle.
"""
from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = Path('/workspace/borderday-assets/logo-concepts-2.jpg')
OUT = ROOT / 'public'
FULL_BOX = (95, 115, 535, 275)
ICON_BOX = (100, 115, 225, 275)

def flood_white_to_alpha(rgb_im, white_thresh=235):
    a = np.asarray(rgb_im).astype(float)
    H, W = a.shape[:2]
    white = a.min(2) > white_thresh
    out = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if white[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if white[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for Y, X in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= Y < H and 0 <= X < W and not out[Y, X] and white[Y, X]:
                out[Y, X] = True
                q.append((Y, X))
    band = np.asarray(Image.fromarray((out * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5))) > 0
    alpha = np.where(band, np.clip(1 - (a.min(2) - 180) / (255 - 180), 0, 1), 1.0)
    alpha = np.where(out, 0.0, alpha)
    alpha[alpha < 0.08] = 0
    rgb = a.copy()
    m = band & (alpha > 0) & (~out)
    with np.errstate(divide='ignore', invalid='ignore'):
        rgb[m] = np.clip((a[m] - (1 - alpha[m, None]) * 255) / np.maximum(alpha[m, None], 1e-6), 0, 255)
    rgba = np.dstack([rgb, alpha * 255]).round().astype('uint8')
    img = Image.fromarray(rgba, 'RGBA')
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def square_pad(img, size):
    bbox = img.getbbox() or (0, 0, img.width, img.height)
    img = img.crop(bbox)
    s = max(img.size)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    sq.alpha_composite(img, ((s - img.width) // 2, (s - img.height) // 2))
    return sq.resize((size, size), Image.Resampling.LANCZOS)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'icons').mkdir(exist_ok=True)
    im = Image.open(SRC).convert('RGB')
    full = flood_white_to_alpha(im.crop(FULL_BOX))
    icon = flood_white_to_alpha(im.crop(ICON_BOX))
    full.save(OUT / 'logo.png')
    pad = Image.new('RGBA', (full.width + 8, full.height + 8), (0, 0, 0, 0))
    pad.alpha_composite(full, (4, 4))
    pad.save(OUT / 'logo-header.png')
    for sz in (512, 192, 180, 152, 128, 96, 64, 48, 32):
        square_pad(icon, sz).save(OUT / 'icons' / f'icon-{sz}.png')
    square_pad(icon, 32).save(OUT / 'favicon.ico', format='ICO', sizes=[(32, 32), (16, 16)])
    og = Image.new('RGBA', (1200, 630), (11, 61, 145, 255))
    scale = min(900 / full.width, 220 / full.height)
    wm = full.resize((int(full.width * scale), int(full.height * scale)), Image.Resampling.LANCZOS)
    og.alpha_composite(wm, ((1200 - wm.width) // 2, (630 - wm.height) // 2 - 20))
    og.convert('RGB').save(OUT / 'og.png', quality=92)
    print('wrote logo assets to', OUT)

if __name__ == '__main__':
    main()
