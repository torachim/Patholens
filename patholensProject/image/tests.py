from django.test import TestCase
from dataPipeline import *
import unittest
from django.contrib.auth.models import User



class TestDataPipeline(unittest.TestCase):

    @unittest.skip  # skip
    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getAllDataSets(), rightOutput)
    
    @unittest.skip  # skip
    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {"websiteData": {"url": ["websiteData-00001", "websiteData-00123"]}}
        self.assertEqual(getAllPatientsUrls(), rightOutput)

    def testRandomSort(self):
        toBeSortedList = ["websiteData-00001", "websiteData-00123", "lunge-0010", "lunge-0000"]
        shuffeldList = randomSort(toBeSortedList)
        self.assertNotEqual(toBeSortedList, shuffeldList)

    
    
    
    
if __name__ == "__main__":
    unittest.main()
