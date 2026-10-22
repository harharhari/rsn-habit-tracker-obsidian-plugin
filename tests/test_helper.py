import datetime as dt
import importlib.util
import tempfile
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('helper', Path(__file__).parents[1] / 'scripts/monthly_helper.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)

class HelperTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.vault = Path(self.temp.name)
        self.root = self.vault / 'Habit Tracker'
        (self.root / 'System').mkdir(parents=True)
        (self.root / 'System/config.md').write_text(helper.encode(dict(schema=1, timeZone='Asia/Kolkata')))
        (self.root / 'habit-tracker-list.md').write_text('| Habit | Generate calendar | Header color |\n|---|---|---|\n| Walking <!-- habit-id: h-walk --> | Y | #F8CBAD |\n')
        self.now = dt.datetime(2026,9,30,18,30,tzinfo=dt.timezone.utc)
    def tearDown(self):
        self.temp.cleanup()
    def test_generation_at_timezone_boundary_and_idempotence(self):
        helper.generate(self.vault, self.now)
        page = self.root / 'Months/2026-10.md'
        self.assertIn('2026-10 October 2026', page.read_text())
        helper.generate(self.vault, self.now)
        self.assertEqual(len(list((self.root / 'Records/2026-10').glob('*.md'))), 1)
    def test_never_recreates_deleted_records(self):
        helper.generate(self.vault, self.now)
        for file in (self.root / 'Records/2026-10').glob('*.md'):
            file.unlink()
        self.assertIn('not recreating', helper.generate(self.vault,self.now))
    def test_archived_month_is_untouched(self):
        (self.root / 'System/Archived').mkdir()
        (self.root / 'System/Archived/2026-10.md').write_text('archived')
        self.assertIn('archived',helper.generate(self.vault,self.now))
        self.assertFalse((self.root / 'Months/2026-10.md').exists())
    def test_list_edits_never_replace_an_existing_month_without_confirmation(self):
        helper.generate(self.vault, self.now)
        paths = list((self.root / 'Records/2026-10').glob('*.md'))
        before = paths[0].read_text()
        (self.root / 'habit-tracker-list.md').write_text('| Habit | Generate calendar | Header color |\n|---|---|---|\n| Yoga <!-- habit-id: h-yoga --> | Y | #112233 |\n')
        helper.generate(self.vault, self.now)
        self.assertEqual(paths[0].read_text(), before)
        self.assertEqual(len(list((self.root / 'Records/2026-10').glob('*.md'))), 1)
    def test_atomic_create_never_overwrites(self):
        path=self.root / 'test.md'
        self.assertTrue(helper.create_only(path,'first'))
        self.assertFalse(helper.create_only(path,'second'))
        self.assertEqual(path.read_text(),'first')
    def test_requires_initialized_ids(self):
        with self.assertRaisesRegex(ValueError,'assign IDs'):
            helper.parse_list('| Habit | Generate calendar | Header color |\n|---|---|---|\n| Yoga | Y | |')

if __name__ == '__main__':
    unittest.main()
