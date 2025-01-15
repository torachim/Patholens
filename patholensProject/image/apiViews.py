from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from django.http import JsonResponse
from django.conf import settings
import os
from image.diagnosisManager import getURL, ConfidenceType, setConfidence
from accounts.doctorManager import deleteContinueDiag
from .timeHandler import setUseTime

import os


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
            #do NOT remove this space
            imageFormat = request.GET.get("format ") 
            if not imageFormat:
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


class GetDiagnosis(APIView):

    def get(self, request, diagnosisID):
        """
        Function to get the diagnosis Mask for a specific diagnosisID

        Args:
            diagnosisID (string): a diagnosisID 

        Returns:
            Path to the image of the diagnosis
        """
        try:
            if not diagnosisID:
                return Response({"error": "DiagnosisID required"},
                                 status=status.HTTP_400_BAD_REQUEST
                                )
            
            subID = getURL(diagnosisID)
            docID = request.user.id

            diagnosisPath = os.path.join(
                        settings.MEDIA_ROOT,
                        f"website_data/derivatives/diagnosis/sub-{subID}/sub-{subID}_acq-{docID}_space-edited-image.nii.gz"
            )
            
            if not os.path.exists(diagnosisPath):
                return Response(
                    {"error": f"Diagnosis file {diagnosisPath} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            relativePath = f"media/website_data/derivatives/diagnosis/sub-{subID}/sub-{subID}_acq-{docID}_space-edited-image.nii.gz"

            return Response(
                    {"status": "success",
                     "path": relativePath,
                    },
                    status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                    {"error": str(e)},
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

            # check if it is a valid value
            if confidence is None or not (0 <= int(confidence) <= 10):
                return Response({'error': 'Invalid confidence value. It must be between 0 and 10.'}, status=status.HTTP_400_BAD_REQUEST)

            """
            # TODO: Get the name for the lesions 
            # TODO: Know which confidence you want to save: First confidence, AI confidence, edited confidence
            """
            
            keyValue = [{"allLesions": confidence}]
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
    API Class to get both the MRI image and AI mask for a given diagnosisID.
    """

    def get(self, request, diagnosisID):
        """
        API endpoint which returns the URL of the requested AI Mask and the 
        brain image

        Args:
            diagnosisID (string): The given diagnosis

        Returns:
            Response: URls for the requested AI Mask and brain image
        """
        try:
            if not diagnosisID:
                return Response({"error": "diagnosisID is required"}, status=status.HTTP_400_BAD_REQUEST)

            imageFormatMask = request.GET.get("mask", "DEEPFCD").upper()
            imageFormatMri = request.GET.get('mri').upper()

            if imageFormatMask not in settings.SUPPORTED_IMAGE_FORMATS or imageFormatMri not in settings.SUPPORTED_IMAGE_FORMATS:
                return JsonResponse({"error": "Invalid format"}, status=400)

            # Get the MRI image path
            imageID = getURL(diagnosisID)
            fileSuffixMri = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMri]  # Default MRI format
            mriPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}",
                )
            )

            # Get the AI mask path
            fileSuffixMask = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMask]
            maskPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"website_data/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}",
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

            # Relative paths for the client
            mriRelativePath = f"/media/website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}"
            maskRelativePath = f"/media/website_data/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}"


            return Response(
                {"status": "success", "data": {"mriPath": mriRelativePath, "maskPath": maskRelativePath}},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
     
     
class GetDiagnosis(APIView):

    def get(self, request, diagnosisID):
        """
        Function to get the diagnosis Mask for a specific diagnosisID

        Args:
            diagnosisID (string): a diagnosisID 

        Returns:
            Path to the Diagnosis Image
        """
        try:
            if not diagnosisID:
                return Response({"error": "DiagnosisID required"},
                                 status=status.HTTP_400_BAD_REQUEST
                                )
            
            subID = getURL(diagnosisID)
            docID = request.user.id

            diagnosisPath = os.path.join(
                        settings.MEDIA_ROOT,
                        f"website_data/derivatives/diagnosis/sub-{subID}/doc-{docID}/sub-{subID}_acq-{docID}_space-edited-image.nii.gz"
            )
            
            if not os.path.exists(diagnosisPath):
                return Response(
                    {"error": f"Diagnosis File {diagnosisPath} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            relativePath = f"media/website_data/derivatives/diagnosis/sub-{subID}/doc-{docID}/sub-{subID}_acq-{docID}_space-edited-image.nii.gz"

            return Response(
                    {"status": "success",
                     "path": relativePath,
                    },
                    status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            



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
