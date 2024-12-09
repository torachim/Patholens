from django.test import TestCase
from doctorManager import *
from diagnosisManager import *
import unittest
from accounts.models import Doctors
from image.models import Diagnosis
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
        print(getRandomIdAndUrl(idFromTestUser, "websiteData"))
        
    
    # is called last
    def tearDown(self):
        self.testUser.delete()

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
        idDiag, urlForPicture = getRandomIdAndUrl(self.doc.doctorID, 'website_data')
        docObject = getDoctorObject(self.testUser.id)
        
        diag = createDiagnosis(idDiag, docObject, urlForPicture)
        
        self.assertEqual(getUrl(idDiag), diag.imageUrl)
     
    # is called last
    def tearDown(self):
        self.testUser.delete()
    
    
if __name__ == "__main__":
    unittest.main(defaultTest='TestDiagnosisManager')
