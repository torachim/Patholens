from django.test import TestCase
from dbInteraction import *
import unittest
from accounts.models import Doctors
from django.contrib.auth.models import User


class TestDbInteraction(unittest.TestCase):

    # is called first
    def setUp(self):
        # Create a test user
        self.testUser = User.objects.create_user(
            username="luka364sTesteATgmailPOINTcom",
            email="lukas364Teste@gmail.com",
            first_name="NameVomLuggasZTEftw",
            last_name="GehtDichNichtsAndedfdef",
            password="Ultimatives5HeadPasfefesword",
        )
        self.doc = createDoctor(self.testUser)

    @unittest.skip
    def testCreateDoctor(self):
        self.doc = createDoctor(self.testUser)

    def testAddFinishedPatient(self):
        idFromTestUser = self.doc.doctorID

        toBeAdded = {}

        toBeAdded["lunge"] = {}
        toBeAdded["websiteData"] = {"id-for-bsp": "websiteData-00089"}
        addFinishedPatient(idFromTestUser, toBeAdded)

        toBeAdded["websiteData"] = {"id-for-bsp-2": "websiteData-0004"}
        toBeAdded["lunge"] = {"id-for-lunge-bsp": "lunge-0304"}
        addFinishedPatient(idFromTestUser, toBeAdded)

    def testGetPictureForDiagnosis(self):
        remainingPatients = getRandomPicturePath(self.doc.doctorID, "websiteData")
        print(remainingPatients)

    # is called last
    def tearDown(self):
        self.testUser.delete()


if __name__ == "__main__":
    unittest.main()
