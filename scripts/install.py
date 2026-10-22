#!/usr/bin/env python3
"""Install the ready-to-use plugin into an explicitly chosen Obsidian vault."""
import argparse
import shutil
from pathlib import Path
import datetime as dt

PACKAGE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--vault', type=Path, required=True)
args = parser.parse_args()
vault = args.vault.expanduser().resolve()
if not vault.is_dir() or not (vault / '.obsidian').is_dir():
    parser.error('Choose an existing vault that has been opened in Obsidian (with a .obsidian directory).')
for filename in ('main.js', 'manifest.json', 'styles.css', 'hex-color-list.md'):
    if not (PACKAGE / 'release' / filename).is_file():
        parser.error('Missing release assets. Run npm run build first, or install the four downloaded release files manually.')
destination = vault / '.obsidian/plugins/habit-calendar-001b'
if destination.exists():
    backup = vault / '.obsidian/plugins-backups' / ('habit-calendar-001b-' + dt.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(destination, backup)
    print(f'Previous version backed up to {backup}')
destination.mkdir(parents=True, exist_ok=True)
for filename in ('main.js', 'manifest.json', 'styles.css', 'hex-color-list.md'):
    if filename != 'hex-color-list.md' or not (destination / filename).exists():
        shutil.copy2(PACKAGE / 'release' / filename, destination / filename)
print(f'Installed in {destination}\nReload Obsidian, enable Habit Calendar 001b in Community plugins, then run Open current month.')
