from django.urls import path, include
from .apiViews import SetUseTimeAPIView, GetImageAPIView, SaveConfidenceAPIView, GetImageAndMaskAPIView, GetDiagnosis, DeleteDiagnosisAPIView
from . import views

urlpatterns = [
    path('saveConfidence/<str:diagID>/', SaveConfidenceAPIView.as_view(), name='saveConfidence'),
    path('getImage/<str:diagnosisID>/', GetImageAPIView.as_view(), name='getImage'),
    path('setUseTime/', SetUseTimeAPIView.as_view(), name='setUseTime'),
    path("saveImage/", views.saveImage, name="saveImage"),
    path('getDiagnosis/<str:diagnosisID>/', GetDiagnosis.as_view(), name='getDiagnosis'),
    path('getImageAndMask/<str:diagnosisID>/', GetImageAndMaskAPIView.as_view(), name='getImageAndMask'),
    path('deleteDiagnosis/', DeleteDiagnosisAPIView.as_view(), name='deleteDiagnosis'),

]