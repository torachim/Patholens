from django.test import TestCase
from doctorManager import *
from diagnosisManager import *
import unittest
from django.contrib.auth.models import User


class TestDoctorsManager(unittest.TestCase):

    # is called first
    def setUp(self):
        # Create a test user
        self.testUser = User.objects.create_user(
            username="luka364sTestffeATgmailPOINTcom",
            email="lukas364Testeff@gmail.com",
            first_name="NameVomLeefuggasZTEftw",
            last_name="GehtDichNefefichtsAndedfdef",
            password="Ultimatives5HeadPasfefeswordChristophMagEsNicht",
        )
        self.doc = createDoctor(self.testUser)

    @unittest.skip
    def testCreateDoctor(self):
        self.doc = createDoctor(self.testUser)

    def testRandomPicture(self):
        idFromTestUser = self.doc.doctorID
        print(getRandomURL(idFromTestUser, "websiteData"))

    # is called last
    def tearDown(self):
        self.testUser.delete()


if __name__ == "__main__":
    unittest.main(defaultTest="TestDiagnosisManager")
