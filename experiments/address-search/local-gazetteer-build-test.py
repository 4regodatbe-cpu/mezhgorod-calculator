import importlib.util, pathlib, unittest
spec=importlib.util.spec_from_file_location('builder',pathlib.Path(__file__).with_name('local-gazetteer-build.py'))
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
def manifest(aliases=False):
    return {'files':[{'country':cc,'sha256':'a'*64,'url':'https://download.geonames.org/export/dump/'+('alternatenames/' if aliases else '')+cc+'.zip'} for cc in ['RU','UA']]}
class Integrity(unittest.TestCase):
    def test_both_valid_source_types(self):
        builder.validate_manifest(manifest());builder.validate_manifest(manifest(True),True)
    def test_missing_or_duplicate_country(self):
        for files in [manifest()['files'][:1],[manifest()['files'][0]]*2]:
            with self.assertRaises(ValueError):builder.validate_manifest({'files':files})
    def test_wrong_source_or_hash(self):
        for field,value in [('url','https://example.invalid/RU.zip'),('sha256','invalid')]:
            m=manifest();m['files'][0][field]=value
            with self.assertRaises(ValueError):builder.validate_manifest(m)
if __name__=='__main__':unittest.main()
