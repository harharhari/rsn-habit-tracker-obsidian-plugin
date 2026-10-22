#!/usr/bin/env python3
"""Create the current Obsidian habit month while Obsidian is closed. Standard library only."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import unicodedata
import uuid
from zoneinfo import ZoneInfo

ROOT = 'Habit Tracker'
MONTHS = ('January February March April May June July August September October November December').split()

def stable_id(name):
    a, b = 2166136261, 2246822519
    for ch in unicodedata.normalize('NFC', name):
        a = ((a ^ ord(ch)) * 16777619) & 0xffffffff
        b = ((b ^ ord(ch)) * 3266489917) & 0xffffffff
    return f'h-{a:08x}{b:08x}'

def encode(data):
    return '```json\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n```\n'

def decode(text):
    match = re.search(r'```json\s*\n([\s\S]*?)\n```', text)
    if not match:
        raise ValueError('Missing JSON metadata block')
    return json.loads(match[1])

def parse_list(text):
    habits, ids, names, table, found = [], set(), set(), False, False
    for number, line in enumerate(text.splitlines(), 1):
        line = line.strip()
        if not line.startswith('|'):
            if table and line:
                table = False
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        if len(cells) >= 2 and cells[0].lower() == 'habit' and cells[1].lower() == 'generate calendar':
            if len(cells) != 3 or cells[2].lower() != 'header color':
                raise ValueError('Use Habit | Generate calendar | Header color')
            table = found = True
            continue
        if not table or all(re.fullmatch(r':?-+:?', c) for c in cells):
            continue
        if len(cells) != 3:
            raise ValueError(f'Line {number}: expected three columns')
        matches = re.findall(r'<!--\s*habit-id:\s*([a-zA-Z0-9_-]+)\s*-->', cells[0])
        if len(matches) != 1:
            raise ValueError(f'Line {number}: first open Obsidian and run Refresh calendars and statistics to assign IDs')
        name = unicodedata.normalize('NFC', re.sub(r'<!--.*?-->', '', cells[0]).strip())
        habit_id = matches[0]
        if not name or len(name) > 180 or habit_id in ids or name in names or cells[1].upper() not in ('Y', 'N'):
            raise ValueError(f'Line {number}: invalid name, flag or duplicate habit')
        color = cells[2] or '#F8CBAD'
        if not re.fullmatch(r'#[a-fA-F0-9]{6}', color):
            print(f'Line {number}: invalid header color; using #F8CBAD')
            color = '#F8CBAD'
        habits.append(dict(id=habit_id, name=name, enabled=cells[1].upper() == 'Y', color=color.upper(), order=len(habits)))
        ids.add(habit_id)
        names.add(name)
    if not found:
        raise ValueError('Habit table not found')
    return habits

def create_only(path, text):
    """Publish a complete file atomically, without replacing another writer's file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.parent / ('.habit-tmp-' + str(uuid.uuid4()))
    try:
        with temp.open('x', encoding='utf-8') as out:
            out.write(text)
            out.flush()
            os.fsync(out.fileno())
        try:
            os.link(temp, path)
            return True
        except FileExistsError:
            return False
    finally:
        temp.unlink(missing_ok=True)

def generate(vault, now=None):
    root = Path(vault).resolve() / ROOT
    config_path = root / 'System/config.md'
    if not config_path.exists():
        raise ValueError('First install and enable the plugin, then open the tracker once.')
    config = decode(config_path.read_text(encoding='utf-8'))
    zone = ZoneInfo(config['timeZone'])
    now = now or dt.datetime.now(dt.timezone.utc)
    current = now.astimezone(zone)
    month = current.strftime('%Y-%m')
    marker = root / f'System/Months/{month}.md'
    if (root / f'System/Archived/{month}.md').exists():
        return f'{month}: archived; left unchanged'
    events = list((root / f'Records/{month}').glob('*.md'))
    if not events and (marker.exists() or (root / f'Statistics/{month}-statistics.md').exists()):
        return f'{month}: records previously existed; not recreating deleted history'
    if not events:
        habits = parse_list((root / 'habit-tracker-list.md').read_text(encoding='utf-8'))
        event_id = str(uuid.uuid4())
        event = dict(schema=1, id=event_id, month=month,
                     at=now.astimezone(dt.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z'),
                     type='create', habits=habits)
        create_only(root / f'Records/{month}/{event_id}.md', encode(event))
    create_only(marker, encode(dict(schema=1, month=month)))
    heading = f'{month} {MONTHS[current.month-1]} {current.year}'
    create_only(root / f'Months/{month}.md', f'# {heading}\n\n```habit-calendar\n{month}\n```\n')
    return f'{month}: page ready; statistics refresh when Obsidian opens'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--vault', required=True, type=Path)
    args = parser.parse_args()
    if not args.vault.is_dir():
        parser.error('Vault must be an existing directory')
    try:
        # One helper at a time on the primary Linux machine. The plugin can still
        # create concurrently: unique events and the reducer merge both safely.
        import fcntl
        lock = args.vault / ROOT / 'System/helper.lock'
        lock.parent.mkdir(parents=True, exist_ok=True)
        with lock.open('a') as handle:
            fcntl.flock(handle, fcntl.LOCK_EX)
            print(generate(args.vault))
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f'Habit tracker: {error}\n')

if __name__ == '__main__':
    main()
