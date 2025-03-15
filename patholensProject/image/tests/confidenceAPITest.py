from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from image.models import Diagnosis
from django.contrib.auth.models import User
from accounts.models import Doctors

class SaveConfidenceAPITest(TestCase):
    """ 
    Test suite for the SaveConfidenceAPIView.

    This test case verifies the functionality of the SaveConfidenceAPIView, 
    which is responsible for saving the confidence value of a diagnosis in the database. 
    It ensures the API handles valid and invalid inputs as expected.
  """

    def setUp(self):
        
        self.user = User.objects.create(username="testuser")

        self.doctor = Doctors.objects.create(doctorID=self.user)
        
        self.diag = Diagnosis.objects.create(
            diagID=1,
            confidence=0,
            doctor=self.doctor
        )

    def testValidConfidence(self):
        response = self.client.post(
            reverse('saveConfidence', args=[self.diag.diagID]),
            {'confidence': 85},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.diag.refresh_from_db()
        self.assertEqual(self.diag.confidence, 85)

    def testInvalidConfidence(self):
        response = self.client.post(
            reverse('saveConfidence', args=[self.diag.diagID]),
            {'confidence': 150},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)