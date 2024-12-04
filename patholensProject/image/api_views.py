from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import diagnosis
import os


class GetImageAPIView(APIView):
    
    def get(self, request, imageID):

        try:

            imageFormat = request.GET.get("format ")
            if not imageFormat:
                print("Format parameter missing; using default FLAIR.")
                imageFormat = "FLAIR"

            imageFormat = imageFormat.upper()


            if imageFormat not in settings.SUPPORTED_IMAGE_FORMATS:
                return JsonResponse({"error": "Invalid format"}, status=400)
            
            fileSuffix = settings.SUPPORTED_IMAGE_FORMATS[imageFormat]

            imagePath = os.path.join(settings.MEDIA_ROOT, f"website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffix}")
            if not os.path.exists(imagePath):
                return Response({"error": "Image not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Relativer Pfad für den Client
            relativePath = f"/media/website_data/sub-{imageID}/anat/sub-{imageID}{fileSuffix}"
            return Response({"path": relativePath}, status=status.HTTP_200_OK)


        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


