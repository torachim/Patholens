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

    @unittest.skip
    def testAddFinishedPatient(self):
        idFromTestUser = self.doc.doctorID

        toBeAdded = {}

        toBeAdded["lunge"] = {}
        toBeAdded["websiteData"] = {"id-for-bsp": "00089"}
        addFinishedPatient(idFromTestUser, toBeAdded)

        toBeAdded["websiteData"] = {"id-for-bsp-2": "0004"}
        toBeAdded["lunge"] = {"id-for-lunge-bsp": "0304"}
        addFinishedPatient(idFromTestUser, toBeAdded)

    def testRandomPicture(self):
        idFromTestUser = self.doc.doctorID
        print(getRandomIDAndURL(idFromTestUser, "websiteData"))

    # is called last
    def tearDown(self):
        self.testUser.delete()


if __name__ == "__main__":
    unittest.main(defaultTest="TestDiagnosisManager")
