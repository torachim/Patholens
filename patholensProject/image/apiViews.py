from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Diagnosis
import os
from accounts.diagnosisManager import getURL


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
            imageFormat = request.GET.get("format ")
            if not imageFormat:
                print("Format parameter missing; using default FLAIR.")
                imageFormat = "FLAIR"

            imageFormat = imageFormat.upper()

            if imageFormat not in settings.SUPPORTED_IMAGE_FORMATS:
                return JsonResponse({"error": "Invalid format"}, status=400)

            # get the path to the image of a given diagnosis
            imageID = getURL(diagnosisID)
            
            
            fileSuffix = settings.SUPPORTED_IMAGE_FORMATS[imageFormat]

            imagePath = os.path.join(
                settings.MEDIA_ROOT,
                f"website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffix}",
            )
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
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

            if not Diagnosis.objects.filter( diagID=diagID).exists():
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


class GetAIMaskPathsAPIView(APIView):
    """
    API Class to get the paths of AI-generated masks for a given subject ID.
    """

    def get(self, request, subject_id):
        """
        Retrieve all AI mask paths for the given subject ID.

        Args:
            request: The HTTP request object.
            subject_id (str): ID of the subject (e.g., 'sub-00001').

        Returns:
            JsonResponse: A list of relative paths to the AI masks.
        """
        try:
            # Basis-Pfad zu den AI-Masken
            base_path = os.path.join(
                settings.MEDIA_ROOT, 
                "website_data", 
                "derivatives", 
                "ai", 
                subject_id, 
                "pred"
            )

            # Überprüfen, ob der Ordner existiert
            if not os.path.exists(base_path):
                return Response(
                    {"error": f"Path not found: {base_path}"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Filtere Dateien, die 'mask' enthalten und auf '.nii.gz' enden
            mask_files = [
                file for file in os.listdir(base_path)
                if "mask" in file and file.endswith(".nii.gz")
            ]

            # Erstelle relative Pfade für die Masken
            relative_paths = [
                f"/media/website_data/derivatives/ai/{subject_id}/pred/{file}"
                for file in mask_files
            ]

            # Rückgabe der Pfade
            return Response({"masks": relative_paths}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )