"""Generic source-label regression: ru-tagged romanization is not Russian UI text."""
import importlib.util, pathlib, unittest
path=pathlib.Path(__file__).with_name('local-gazetteer-build.py')
spec=importlib.util.spec_from_file_location('gazetteer',path)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class DisplayTests(unittest.TestCase):
    def test_cyrillic_source_alias_precedes_romanized_alias(self):
        values=['Gorod Primer','Город Пример']
        self.assertEqual(module.russian_display(values),'Город Пример')
    def test_missing_cyrillic_is_unknown_not_guessed(self):
        self.assertIsNone(module.russian_display(['Gorod Primer']))
    def test_existing_source_preference_retained_within_cyrillic(self):
        self.assertEqual(module.russian_display(['Предпочтительное','Другое']),'Предпочтительное')
if __name__=='__main__':unittest.main()
