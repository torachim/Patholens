from rest_framework import serializers
from image.models import UseTime

class useTimeSerialize(serializers.ModelSerializer):
    class Meta:
        model = UseTime
        fields = ['diag', 'actionTime']