#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
import json
import struct
import subprocess
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from PIL import Image


AES_KEY_HEX = "54494d4f5445495f5a494f4e00000000"


def decrypt_set(archive: zipfile.ZipFile, entry: str) -> bytes:
    encrypted = archive.read(entry)
    completed = subprocess.run(
        [
            "openssl",
            "enc",
            "-d",
            "-aes-128-ecb",
            "-K",
            AES_KEY_HEX,
            "-nopad",
        ],
        input=encrypted[1:],
        capture_output=True,
        check=True,
    )
    return completed.stdout[: -encrypted[0]]


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


def decode_texture(texture: bytes, width: int) -> Image.Image:
    payload = texture[128:]
    raw_size = width * width * 4
    if len(payload) >= raw_size:
        return Image.frombytes("RGBA", (width, width), payload[:raw_size], "raw", "BGRA")

    dxt5_size = width * width
    return Image.open(io.BytesIO(dds_dxt5(width, width, payload[:dxt5_size]))).convert("RGBA")


def build_sheet_index(gui_root: Path, wanted: set[str]) -> dict[str, tuple[Path, str]]:
    found: dict[str, tuple[Path, str]] = {}
    for archive_path in sorted(gui_root.glob("Item*.res")):
        with zipfile.ZipFile(archive_path) as archive:
            for entry in archive.namelist():
                stem = Path(entry).stem
                if stem in wanted:
                    found[stem] = (archive_path, entry)
    missing = wanted - found.keys()
    if missing:
        raise RuntimeError(f"Missing sprite sheets: {', '.join(sorted(missing))}")
    return found


def extract_item_art(client_root: Path, output_root: Path) -> None:
    script_archive_path = client_root / "Res" / "Script" / "Item.res"
    with zipfile.ZipFile(script_archive_path) as script_archive:
        icon_root = ElementTree.fromstring(
            decrypt_set(script_archive, "Info_Item_Icon.set").decode("utf-8")
        )
        item_root = ElementTree.fromstring(
            decrypt_set(script_archive, "Item_Parts.set").decode("utf-8")
        )

    sheets = {
        element.attrib["Name"]: {
            "lineCount": int(element.attrib["LineCount"]),
            "size": int(element.attrib["Size"]),
            "space": int(element.attrib["Space"]),
        }
        for element in icon_root
    }
    items: dict[str, list[str | int]] = {}
    used_sheets: set[str] = set()
    for element in item_root:
        icon = element.attrib["Icon"]
        sheet, cell_text = icon.rsplit("_", 1)
        items[element.attrib["Index"]] = [sheet, int(cell_text)]
        used_sheets.add(sheet)

    sprite_entries = build_sheet_index(client_root / "Res" / "GuiRes", used_sheets)
    art_root = output_root / "item-art"
    art_root.mkdir(parents=True, exist_ok=True)
    expected_files = {f"{sheet}.webp" for sheet in used_sheets}
    for stale in art_root.glob("*.webp"):
        if stale.name not in expected_files:
            stale.unlink()

    for sheet in sorted(used_sheets):
        geometry = sheets[sheet]
        width = (
            geometry["lineCount"] * geometry["size"]
            + (geometry["lineCount"] + 1) * geometry["space"]
        )
        archive_path, entry = sprite_entries[sheet]
        with zipfile.ZipFile(archive_path) as archive:
            image = decode_texture(archive.read(entry), width)
        image.save(art_root / f"{sheet}.webp", "WEBP", lossless=True, method=6)
        geometry["width"] = width

    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "item-art-map.json").write_text(
        json.dumps(
            {
                "items": items,
                "sheets": {sheet: sheets[sheet] for sheet in sorted(used_sheets)},
            },
            separators=(",", ":"),
            sort_keys=True,
        ),
        encoding="utf-8",
    )
    print(f"Extracted {len(used_sheets)} sprite sheets for {len(items)} items")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract authentic Fantasy Tennis item artwork")
    parser.add_argument("--client-root", required=True, type=Path)
    parser.add_argument("--output-root", default=Path("assets"), type=Path)
    arguments = parser.parse_args()
    extract_item_art(arguments.client_root.resolve(), arguments.output_root.resolve())


if __name__ == "__main__":
    main()
