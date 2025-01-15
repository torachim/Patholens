from .apiViews import SetUseTimeAPIView, GetImageAPIView, SaveConfidenceAPIView, GetImageAndMaskAPIView, GetDiagnosis
from django.urls import path, include
from . import views

urlpatterns = [
    
    path('api/', include('image.apiUrls')),
    path('', include('accounts.urls')),

    path('AIpage/<str:diagnosisID>/', views.AIPage, name='AIpage'),
    
    path('newDiagnosis/<str:diagnosisID>/', views.newDiagnosis, name='newDiagnosis'),
    path('newDiagnosis/<str:diagnosisID>/<str:mode>/', views.newDiagnosis, name='newDiagnosis'),
    
    path('editDiagnosis/<str:diagnosisID>/', views.editDiagnosis, name='editDiagnosis'),
    path("editDiagnosis/<str:diagnosisID>/transitionPage/", views.transitionPage, name="transitionPage")
]
