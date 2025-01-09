from django.test import TestCase
from accounts.doctorManager import *
from accounts.diagnosisManager import *
import unittest
from django.contrib.auth.models import User


class TestDiagnosisManager(unittest.TestCase):
    # is called first
    def setUp(self):
        # Create a test user
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
        datasetName = "website_data".upper()
        idDiag, urlForPicture = getRandomURL(self.doc.doctorID, datasetName)
        mediaFolderObject = Media.objects.get(name=datasetName)
        
        self.diag = createDiagnosis(idDiag, self.doc, urlForPicture, mediaFolderObject)

    @unittest.skip
    def testGetPicture(self):
        idDiag, urlForPicture = getRandomURL(self.doc.doctorID, "website_data")
        docObject = getDoctorObject(self.testUser.id)

        diag = createDiagnosis(idDiag, docObject, urlForPicture)

        self.assertEqual(getURL(idDiag), diag.imageURL)

    def testSetConfidence(self):
        
        self.diag.confidence = {"Lesion0": 1}
        self.diag.save()        
        
        returnValue = setConfidence(self.diag.diagID, ConfidenceType.editedConfidence, [{"Lesion2": 10}, {"Lesion1": 9}])
        
        print(returnValue["status"])
        print(returnValue["message"])
        diag = getDiagnosisObject(self.diag.diagID)
        print(diag.confidenceOfEditedDiag)
            
    # is called last
    def tearDown(self):
        self.testUser.delete()
        
        
if __name__ == "__main__":
    unittest.main()
