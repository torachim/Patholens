from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Diagnosis
import os
from accounts.diagnosisManager import getURL
from .timeHandler import setUseTime

from image.models import Diagnosis


class GetImageAPIView(APIView):
    """
    API Class to get the image to a given diagnosisID

    Args:
        APIView: Imported from python
    """

    def get(self, request, diagnosisID):
        """
        Function to get the image to a given diagnosisID

        Args:
            request (HttpRequest): The HTTP request object, which contains metadata and parameters.

            diagnosisID (string): ID of an Image

        Returns:
            Path: The path to find the requested image
        """
        try:
            imageFormat = request.GET.get("format")
            print("Received format parameter:", imageFormat)  # Debugging
            if not imageFormat:
                imageFormat = "FLAIR"

            imageFormat = imageFormat.upper()

            if imageFormat not in settings.SUPPORTED_IMAGE_FORMATS:
                return JsonResponse({"error": "Invalid format"}, status=400)

            # get the path to the image of a given diagnosis
            imageID = getURL(diagnosisID)
            print("Image ID:", imageID)  # Debugging
            
            fileSuffix = settings.SUPPORTED_IMAGE_FORMATS[imageFormat]
            imagePath = os.path.join(
                settings.MEDIA_ROOT,
                f"website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffix}",
            )
            print("Generated image path:", imagePath)  # Debugging
            if not os.path.exists(imagePath):
                return Response(
                    {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # relative path for the client
            relativePath = (
                f"/media/website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffix}"
            )
            return Response({"path": relativePath}, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error in GetImageAPIView:", str(e))  # Debugging
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class SetUseTimeAPIView(APIView):

    def post(self, request):
        """
        API Endpoint to save the use time from given by the frontend

        Returns:
            Response: Response if the use time got saved correctly
        """
        try:
            diagnosisID = request.data.get('diagnosisID')
            action = request.data.get('action')
            timestamp = request.data.get('absoluteTime')

            if not all([diagnosisID, action, timestamp]):
                return Response({
                                 'status': 'error',
                                 'message': 'Missing required field: Timestamps, action, diagnosisID'},
                                  status=status.HTTP_400_BAD_REQUEST)
            
            result = setUseTime(diagnosisID, action, timestamp)

            return Response({
                             'status': 'success',
                             'message': 'Time entry successfully',
                             'data': result},
                              status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                            'status': 'error',
                            'message': f'An unexpected error occurred: {str(e)}'
                            },
                            status=status.HTTP_400_BAD_REQUEST)


class SaveConfidenceAPIView(APIView):

    def post(self, request, diagID):
        """
        This function saves the confidence value of the diganosis in the db

        Args:
            request (_type_): _description_
            diagID (string): ID of an diagnosis

        Returns:
            none
        """

        try:
            data = request.data
            confidence = data.get('confidence')

            # check if it is a valid value
            if confidence is None or not (0 <= int(confidence) <= 100):
                return Response({'error': 'Invalid confidence value. It must be between 0 and 100.'}, status=status.HTTP_400_BAD_REQUEST)

            if not Diagnosis.objects.filter(diagID=diagID).exists():
                return Response(
                    {'error': f'Diagnosis with diagID {diagID} does not exist.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            diag = Diagnosis.objects.get(diagID=diagID)
            # store confidence value
            diag.confidence = int(confidence)
            diag.save()

            return Response({'message': 'Confidence value saved successfully via API!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
