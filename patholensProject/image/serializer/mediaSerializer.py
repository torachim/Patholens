from rest_framework import serializers
from image.models import Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['mediaID', 'name', 'url']
        