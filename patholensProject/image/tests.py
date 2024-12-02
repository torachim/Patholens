from django.test import TestCase
from dataPipeline import *
import unittest
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User


class TestDataPipeline(unittest.TestCase):

    def testGetDataSets(self):
        rightOutput = ["websiteData"]
        self.assertEqual(getDataSets(), rightOutput)

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="whatATestATgmailPOINTcom",
            password="password",
            email="whatATest@gmail.com",
        )

        # Log the user in
        self.client.login(username="whatATestATgmailPOINTcom", password="password")

        # Store the user's ID for later use
        self.user_id = self.user.id

    def testAddAllPatientsToDoctorsDB(self):
        rightOutput = {"websiteData": {"url": ["00001", "00123"]}}
        self.assertEqual(addAllPatientsToDoctorsDB(2), rightOutput)


if __name__ == "__main__":
    unittest.main()
