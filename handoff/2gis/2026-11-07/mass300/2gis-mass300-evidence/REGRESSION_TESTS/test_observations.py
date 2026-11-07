import unittest
from classify_results import classify
class Observations(unittest.TestCase):
 def row(self,d=300,cost=None,near=1):return {'summary':{'httpStatus':200,'routeBuildStatus':'OK','distanceM':d,'nearestAnchorSegmentM':near,'witnessComparisons':[{'id':'source:a','nearestSegmentM':1},{'id':'source:b','nearestSegmentM':2}],'aggregatePaymentValues':cost}}
 def case(self,t='cross'):return dict(id='test',group='C',object='synthetic',type=t,sourceLengthKm=.3,maxResponseKm=45)
 def test_same_nodes_with_detour_not_same_scope(self):
  x=classify(self.case(),self.row(d=26000,cost=[{'cost':660}]));self.assertFalse(x['compareAsSameShortScope']);self.assertEqual(x['geometryStatus'],'EXTRA_ROUTING_SCOPE_NOT_COMPARABLE')
 def test_absent_payment_not_free(self):self.assertEqual(classify(self.case(),self.row())['paymentStatus'],'UNAVAILABLE_NOT_FREE')
 def test_before_control_with_cost_not_crossing_proof(self):
  x=classify(self.case('before'),self.row(cost=[{'cost':160}]));self.assertNotEqual(x['geometryStatus'],'SOURCE_SUPPORTED_DIRECTED_BOUNDARY');self.assertEqual(x['tariffInference'],'none; source-backed geometry and operator rules remain separate')
 def test_cross_with_close_witness_supported_not_receipt(self):
  x=classify(self.case(),self.row());self.assertEqual(x['geometryStatus'],'SOURCE_SUPPORTED_DIRECTED_BOUNDARY');self.assertFalse(x['receiptVerified'])
 def test_large_lateral_offset_not_certified(self):self.assertNotEqual(classify(self.case(),self.row(near=17))['geometryStatus'],'SOURCE_SUPPORTED_DIRECTED_BOUNDARY')
 def test_demo_overrun_rejected(self):self.assertEqual(classify(self.case(),self.row(d=51000))['geometryStatus'],'DEMO_DISTANCE_LIMIT_EXCEEDED')
if __name__=='__main__':unittest.main(verbosity=2)
