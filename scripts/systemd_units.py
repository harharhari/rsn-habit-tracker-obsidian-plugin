#!/usr/bin/env python3
"""Write reviewable systemd user units; does not install or start them."""
import argparse
from pathlib import Path
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--vault', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
if not args.vault.is_dir():
    parser.error('Vault does not exist')
helper = Path(__file__).resolve().with_name('monthly_helper.py')
def quote(value):
    value = str(value)
    if '\n' in value or '\r' in value:
        raise ValueError('Newlines in paths are unsupported')
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('%', '%%').replace('$', '$$') + '"'
args.output.mkdir(parents=True, exist_ok=True)
service = f'''[Unit]
Description=Create the current Obsidian habit month

[Service]
Type=oneshot
ExecStart={quote(sys.executable)} {quote(helper)} --vault {quote(args.vault.resolve())}
UMask=0077
'''
timer = '''[Unit]
Description=Check for a new habit month each minute (tracker timezone)

[Timer]
OnCalendar=*-*-* *:*:00
Persistent=true
AccuracySec=1s
Unit=rsn-habit-calendar-one-b.service

[Install]
WantedBy=timers.target
'''
(args.output / 'rsn-habit-calendar-one-b.service').write_text(service)
(args.output / 'rsn-habit-calendar-one-b.timer').write_text(timer)
print(f'Wrote units to {args.output}. Keep this package at its current location after enabling the timer.')
