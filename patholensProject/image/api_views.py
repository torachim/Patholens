from rest_framework.views import APIView
from django.http import FileResponse
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import diagnosis
import os


class GetImageAPIView(APIView):
    
    def get(self, request, imageID):

        try:
            datasetPath = settings.EXTERNAL_DATASET_PATH
            imagePath = os.path.join(datasetPath, f"sub-{imageID}")
            imageFile = os.path.join(imagePath, "anat", f"sub-{imageID}_space-orig_FLAIR.nii.gz")

            print(imageFile)

            if not os.path.exists(imageFile):
                print("nicht geil")
                return Response({"error": "Image not found"}, status = status.HTTP_404_NOT_FOUND)

            return FileResponse(open(imageFile, "rb"), as_attachment=True, filename= f"sub-{imageID}_space-orig_FLAIR.nii.gz")
        except Exception as e:
            print("kacke")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


