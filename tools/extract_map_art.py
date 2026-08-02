#!/usr/bin/env python3
"""Extract Fantasy Tennis map-select thumbnails for stage detail dialogs."""
from __future__ import annotations

import argparse
import io
import json
import struct
import zipfile
from pathlib import Path

from PIL import Image


# Verified against GuardianStages names + visual inspection of UI11_Map thumbs.
# Map08 is DanceTime aesthetics in the shipped client package (not MonsLavaB).
BY_MAP_ID: dict[str, str] = {
    "0": "map00",
    "1": "map01",
    "2": "map02",
    "3": "map03",
    "4": "map04",
    "5": "map05",
    "6": "map06",
    "7": "map07",
}

BY_NAME: dict[str, str] = {
    "RubyCrab": "map00",
    "EmeraldBeach": "map01",
    "TwinkleTown": "map02",
    "Aeolos": "map03",
    "SnowMoon": "map04",
    "LifeWood": "map05",
    "Arena": "map06",
    "ArenaBoss": "map06",
    "MonsLava": "map07",
    "MonsLavaB": "map07",
    "DanceTime": "map08",
    "DanceTimeBoss": "map08",
}


def dds_dxt5(width: int, height: int, payload: bytes) -> bytes:
    header = struct.pack(
        "<I I I I I I I 11I",
        124,
        0x00081007,
        height,
        width,
        len(payload),
        0,
        0,
        *([0] * 11),
    )
    pixel_format = struct.pack("<I I 4s I I I I I", 32, 0x4, b"DXT5", 0, 0, 0, 0, 0)
    caps = struct.pack("<I I I I I", 0x1000, 0, 0, 0, 0)
    return b"DDS " + header + pixel_format + caps + payload


def decode_texture(texture: bytes, width: int, height: int) -> Image.Image:
    payload = texture[128:]
    raw_size = width * height * 4
    if len(payload) >= raw_size:
        return Image.frombytes("RGBA", (width, height), payload[:raw_size], "raw", "BGRA")
    return Image.open(
        io.BytesIO(dds_dxt5(width, height, payload[: width * height]))
    ).convert("RGBA")


def extract_map_art(client_root: Path, output_root: Path) -> None:
    sources = [
        (Path("Res") / "GuiRes" / "UI10.res", [f"UI11_Map{i:02d}.tex" for i in range(6)]),
        (
            Path("Res") / "GuiRes" / "UI10_1.res",
            [f"UI11_Map{i:02d}.tex" for i in range(6, 9)] + ["UI11_MapRandom.tex"],
        ),
    ]
    art_root = output_root / "map-art"
    art_root.mkdir(parents=True, exist_ok=True)
    files: dict[str, dict[str, str | int]] = {}

    for archive_rel, entries in sources:
        with zipfile.ZipFile(client_root / archive_rel) as archive:
            for entry in entries:
                if entry not in archive.namelist():
                    raise RuntimeError(f"Missing {entry} in {archive_rel}")
                image = decode_texture(archive.read(entry), 512, 256)
                file_name = f"{Path(entry).stem}.webp"
                image.save(art_root / file_name, "WEBP", quality=90, method=6)
                key = Path(entry).stem.replace("UI11_", "").lower()
                files[key] = {
                    "file": file_name,
                    "width": 512,
                    "height": 256,
                    "sourceArchive": archive_rel.as_posix(),
                    "sourceEntry": entry,
                }

    catalog = {
        "source": "Fantasy Tennis client UI map select thumbnails (UI11_Map*.tex)",
        "files": files,
        "byMapId": BY_MAP_ID,
        "byName": BY_NAME,
    }
    (output_root / "map-art-map.json").write_text(
        json.dumps(catalog, separators=(",", ":"), sort_keys=True),
        encoding="utf-8",
    )
    print(f"Extracted {len(files)} map thumbnails ({len(BY_NAME)} named mappings)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract authentic Fantasy Tennis map-select artwork",
    )
    parser.add_argument("--client-root", required=True, type=Path)
    parser.add_argument("--output-root", default=Path("assets"), type=Path)
    arguments = parser.parse_args()
    extract_map_art(arguments.client_root.resolve(), arguments.output_root.resolve())


if __name__ == "__main__":
    main()
