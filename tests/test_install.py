"""Identity-change installer regressions against a disposable vault."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]
NEW='rsn-habit-calendar-one-b'
class InstallTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.vault=Path(self.temp.name)/'Vault with spaces';self.plugins=self.vault/'.obsidian/plugins';self.plugins.mkdir(parents=True)
  self.history=self.vault/'Habit Tracker/Statistics/2026-09.md';self.history.parent.mkdir(parents=True);self.history.write_text('frozen history')
 def tearDown(self): self.temp.cleanup()
 def run_install(self,*args): return subprocess.run([sys.executable,str(ROOT/'scripts/install.py'),'--vault',str(self.vault),*args],capture_output=True,text=True)
 def legacy(self,text='{"declined":"keep"}'):
  p=self.plugins/'habit-calendar-001b/data.json';p.parent.mkdir();p.write_text(text);return p
 def test_fresh_install_uses_manifest_id_and_preserves_vault(self):
  result=self.run_install();self.assertEqual(result.returncode,0,result.stderr)
  self.assertEqual(json.loads((self.plugins/NEW/'manifest.json').read_text())['id'],NEW)
  self.assertEqual(self.history.read_text(),'frozen history');self.assertFalse((self.plugins/'habit-calendar-001b').exists())
 def test_explicit_migration_copies_settings_without_mutating_legacy(self):
  old=self.legacy();before=old.read_bytes();result=self.run_install('--migrate-from-001b');self.assertEqual(result.returncode,0,result.stderr)
  self.assertEqual((self.plugins/NEW/'data.json').read_bytes(),before);self.assertEqual(old.read_bytes(),before);self.assertEqual(self.history.read_text(),'frozen history')
 def test_existing_new_settings_are_not_overwritten(self):
  self.legacy();new=self.plugins/NEW;new.mkdir();(new/'data.json').write_text('{"new":true}');result=self.run_install('--migrate-from-001b');self.assertEqual(result.returncode,0,result.stderr)
  self.assertEqual((new/'data.json').read_text(),'{"new":true}');self.assertTrue(list((self.vault/'.obsidian/plugins-backups').glob(NEW+'-*')))
 def test_corrupt_legacy_settings_fail_before_install(self):
  self.legacy('bad json');result=self.run_install('--migrate-from-001b');self.assertNotEqual(result.returncode,0);self.assertFalse((self.plugins/NEW).exists());self.assertEqual(self.history.read_text(),'frozen history')
 def test_migration_is_opt_in(self):
  self.legacy();result=self.run_install();self.assertEqual(result.returncode,0,result.stderr);self.assertFalse((self.plugins/NEW/'data.json').exists())
if __name__=='__main__': unittest.main()
