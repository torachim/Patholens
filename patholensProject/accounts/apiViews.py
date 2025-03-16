from django.http import JsonResponse
from image.diagnosisManager import getURL
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.shortcuts import render

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response



class getURLAPIView(APIView):
    def get(self, request, diagID):
        try:
            # call `getURL`-function
            url = getURL(diagID)
            if url:
                return Response({"url": url}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Diagnosis not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class getDocIDView(APIView):    
    def get(self, request):
        try:
            # call `getDocID`-function
            docID = request.user.id
            if docID:
                return Response({"docID": docID}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)