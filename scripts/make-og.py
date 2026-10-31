#!/usr/bin/env python3
"""Draw public/og.png (1200x630): existing calendar icon on the LEFT, BorderDay wordmark, deep navy palette."""
from PIL import Image, ImageDraw, ImageFont
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, BLUE, INK, WHITE = (11, 61, 145), (30, 107, 214), (11, 61, 145), (255, 255, 255)
MUTED = (200, 220, 245)
FONT = "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf"
ICON = os.path.join(ROOT, "public", "icons", "icon-512.png")
OUT = os.path.join(ROOT, "public", "og.png")

def font(size, wght=700):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([min(size, 32), wght])
    except Exception:
        pass
    return f

def main():
    W, H, S = 1200, 630, 2
    im = Image.new("RGB", (W * S, H * S), NAVY)
    d = ImageDraw.Draw(im)
    d.rectangle((0, (H - 12) * S, W * S, H * S), fill=BLUE)
    icon = Image.open(ICON).convert("RGBA")
    side = 280 * S
    icon = icon.resize((side, side), Image.LANCZOS)
    # circular-ish pad behind icon
    pad = 24 * S
    box = (60 * S, (H * S - side) // 2)
    im.paste(icon, box, icon)
    x = box[0] + side + 48 * S
    d.text((x, 180 * S), "BorderDay", font=font(96 * S, 900), fill=WHITE)
    tag = "Cross-border day limits for HR and employees"
    ft = font(36 * S, 600)
    # wrap tagline
    words, lines, cur = tag.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=ft) > 620 * S:
            lines.append(cur)
            cur = w
        else:
            cur = t
    lines.append(cur)
    for i, ln in enumerate(lines):
        d.text((x, 320 * S + i * 48 * S), ln, font=ft, fill=MUTED)
    d.text((x, 460 * S), "borderday.com", font=font(28 * S, 500), fill=BLUE)
    im.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    print("wrote", OUT)

if __name__ == "__main__":
    main()
