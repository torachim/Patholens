from django.test import TestCase
from doctorServices import *
from image.diagnosisServices import *
import unittest
from django.contrib.auth.models import User
import uuid

class TestDoctorsManager(unittest.TestCase):

    # is called first
    def setUp(self):
        
        generatedUsername = f"lukaTest_{uuid.uuid4().hex}ATgmailPOINTcom"
        generateEmail = generatedUsername.replace("AT", "@").replace("POINT", ".")
        firstName = f"FirstName{uuid.uuid4().hex}"
        secondName = f"SeconName{uuid.uuid4().hex}"
        
        # Create a test user
        self.testUser = User.objects.create_user(
            username=generatedUsername,
            email=generateEmail,
            first_name=firstName,
            last_name=secondName,
            password="Hallo1234",
        )
        self.doc = createDoctor(self.testUser)

    @unittest.skip
    def test_CreateDoctor(self):
        self.doc = createDoctor(self.testUser)

    def test_RandomPicture(self):
        idFromTestUser = self.doc.doctorID
        print(getRandomURL(idFromTestUser, "websiteData"))

    # is called last
    def tearDown(self):
        self.testUser.delete()


if __name__ == "__main__":
    unittest.main(defaultTest="TestDiagnosisManager")
