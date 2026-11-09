#!/usr/bin/env python3
"""Typographic Open Graph images for the two French guides. No new figures."""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, BLUE, WHITE = (11, 61, 145), (30, 107, 214), (255, 255, 255)
MUTED = (200, 220, 245)
FONT_BOLD = "/usr/share/fonts/truetype/macos/Inter-Bold.ttf"
FONT_SEMI = "/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf"
ICON = os.path.join(ROOT, "public", "icons", "icon-512.png")

CARDS = [
    (
        "og-guide-luxembourg.png",
        "France–Luxembourg",
        "Compter ses 34 jours de télétravail",
    ),
    (
        "og-guide-geneva.png",
        "Genève",
        "40 % de télétravail et 10 jours de missions",
    ),
]


def font(size, wght=700):
    return ImageFont.truetype(FONT_BOLD if wght >= 700 else FONT_SEMI, size)


def draw(name, kicker, line):
    w, h, s = 1200, 630, 2
    im = Image.new("RGB", (w * s, h * s), NAVY)
    d = ImageDraw.Draw(im)
    d.rectangle((0, (h - 12) * s, w * s, h * s), fill=BLUE)
    icon = Image.open(ICON).convert("RGBA").resize((160 * s, 160 * s), Image.LANCZOS)
    im.paste(icon, (72 * s, 72 * s), icon)
    d.text((260 * s, 100 * s), "BorderDay", font=font(64 * s, 800), fill=WHITE)
    d.text((72 * s, 280 * s), kicker, font=font(42 * s, 600), fill=MUTED)
    d.text((72 * s, 360 * s), line, font=font(48 * s, 700), fill=WHITE)
    out = os.path.join(ROOT, "public", name)
    im.resize((w, h), Image.LANCZOS).save(out, "PNG")
    print(out)


if __name__ == "__main__":
    for card in CARDS:
        draw(*card)
