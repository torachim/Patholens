from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import redirect
from image.models import diagnosis
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import diagnosis  # Import your model
import json

# Create your views here.
def diagnosisView(request):
    return render(request, 'diagnosisPage.html')


#def diagnosisView(request, diag_id): 
#    diagnosisObj = diagnosis.objects.get(diagID=diag_id)
#    return render(request, 'diagnosisPage.html', {'diagID': diagnosisObj.diagID})



def saveConfidence(request, diagID):
    if request.method == 'POST':
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            confidence = data.get('confidence')

            # Validate confidence value (must be between 0 and 100)
            if confidence is None or not (0 <= int(confidence) <= 100):
                return JsonResponse({'error': 'Invalid confidence value. It must be between 0 and 100.'}, status=400)

            
            diag = get_object_or_404(diagnosis, diagID=diagID)

            # Update the confidence value
            diag.confidence = int(confidence)
            diag.save()

            return JsonResponse({'message': 'Confidence value saved successfully!'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data in request.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    else:
       
        return JsonResponse({'error': 'Invalid request method. Use POST.'}, status=405)