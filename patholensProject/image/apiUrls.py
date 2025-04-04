from django.urls import path, include
from .apiViews import SetUseTimeAPIView, GetImageAPIView, SaveConfidenceAPIView, GetImageAndMaskAPIView, GetDiagnosis, GetEditedDiagnosis, DeleteDiagnosisAPIView, saveImageAPIView, setContinueAPIView, GetLesionConfidence, GetNumberLesions, ToggleLesionShown, ToggleLesionDelete, HardDelete, HardEditedDelete, ToggleEditedLesion, AIModelNamesAPIView
from . import views

urlpatterns = [
    path('saveConfidence/<str:diagID>/', SaveConfidenceAPIView.as_view(), name='saveConfidence'),
    path('getImage/<str:diagnosisID>/', GetImageAPIView.as_view(), name='getImage'),
    path('setUseTime/', SetUseTimeAPIView.as_view(), name='setUseTime'),
    path("saveImage/", saveImageAPIView.as_view(), name='saveImage'),
    path('getDiagnosis/<str:diagnosisID>/', GetDiagnosis.as_view(), name='getDiagnosis'),
    path('getEditedDiagnosis/<str:diagnosisID>/', GetEditedDiagnosis.as_view(), name='getEditedDiagnosis'),
    path('getImageAndMask/<str:diagnosisID>/', GetImageAndMaskAPIView.as_view(), name='getImageAndMask'),
    path('deleteDiagnosis/', DeleteDiagnosisAPIView.as_view(), name='deleteDiagnosis'),
    path('setContinue/', setContinueAPIView.as_view(), name='setContinue'),
    path('getLesionConfidence/<str:diagnosisID>/', GetLesionConfidence.as_view(), name='getLesionConfidence'),
    path('getNumberLesions/<str:diagnosisID>/', GetNumberLesions.as_view(), name='getNumberLesions'),
    path('toggleShownLesion/', ToggleLesionShown.as_view(), name='toggleShownLesion'),
    path('toggleDeleteLesion/', ToggleLesionDelete.as_view(), name='toggleDeleteLesion'),
    path('hardDeleteLesions/', HardDelete.as_view(), name='hardDelete'),
    path('hardEditDelete/', HardEditedDelete.as_view(), name='hardEditDelete'),
    path('toggleEdit/', ToggleEditedLesion.as_view(), name='ToggleEdit'),
    path('getAiModels/<str:diagID>/', AIModelNamesAPIView.as_view(), name="getAiModel"),
]