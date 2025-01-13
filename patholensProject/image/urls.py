from .apiViews import SetUseTimeAPIView, GetImageAPIView, SaveConfidenceAPIView, GetImageAndMaskAPIView, GetDiagnosis
from django.urls import path, include
from . import views


urlpatterns = [
    path('', include('accounts.urls')),

    path('api/saveConfidence/<str:diagID>/', SaveConfidenceAPIView.as_view(), name='saveConfidence'),
    path('api/getImage/<str:diagnosisID>/', GetImageAPIView.as_view(), name='getImage'),
    path('api/setUseTime/', SetUseTimeAPIView.as_view(), name='setUseTime'),
    path("api/saveImage/", views.saveImage, name="saveImage"),
    path('api/getDiagnosis/<str:diagnosisID>/', GetDiagnosis.as_view(), name='getDiagnosis'),
    path('api/getImageAndMask/<str:diagnosisID>/', GetImageAndMaskAPIView.as_view(), name='getImageAndMask'),

    path('AIpage/<str:diagnosisID>/', views.AIPage, name='AIpage'),
    
    path('newDiagnosis/<str:diagnosisID>/', views.newDiagnosis, name='newDiagnosis'),
    path('newDiagnosis/<str:diagnosisID>/<str:mode>/', views.newDiagnosis, name='newDiagnosis'),
    
    path('editDiagnosis/<str:diagnosisID>/', views.editDiagnosis, name='editDiagnosis'),
    path("editDiagnosis/<str:diagnosisID>/transitionPage/", views.transitionPage, name="transitionPage"),
]
