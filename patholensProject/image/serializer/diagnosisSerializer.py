from rest_framework import serializers
from image.models import Diagnosis

class diagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = ["diagID", "doctor", "confidence", "editedDiagConfidence", "imageUrl"]

