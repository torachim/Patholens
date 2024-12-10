from django.test import TestCase
from doctorManager import *
from diagnosisManager import *
import unittest
from django.contrib.auth.models import User


class TestDiagnosisManager(unittest.TestCase):
    # is called first
    def setUp(self):
        # Create a test user
        self.testUser = User.objects.create_user(
            username="lukaZWEIsTestffeATgmailPOINTcom",
            email="lukasZWEITesteff@gmail.com",
            first_name="Test",
            last_name="User2",
            password="kleinesAberFeines7503",
        )
        self.doc = createDoctor(self.testUser)

    def testGetPicture(self):
        idDiag, urlForPicture = getRandomIDAndURL(self.doc.doctorID, "website_data")
        docObject = getDoctorObject(self.testUser.id)

        diag = createDiagnosis(idDiag, docObject, urlForPicture)

        self.assertEqual(getURL(idDiag), diag.imageUrl)

    # is called last
    def tearDown(self):
        self.testUser.delete()
        
        
if __name__ == "__main__":
    unittest.main()
