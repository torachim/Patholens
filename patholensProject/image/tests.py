from django.test import TestCase
from dataPipeline import *
import unittest


class TestDataPipeline(unittest.TestCase):
    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getDataSets(), rightOutput)


if __name__ == "__main__":
    unittest.main()
