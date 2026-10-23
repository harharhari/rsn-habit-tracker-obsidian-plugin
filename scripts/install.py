#!/usr/bin/env python3
"""Install the ready-to-use plugin into an explicitly chosen Obsidian vault."""
import argparse
import json
import re
import shutil
from pathlib import Path
import datetime as dt

PACKAGE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--vault', type=Path, required=True)
parser.add_argument('--migrate-from-001b', action='store_true', help='Copy legacy data.json if the new plugin has no settings. Disable the old plugin first.')
args = parser.parse_args()
vault = args.vault.expanduser().resolve()
if not vault.is_dir() or not (vault / '.obsidian').is_dir():
    parser.error('Choose an existing vault that has been opened in Obsidian (with a .obsidian directory).')
for filename in ('main.js', 'manifest.json', 'styles.css', 'hex-color-list.md'):
    if not (PACKAGE / 'release' / filename).is_file():
        parser.error('Missing release assets. Run npm run build first, or install the four downloaded release files manually.')
manifest = json.loads((PACKAGE / 'release/manifest.json').read_text(encoding='utf-8'))
plugin_id = manifest['id']
if not re.fullmatch(r'[a-z-]+', plugin_id) or plugin_id.endswith('plugin') or 'obsidian' in plugin_id:
    parser.error('Release manifest has an invalid plugin ID.')
destination = vault / '.obsidian/plugins' / plugin_id
legacy_settings = vault / '.obsidian/plugins/habit-calendar-001b/data.json'
copy_settings = args.migrate_from_001b and legacy_settings.is_file() and not (destination / 'data.json').exists()
if copy_settings:
    json.loads(legacy_settings.read_text(encoding='utf-8'))  # Fail before writing if settings are corrupt.
if destination.exists():
    backup = vault / '.obsidian/plugins-backups' / (plugin_id + '-' + dt.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(destination, backup)
    print(f'Previous version backed up to {backup}')
destination.mkdir(parents=True, exist_ok=True)
for filename in ('main.js', 'manifest.json', 'styles.css', 'hex-color-list.md'):
    if filename != 'hex-color-list.md' or not (destination / filename).exists():
        shutil.copy2(PACKAGE / 'release' / filename, destination / filename)
if copy_settings:
    shutil.copy2(legacy_settings, destination / 'data.json')
    print('Copied legacy settings; the original remains unchanged.')
print('Keep the old plugin disabled on every device. Existing Habit Tracker data is preserved.')
print(f'Installed in {destination}\nReload Obsidian, enable rsn habit calendar one b in Community plugins, then run Open current month.')
