from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.conf import settings
import os
import re
from image.diagnosisManager import getURL, ConfidenceType, setConfidence
from accounts.doctorManager import deleteContinueDiag, setContinueDiag
from .timeHandler import setUseTime

import os


class GetImageAPIView(APIView):
    """
    API Class to get the image to a given diagnosisID
    """

    def get(self, request, diagnosisID):
        try:
            # Parameter mit Dataset-Name
            dataset_name = request.GET.get("dataset", "website_data").lower()
            
            # Format-Parameter (Original-Kommentar beibehalten)
            image_format = request.GET.get("format ", "FLAIR").strip().upper()
            
            # Validierung
            if not diagnosisID:
                return Response(
                    {"error": "diagnosisID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if image_format not in settings.SUPPORTED_IMAGE_FORMATS:
                return Response(
                    {"error": "Invalid image format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Pfadgenerierung
            image_id = getURL(diagnosisID)
            file_suffix = settings.SUPPORTED_IMAGE_FORMATS[image_format]
            
            image_path = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"{dataset_name}/sub-{image_id}/anat/sub-{image_id}{file_suffix}"
                )
            )

            if not os.path.exists(image_path):
                return Response(
                    {"error": "Image not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Relativer Pfad mit Dataset-Name
            relative_path = (
                f"/media/{dataset_name}/sub-{image_id}/anat/sub-{image_id}{file_suffix}"
            )

            return Response({"path": relative_path}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},  # Original Fehlerbehandlung
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
            request (HttpRequest): The HTTP request object, which contains metadata and parameters.
            diagID (string): ID of an diagnosis

        Returns:
            none
        """

        try:
            data = request.data
            confidence = data.get('confidence')
            confidenceType = data.get('confidenceType') 

            # check if it is a valid value
            if confidence is None or not (0 <= int(confidence) <= 10):
                return Response({'error': 'Invalid confidence value. It must be between 0 and 10.'}, status=status.HTTP_400_BAD_REQUEST)

            """
            # TODO: Get the name for the lesions 
            # TODO: Know which confidence you want to save: First confidence, AI confidence, edited confidence
            """
            
            keyValue = [{confidenceType: confidence}]
            returnValue = setConfidence(diagID, ConfidenceType.FIRST_EDIT,keyValue)
    
            # Successfully
            if returnValue["status"]:
                return Response({'message': 'Confidence value saved successfully via API!'}, status=status.HTTP_200_OK)
            
            # There was a problem
            else:
                return Response({'message': returnValue["message"]},status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetImageAndMaskAPIView(APIView):
    """
    API-Klasse, um sowohl das MRI-Bild als auch die AI-Maske für eine gegebene diagnosisID abzurufen.
    """
    def get(self, request, diagnosisID):
        """
        API-Endpunkt, der die URLs für die gewünschte AI-Maske und das Gehirn-MRI zurückgibt.
        """
        try:
            if not diagnosisID:
                return Response({"error": "diagnosisID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Parameter aus dem Request: Standard ist "website_data"
            dataset_name = request.GET.get("dataset", "website_data").lower()
            
            imageFormatMask = request.GET.get("mask", "DEEPFCD").upper()
            imageFormatMri = request.GET.get('mri').upper()

            if imageFormatMask not in settings.SUPPORTED_IMAGE_FORMATS or imageFormatMri not in settings.SUPPORTED_IMAGE_FORMATS:
                return JsonResponse({"error": "Invalid format"}, status=400)

            # Erhalte die MRI-Bild-ID
            imageID = getURL(diagnosisID)
            fileSuffixMri = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMri]  # Default MRI-Format

            # Absoluter Pfad zum MRI-Bild: Verwende dataset_name statt "website_data"
            mriPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"{dataset_name}/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}",
                )
            )

            fileSuffixMask = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMask]
            # Absoluter Pfad zur AI-Maske: Auch hier dataset_name verwenden
            maskPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"{dataset_name}/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}",
                )
            )

            if not os.path.exists(mriPath):
                return Response(
                    {"error": f"MRI file not found at {mriPath}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not os.path.exists(maskPath):
                return Response(
                    {"error": f"AI mask file not found at {maskPath}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Relative Pfade für den Client:
            mriRelativePath = f"/media/{dataset_name}/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}"
            maskRelativePath = f"/media/{dataset_name}/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}"

            return Response(
                {"status": "success", "data": {"mriPath": mriRelativePath, "maskPath": maskRelativePath}},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

     

def sortLesionNumber(filename):
    match = re.search(r'lesion-(\d+)', filename) 
    return int(match.group(1)) if match else float('inf')

class GetDiagnosis(APIView):
    def get(self, request, diagnosisID):
        """
        Funktion, um die Diagnose-Maske für eine spezifische diagnosisID abzurufen.
        """
        try:
            if not diagnosisID:
                return Response({"error": "DiagnosisID required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Parameter aus dem Request
            dataset_name = request.GET.get("dataset", "website_data").lower()
            
            subID = getURL(diagnosisID)
            docID = request.user.id

            # Verwende dataset_name dynamisch im Pfad
            diagnosisFolder = os.path.join(
                settings.MEDIA_ROOT,
                f"{dataset_name}/derivatives/diagnosis/sub-{subID}/doc-{docID}"
            )
            
            if not os.path.exists(diagnosisFolder):
                return Response(
                    {"error": f"Diagnosis File {diagnosisFolder} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            files = [
                os.path.relpath(os.path.join(root, file), settings.MEDIA_ROOT)
                for root, _, filenames in os.walk(diagnosisFolder)
                for file in filenames
            ]

            relativePath = f"media/{dataset_name}/derivatives/diagnosis/sub-{subID}/doc-{docID}/sub-{subID}_acq-{docID}_space-edited-image.nii.gz"

            if not files:
                return Response(
                    {"error": "No files found in the folder"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Sortierung der Diagnose-Bilder anhand ihrer Läsionsnummer
            files.sort(key=sortLesionNumber)
            imageFiles = [os.path.join("media", file) for file in files]

            return Response(
                {"status": "success", "files": imageFiles},
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class setContinueAPIView(APIView):
    def post(self, request):
        
        try:
            data = request.data
            docID = data.get("docID")
            diagnosisID = data.get("diagnosisID")

            if(not docID or not diagnosisID):
                return Response({"error": "Invalid Data"}, status=status.HTTP_404_NOT_FOUND)
            
            setContinueDiag(docID, diagnosisID)

            return Response({"status": "success"},
                            status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class saveImageAPIView(APIView):
    def post(self, request):
        try:
            # Extrahiere Datei und Dateinamen aus dem Request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            diagnosisID = request.POST.get("diagnosisID")  # Diagnose-ID

            if not image_file or not filename or not diagnosisID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            # Parameter aus dem Request
            dataset_name = request.GET.get("dataset", "website_data").lower()
            
            docID = request.user.id
            subID = getURL(diagnosisID)

            # Definiere die Verzeichnisstruktur und verwende dabei dataset_name
            sub_folder = os.path.join(
                settings.MEDIA_ROOT,
                f"{dataset_name}",
                "derivatives",
                "diagnosis",
                f"sub-{subID}",
                f"doc-{docID}"
            )

            # Stelle sicher, dass das Verzeichnis existiert
            os.makedirs(sub_folder, exist_ok=True)

            # Voller Dateipfad
            filepath = os.path.join(sub_folder, filename)

            # Speichere die Datei
            with open(filepath, "wb") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)

            setContinueDiag(docID, diagnosisID)

            return JsonResponse({"message": "Image saved successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

            

class DeleteDiagnosisAPIView(APIView):
    def delete(self, request):
        """
        API endpoint to delete a diagnosis from the database
        """
        try:
            # Get the doctor ID (from the logged-in user)
            docID = request.user.id

            # Call the function to delete the diagnosis
            result = deleteContinueDiag(docID)

            if result["status"]:
                return Response({
                    'status': 'success',
                    'message': 'Diagnosis deleted successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'message': result["message"]
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'An unexpected error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
