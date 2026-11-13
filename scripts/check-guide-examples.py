"""Validate rendered examples as syntax only; no app or integration commands run."""

import json
import subprocess
import sys
import tomllib
from html.parser import HTMLParser
from pathlib import Path


class Examples(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "pre":
            self.current = {"language": dict(attrs).get("data-language"), "text": ""}

    def handle_data(self, data):
        if self.current is not None:
            self.current["text"] += data

    def handle_endtag(self, tag):
        if tag == "pre" and self.current is not None:
            self.blocks.append(self.current)
            self.current = None


def shell_syntax(text):
    result = subprocess.run(["/bin/sh", "-n"], input=text, text=True, capture_output=True)
    if result.returncode:
        raise ValueError(f"Shell example has invalid syntax: {result.stderr.strip()}")


def validate(html):
    parser = Examples()
    parser.feed(html)
    counts = {"sh": 0, "toml": 0, "text": 0}
    config_keys = set()
    for block in parser.blocks:
        language = block["language"]
        if language not in counts:
            raise ValueError("Every code block needs an explicit sh, toml or text language")
        counts[language] += 1
        if language == "sh":
            shell_syntax(block["text"])
        elif language == "toml":
            try:
                config = tomllib.loads(block["text"])
            except tomllib.TOMLDecodeError as error:
                raise ValueError(f"TOML example has invalid syntax: {error}") from error
            config_keys.update(config)
            hook = config.get("workspace-change-hook")
            if hook and hook[:2] == ["/bin/sh", "-c"]:
                shell_syntax(hook[2])
    inventory = json.loads((Path(__file__).resolve().parent.parent / "tests/fixtures/native-guide-api.json").read_text())
    if config_keys != set(inventory["configKeys"]):
        raise ValueError(f"TOML examples must cover the native root keys: {sorted(config_keys)}")
    if not all(counts.values()):
        raise ValueError("Guide must include shell examples, TOML examples and command syntax")
    return counts


if __name__ == "__main__":
    try:
        print(json.dumps(validate(sys.stdin.read())))
    except ValueError as error:
        raise SystemExit(str(error)) from error
