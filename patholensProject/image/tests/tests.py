from django.test import TestCase
from dataHandler import *
import unittest


class TestDataHandler(unittest.TestCase):

    @unittest.skip  # skip
    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getDataSetNames(), rightOutput)

    @unittest.skip  # skip
    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {
            "websiteData": {"url": ["websiteData-00001", "websiteData-00123"]}
        }
        self.assertEqual(getAllPatientsUrls(), rightOutput)

    def testshuffleList(self):
        toBeSortedList = [
            "websiteData-00001",
            "websiteData-00123",
            "lunge-0010",
            "lunge-0000",
        ]
        shuffledList = shuffleList(toBeSortedList)
        self.assertNotEqual(toBeSortedList, shuffledList)


if __name__ == "__main__":
    unittest.main()
