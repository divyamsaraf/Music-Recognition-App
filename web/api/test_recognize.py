"""Lightweight checks for the Flask recognize app (run: python api/test_recognize.py)."""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class TestRecognizeModule(unittest.TestCase):
    def test_app_exists(self):
        import recognize

        self.assertTrue(hasattr(recognize, "app"))


if __name__ == "__main__":
    unittest.main()
