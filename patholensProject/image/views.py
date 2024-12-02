import requests
from django.shortcuts import render
from django.urls import reverse

def renderImageView(request, imageID):
    try:

        api_url = f"http://localhost:8000/api/getImage/{imageID}/"

        print("Das ist die URL", api_url)

        response = requests.get(api_url)

        if response.status_code == 200:
            return render(request, 'image/loadTest.html', {'image_url': api_url})
        
        else:
            return render(request, 'image/loadTest.html', {"error": "Bild nicht gefunden"})
    
    except Exception as e:
        return render(request, 'image/loadTest.html', {"error": f'Fehler: {str(e)}'})
