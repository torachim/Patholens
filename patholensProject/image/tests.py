from django.test import TestCase
from dataPipeline import *
import unittest


class TestDataPipeline(unittest.TestCase):
    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getDataSets(), rightOutput)

    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {"websiteData": {"url": ["00001", "00123"]}}
        self.assertEqual(addAllPatientsToDoctorsDB(2), rightOutput)


if __name__ == "__main__":
    unittest.main()
