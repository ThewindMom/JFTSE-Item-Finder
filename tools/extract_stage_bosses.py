#!/usr/bin/env python3
"""Extract stage → boss guardian mapping from a JFTSE checkout."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from xml.etree import ElementTree


def load_bosses(path: Path) -> dict[str, dict[str, int | str]]:
    root = ElementTree.fromstring(path.read_text(encoding="utf-8"))
    bosses: dict[str, dict[str, int | str]] = {}
    for element in root:
        index = int(element.attrib["Index"])
        bosses[str(index)] = {
            "id": index,
            "name": element.attrib.get("Name_en")
            or element.attrib.get("GdName")
            or f"Boss {index}",
            "resId": int(element.attrib.get("ResID") or 0),
            "level": int(element.attrib.get("GdLevel") or 0),
            "hpBase": int(element.attrib.get("HPBase") or 0),
        }
    return bosses


def load_guardians(path: Path) -> dict[str, dict[str, int | str]]:
    root = ElementTree.fromstring(path.read_text(encoding="utf-8"))
    guardians: dict[str, dict[str, int | str]] = {}
    for element in root:
        index = int(element.attrib["Index"])
        guardians[str(index)] = {
            "id": index,
            "name": element.attrib.get("Name_en")
            or element.attrib.get("GdName")
            or f"Guardian {index}",
        }
    return guardians


def side_ids(stage: dict, key: str) -> list[int]:
    value = stage.get(key)
    if not isinstance(value, list):
        return []
    return [int(item) for item in value if isinstance(item, (int, float))]


def boss_ids(stage: dict) -> list[int]:
    raw = stage.get("BossGuardian")
    if isinstance(raw, list):
        return [int(item) for item in raw if isinstance(item, (int, float)) and int(item) > 0]
    if isinstance(raw, (int, float)) and int(raw) > 0:
        return [int(raw)]
    return []


def extract_stage_bosses(jftse_root: Path, output_root: Path) -> None:
    stages_path = jftse_root / "server-core" / "src" / "main" / "resources" / "res" / "GuardianStages.json"
    boss_path = jftse_root / "auth-server" / "src" / "main" / "resources" / "res" / "BossGuardianInfo_Ini3.xml"
    guardian_path = jftse_root / "auth-server" / "src" / "main" / "resources" / "res" / "GuardianInfo.xml"

    stages = json.loads(stages_path.read_text(encoding="utf-8"))
    if not isinstance(stages, list):
        raise RuntimeError("GuardianStages.json must be a JSON array")

    stage_entries: dict[str, dict] = {}
    by_map_id: dict[str, list[str]] = {}
    for stage in stages:
        if not isinstance(stage, dict):
            continue
        name = stage.get("Name")
        if not isinstance(name, str):
            continue
        map_id = stage.get("MapId") if isinstance(stage.get("MapId"), int) else None
        entry = {
            "name": name,
            "mapId": map_id,
            "isBossStage": bool(stage.get("IsBossStage")),
            "bossIds": boss_ids(stage),
            "sideGuardianIds": {
                "left": side_ids(stage, "GuardiansLeft"),
                "middle": side_ids(stage, "GuardiansMiddle"),
                "right": side_ids(stage, "GuardiansRight"),
            },
            "expMultiplier": stage.get("ExpMultiplier")
            if isinstance(stage.get("ExpMultiplier"), (int, float))
            else None,
            "bossTriggerTimerInSeconds": stage.get("BossTriggerTimerInSeconds")
            if isinstance(stage.get("BossTriggerTimerInSeconds"), (int, float))
            else None,
        }
        stage_entries[name] = entry
        if map_id is not None:
            by_map_id.setdefault(str(map_id), []).append(name)

    catalog = {
        "source": {
            "guardianStages": "server-core/src/main/resources/res/GuardianStages.json",
            "bossGuardianInfo": "auth-server/src/main/resources/res/BossGuardianInfo_Ini3.xml",
            "guardianInfo": "auth-server/src/main/resources/res/GuardianInfo.xml",
            "jftseRoot": str(jftse_root),
        },
        "bosses": load_bosses(boss_path),
        "guardians": load_guardians(guardian_path),
        "stages": stage_entries,
        "byMapId": by_map_id,
    }
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "stage-bosses.json").write_text(
        json.dumps(catalog, separators=(",", ":"), sort_keys=True),
        encoding="utf-8",
    )
    boss_stage_count = sum(1 for entry in stage_entries.values() if entry["bossIds"])
    print(
        f"Extracted {len(stage_entries)} stages "
        f"({boss_stage_count} with bosses), "
        f"{len(catalog['bosses'])} boss guardians, "
        f"{len(catalog['guardians'])} guardians"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract JFTSE stage → boss guardian mapping for the item finder",
    )
    parser.add_argument("--jftse-root", required=True, type=Path)
    parser.add_argument("--output-root", default=Path("assets"), type=Path)
    arguments = parser.parse_args()
    extract_stage_bosses(arguments.jftse_root.resolve(), arguments.output_root.resolve())


if __name__ == "__main__":
    main()
