from django.urls import path, include
from .apiViews import SetUseTimeAPIView, GetImageAPIView, SaveConfidenceAPIView, GetImageAndMaskAPIView, GetDiagnosis, DeleteDiagnosisAPIView, saveImageAPIView, setContinueAPIView, getLesionConfidence, getNumberLesions, toggleLesionShown, toggleLesionDelete, hardDelete
from . import views

urlpatterns = [
    path('saveConfidence/<str:diagID>/', SaveConfidenceAPIView.as_view(), name='saveConfidence'),
    path('getImage/<str:diagnosisID>/', GetImageAPIView.as_view(), name='getImage'),
    path('setUseTime/', SetUseTimeAPIView.as_view(), name='setUseTime'),
    path("saveImage/", saveImageAPIView.as_view(), name='saveImage'),
    path('getDiagnosis/<str:diagnosisID>/', GetDiagnosis.as_view(), name='getDiagnosis'),
    path('getImageAndMask/<str:diagnosisID>/', GetImageAndMaskAPIView.as_view(), name='getImageAndMask'),
    path('deleteDiagnosis/', DeleteDiagnosisAPIView.as_view(), name='deleteDiagnosis'),
    path('setContinue/', setContinueAPIView.as_view(), name='setContinue'),
    path('getLesionConfidence/<str:diagnosisID>/', getLesionConfidence.as_view(), name='getLesionConfidence'),
    path('getNumberLesions/<str:diagnosisID>/', getNumberLesions.as_view(), name='getNumberLesions'),
    path('toggleShownLesion/', toggleLesionShown.as_view(), name='toggleShownLesion'),
    path('toggleDeleteLesion/', toggleLesionDelete.as_view(), name='toggleDeleteLesion'),
    path('hardDeleteLesions/', hardDelete.as_view(), name='hardDelete'),
]