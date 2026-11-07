"""Conservative derived-observation classifier, not a runtime fare engine."""
def classify(case,result):
 s=result.get('summary') or {};d=s.get('distanceM');source=case['sourceLengthKm']*1000
 obs={'id':case['id'],'group':case['group'],'object':case['object'],'type':case['type'],'sourceLengthM':round(source,2),'routeLengthM':d,'lengthRatio':round(d/source,3) if isinstance(d,(int,float)) and source else None,'tariffInference':'none; source-backed geometry and operator rules remain separate','receiptVerified':False}
 points=[x['nearestSegmentM'] for x in s.get('witnessComparisons',[]) if x['id'].startswith('source:') and isinstance(x.get('nearestSegmentM'),(int,float))]
 obs['sourceWitnessFractionWithin25m']=round(sum(x<=25 for x in points)/len(points),3) if points else None
 obs['boundaryMinDistanceM']=s.get('nearestAnchorSegmentM');obs['aggregate']=s.get('aggregatePaymentValues')
 obs['paymentStatus']='OBSERVED_AGGREGATE' if s.get('aggregatePaymentValues') else 'UNAVAILABLE_NOT_FREE'
 if s.get('httpStatus')!=200 or s.get('routeBuildStatus')!='OK':status='NO_USABLE_ROUTE'
 elif not isinstance(d,(int,float)):status='DISTANCE_UNKNOWN'
 elif d>50000:status='DEMO_DISTANCE_LIMIT_EXCEEDED'
 elif d>case['maxResponseKm']*1000:status='WINDOW_DISTANCE_LIMIT_EXCEEDED'
 elif d>2*source and d-source>500:status='EXTRA_ROUTING_SCOPE_NOT_COMPARABLE'
 elif obs['sourceWitnessFractionWithin25m'] is None or obs['sourceWitnessFractionWithin25m']<.8:status='SOURCE_CORRIDOR_MISMATCH'
 elif case['type']=='cross' and isinstance(obs['boundaryMinDistanceM'],(int,float)) and obs['boundaryMinDistanceM']<=10:status='SOURCE_SUPPORTED_DIRECTED_BOUNDARY'
 else:status='SOURCE_CORRIDOR_CONSISTENT_BOUNDARY_NOT_CERTIFIED'
 obs['geometryStatus']=status;obs['compareAsSameShortScope']=status in ['SOURCE_SUPPORTED_DIRECTED_BOUNDARY','SOURCE_CORRIDOR_CONSISTENT_BOUNDARY_NOT_CERTIFIED'];return obs
