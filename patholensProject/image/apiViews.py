from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.conf import settings
import os
import re
from .diagnosisServices import getURL, ConfidenceType, setConfidence, getDatasetName
from accounts.doctorServices import setContinueDiag, deleteContinueDiag
from .timeServices import setUseTime
from .lesionServices import createLesion, getLesions, getLesionsConfidence, getNumberOfLesion, toggleShowLesion, toggleDeleteLesion, hardDeleteLesions
from .mediaServices import getAIModels
from .dataHandler import savePicture
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
            
            datasetName = getDatasetName(diagnosisID).lower()
            if not datasetName:
                return JsonResponse({"error": "Dataset name is required"}, status=400)

            # get the path to the image of a given diagnosis
            imageID = getURL(diagnosisID)
            
            fileSuffix = settings.SUPPORTED_IMAGE_FORMATS[imageFormat]
            imagePath = os.path.join(
                settings.MEDIA_ROOT,
                f"{datasetName}/sub-{imageID}/anat/sub-{imageID}{fileSuffix}",
            )
            if not os.path.exists(imagePath):
                return Response(
                    {"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # relative path for the client
            relativePath = (
                f"/media/{datasetName}/sub-{imageID}/anat/sub-{imageID}{fileSuffix}"
            )
            return Response({"path": relativePath}, status=status.HTTP_200_OK)

        except Exception as e:
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
            
            datasetName = getDatasetName(diagnosisID).lower()
            if not datasetName:
                return JsonResponse({"error": "Dataset name is required"}, status=400)

            # Get the MRI image path
            imageID = getURL(diagnosisID)
            fileSuffixMri = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMri]  # Default MRI format
            mriPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"{datasetName}/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}",
                )
            )

            # Get the AI mask path
            fileSuffixMask = settings.SUPPORTED_IMAGE_FORMATS[imageFormatMask]
            maskPath = os.path.normpath(
                os.path.join(
                    settings.MEDIA_ROOT,
                    f"{datasetName}/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}",
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
            mriRelativePath = f"/media/{datasetName}/sub-{imageID}/anat/sub-{imageID}{fileSuffixMri}"
            maskRelativePath = f"/media/{datasetName}/derivatives/ai/sub-{imageID}/pred/sub-{imageID}{fileSuffixMask}"


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
            
            datasetName = getDatasetName(diagnosisID).lower()
            if not datasetName:
                return JsonResponse({"error": "Dataset name is required"}, status=400)

            lesions = getLesions(diagnosisID)
            urlLesions = []
            shown = []
            for lesion in lesions:
                url = lesion['url']
                mediaUrl = os.path.join(
                                'media',
                                url
                                )
                urlLesions.append(mediaUrl)
                shown.append(lesion['shown'])

            return Response(
                    {"status": "success",
                     "files": urlLesions,
                     'status': shown,
                    },
                    status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                    {"error": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class setContinueAPIView(APIView):
    """
    API Class to set the continue status for an ongoing diagnosis

    """
    def post(self, request):
        
        try:
            data = request.data
            docID = data.get("docID")
            diagnosisID = data.get("diagnosisID")
            website = data.get("website")

            if(not docID or not diagnosisID):
                return Response({"error": "Invalid Data"}, status=status.HTTP_404_NOT_FOUND)
            
            setContinueDiag(docID, diagnosisID, website)

            return Response({"status": "success"},
                            status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class saveImageAPIView(APIView):
    """
    API Class to save an Image in the database 
    """
    def post(self, request):
        try:
            # Extract file and file name from the request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            diagnosisID = request.POST.get("diagnosisID")
            lesionName = request.POST.get("lesionName")
            confidence = request.POST.get("confidence")
            
            datasetName = getDatasetName(diagnosisID).lower()

            if not datasetName:
                return JsonResponse({"error": "Dataset name is required"}, status=400)  # get the subID from the request
            

            if not image_file or not filename or not diagnosisID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            docID = request.user.id
            subID = getURL(diagnosisID)

            mediaURL = os.path.join(
                f"{datasetName}",
                "derivatives",
                "diagnosis",
                f"sub-{subID}",
                f"doc-{docID}"
            )
            
            fileURL = os.path.join(mediaURL, filename)
            
            
            savePicture(datasetName, subID, docID, filename, image_file, mediaURL)
            
            
            setContinueDiag(docID, diagnosisID)
            createLesion(diagnosisID, confidence, lesionName, fileURL)

            return JsonResponse({"message": "Image saved successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            

class DeleteDiagnosisAPIView(APIView):
    """
    API Class to delete the continue status of a diagnosis
    """
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


class GetLesionConfidence(APIView):
    """
    API Class to get the confidence for the marked lesions of a diagnosis
    """

    def get(self, request, diagnosisID):
        try:
            if not diagnosisID:
                return Response({
                    'status': 'error',
                    'error': 'DiagnosisID is required'
                },
                status = status.HTTP_400_BAD_REQUEST
                )
            
            #confidences: dict = getConfidence(diagnosisID)
            lesion = getLesionsConfidence(diagnosisID)

            return Response({
                'status': 'success',
                'data': lesion,
            },
            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': f'An unexpected error occured: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
class GetNumberLesions(APIView):
    """
    API Class to get the number of lesions (i.e. the number of saved images) of a diagnosis
    """
    def get(self, request, diagnosisID):
                
        try:
            if not (diagnosisID):
                return Response({
                        'status': 'Error',
                        'message': 'Diagnosis ID is required',
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            numberOfLesions = getNumberOfLesion(diagnosisID)
            
            return Response({
                    'status': 'success',
                    'message': 'Number of lesions tranfered',
                    'number': numberOfLesions,
                }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                    'status': 'error',
                    'message': f'An unexpected Error occured {e}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class ToggleLesionDelete(APIView):
    """
    API Class to toggle the delete status of a lesion -> enables soft delete
    """

    def post(self, request):
        try:
            data = request.data
            lesionID = data.get('lesionID')

            if not lesionID:
                return Response({
                    'stauts': 'Error',
                    'message': 'LesionID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if(toggleDeleteLesion(lesionID)):
                return Response({
                    'status': 'success',
                    'message': 'Lesion delete toggle successful',
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'Error',
                    'message': 'Error during delete toggle of the lesion'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                    'status': 'error',
                    'message': f'An unexpected Error occured {e}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ToggleLesionShown(APIView):
    """
    API Class to toggle the shown status of the lesion
    """
    def post(self, request):

        try:
            data = request.data
            lesionID = data.get("lesionID")

            if not lesionID:
                return Response({
                        'status': 'Error',
                        'message': 'LesionID is required',
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if toggleShowLesion(lesionID):
                return Response({
                    'status': 'success',
                    'message': 'Lesion shown status changed successfully',
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'Error',
                    'message': 'Error during changing status of the lesion'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                    'status': 'error',
                    'message': f'An unexpected Error occured {e}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class HardDelete(APIView):
    """
    API Class to hard delete a Lesion -> delete it from the database
    """
    def delete(self, request):
        try:
            data = request.data
            diagnosisID = data.get('diagnosisID')
            if not diagnosisID:
                return Response({
                        'status': 'Error',
                        'message': 'DiagnosisID is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            urls, deletetCount = hardDeleteLesions(diagnosisID)
            if deletetCount != 0:
                for url in urls:
                    imagePath = os.path.join(settings.MEDIA_ROOT,
                                            url,
                                            )
                    if os.path.isfile:
                        os.remove(imagePath)

            return Response({
                    'status': 'success',
                    'message': 'Lesion shown status changed successfully',
                    }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                    'status': 'Error',
                    'message': f"An unexpected error occured {e}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class AIModelNamesAPIView(APIView):
    def get(self, request, diagID):
        
        dataset = getDatasetName(diagID)        
        aiModelNames: list[str] = getAIModels(dataset)   # get all the ai model names

        if aiModelNames == []:
            return Response({
                'status': 'error',
                'message': f'No ai models were found'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        else:
            return Response({
                'status': 'success',
                'models': aiModelNames
            }, status=status.HTTP_200_OK)
