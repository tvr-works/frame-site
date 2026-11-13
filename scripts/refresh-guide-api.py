"""Snapshot native parser declarations; never run or modify the native app."""

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = SITE_ROOT / "tests/fixtures/native-guide-api.json"


def native_inventory(source):
    revision = subprocess.check_output(
        ["git", "-C", str(source), "rev-parse", "HEAD"], text=True
    ).strip()
    if subprocess.check_output(
        ["git", "-C", str(source), "status", "--porcelain"], text=True
    ).strip():
        raise ValueError("Native source must be clean before recording its API")
    files = {}

    def read(relative):
        content = (source / relative).read_text()
        files[relative] = hashlib.sha256(content.encode()).hexdigest()
        return content

    manifest = read("Sources/Common/cmdArgs/cmdArgsManifest.swift")
    enum = manifest.split("func initSubcommands", 1)[0]
    cases = re.findall(r'^\s*case (\w+)(?: = "([^"]+)")?\s*$', enum, re.M)
    if not cases:
        raise ValueError("No native command declarations found")
    commands = []
    for case, spelling in cases:
        name = spelling or case
        relative = f"Sources/Common/cmdArgs/impl/{case[0].upper()}{case[1:]}CmdArgs.swift"
        parser = read(relative)
        flags = re.search(r"flags:\s*\[(.*?)\],\s*posArgs:", parser, re.S)
        if flags is None:
            raise ValueError(f"Cannot inspect flags for {name}; review parser format")
        commands.append({
            "name": name,
            "flags": sorted(set(re.findall(r'"(--[\w-]+)"\s*:', flags[1]))),
        })
    config = read("Sources/FrameMacOS/config/parseConfig.swift")
    constants = dict(re.findall(r'private let (\w+) = "([^"]+)"', config))
    parser = config.split("private let configParser:", 1)[1].split("\n]", 1)[0]
    keys = []
    for literal, constant in re.findall(r'^\s*(?:"([^"]+)"|(\w+)):\s*Parser\(', parser, re.M):
        keys.append(literal or constants[constant])
    if len(keys) != len(set(keys)) or not keys:
        raise ValueError("Missing or duplicate native configuration keys")
    return {
        "repository": "tvr-works/frame",
        "revision": revision,
        "sourceSha256": dict(sorted(files.items())),
        "commands": sorted(commands, key=lambda command: command["name"]),
        "configKeys": sorted(keys),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("native_source", type=Path)
    parser.add_argument("--check", action="store_true", help="Compare without writing")
    args = parser.parse_args()
    inventory = native_inventory(args.native_source.resolve())
    if args.check:
        if inventory != json.loads(SNAPSHOT.read_text()):
            raise SystemExit("Native guide API changed; review and refresh the snapshot and guide")
    else:
        SNAPSHOT.write_text(json.dumps(inventory, indent=2) + "\n")
    print(f"Native API: {len(inventory['commands'])} commands, {len(inventory['configKeys'])} root keys at {inventory['revision']}")
