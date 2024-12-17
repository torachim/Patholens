import os
from pathlib import Path
import django
import sys
# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Initialize Django
django.setup()



from django.test import TestCase
from image.dataHandler import *
from image.mediaHandler import addMedia
import unittest


class TestDataHandler(unittest.TestCase):

    @unittest.skip  # skip
    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getNamesFromMediaFolder(), rightOutput)

    @unittest.skip  # skip
    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {
            "website_data": {"url": ["websiteData-00001", "websiteData-00123"]}
        }
        self.assertEqual(getPatientURLsFromFolder("website_data"), rightOutput)
    
    @unittest.skip  # skip
    def testshuffleList(self):
        toBeSortedList = [
            "websiteData-00001",
            "websiteData-00123",
            "lunge-0010",
            "lunge-0000",
        ]
        shuffledList = shuffleList(toBeSortedList)
        self.assertNotEqual(toBeSortedList, shuffledList)

    def testAddMedia(self):
        print(addMedia())
            

if __name__ == "__main__":
    unittest.main()
