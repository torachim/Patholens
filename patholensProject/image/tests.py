from django.test import TestCase
from dataPipeline import *
import unittest
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User


class TestDataPipeline(unittest.TestCase):

    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getAllDataSets(), rightOutput)
    
    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {"websiteData": {"url": ["websiteData-00001", "websiteData-00123"]}}
        self.assertEqual(getAllPatientsUrls(2), rightOutput)


if __name__ == "__main__":
    unittest.main()
