from pathlib import Path
import json,unittest,datetime
R=Path(__file__).resolve().parents[1]
C={x['id']:x for x in json.loads((R/'ACCEPTED_WORKING_CALCULATIONS.json').read_text())}
# Evidence-level admission overlay, not a runtime pricing implementation.
def admitted(case,scope,complete=True,already_charged=False,trip_date='2026-10-15'):
 c=C[case]
 if scope!=c['geometry_id'] or not complete or already_charged:return None
 if trip_date<c['effective_from'][:10]:return None
 return c
class Policy(unittest.TestCase):
 def test_receipt_is_not_working(self):
  self.assertTrue(all(c['status']=='accepted_working_calculation' and c['receipt_verified'] is False for c in C.values()))
 def test_b05_positive_source_cells(self):
  self.assertEqual(C['B05']['values_rub']['trip_2026_10_15'],320)
  self.assertEqual(C['B05']['values_rub']['FriSunHolidays'],160+250)
  self.assertEqual(datetime.date(2026,10,15).weekday(),3)
  self.assertIsNotNone(admitted('B05',C['B05']['geometry_id']))
 def test_partial_not_admitted(self):self.assertIsNone(admitted('B05',C['B05']['geometry_id'],complete=False))
 def test_not_full_trip(self):self.assertTrue(all(c['full_trip_total'] is False for c in C.values()))
 def test_duplicate_rejected(self):self.assertIsNone(admitted('B05',C['B05']['geometry_id'],already_charged=True))
 def test_foreign_branch_rejected(self):self.assertIsNone(admitted('B05','old-road-9620416636'))
 def test_historical_date_no_future_rate(self):
  self.assertIsNone(admitted('B05',C['B05']['geometry_id'],trip_date='2026-03-01'))
  self.assertIsNotNone(admitted('B05',C['B05']['geometry_id'],trip_date='2026-03-02'))
 def test_ckad_actual_matrix_cell(self):
  m=json.loads((R/'SOURCES/ckad-2026-03-02-category1-direct-pair-matrix.json').read_text())
  self.assertEqual(C['CKAD']['values_rub']['allDays'],m['directFareRub']['М-11 Нева']['М-12 Восток'])
  self.assertIsNone(admitted('CKAD','short-outcome-unknown-probe'))
 def test_airport_standalone_not_combined(self):
  t=json.loads((R/'SOURCES/2026-09-04-679-684-category1.json').read_text())
  for id in ['PULKOVO_FORWARD','PULKOVO_REVERSE']:
   self.assertEqual(C[id]['values_rub']['allDays'],t['fares']['pulkovo_access_allDays'])
  self.assertNotEqual(C['PULKOVO_FORWARD']['geometry_id'],C['PULKOVO_REVERSE']['geometry_id'])
  self.assertEqual(t['fares']['pulkovo_access_plus_mainline'],94)
 def test_real_unknowns_not_promoted(self):
  self.assertEqual(len(C),4)
  unknown=json.loads((R/'UNKNOWN_BINDINGS.json').read_text())
  self.assertTrue(any(x['key']=='M12-exits-287-318-395-442' for x in unknown))
 def test_all38_reviewed(self):
  a=json.loads((R/'TASK_RESULTS.json').read_text());self.assertEqual(len(a),38)
  self.assertEqual({x['id'] for x in a},{x['id'] for x in json.loads((R/'HISTORICAL_V1/TASK_RESULTS.json').read_text())})
  self.assertTrue(all(x['reason'] and x['old_conclusion'] and x['new_conclusion'] for x in a))
if __name__=='__main__':unittest.main(verbosity=2)
