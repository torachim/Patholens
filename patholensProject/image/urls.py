"""
URL configuration for patholensProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path, include
from . import views
from .apiViews import SetUseTimeAPIView
from .apiViews import GetImageAPIView
from .apiViews import SaveConfidenceAPIView
from .apiViews import GetImageAndMaskAPIView
from .apiViews import GetDiagnosis

urlpatterns = [
    
    path('', include('accounts.urls')),
    path('api/saveConfidence/<str:diagID>/', SaveConfidenceAPIView.as_view(), name='saveConfidence'),
    
    path('api/getImage/<str:diagnosisID>/', GetImageAPIView.as_view(), name='getImage'),
    path('api/setUseTime/', SetUseTimeAPIView.as_view(), name='setUseTime'),
    path('newDiagnosis/<str:diagnosisID>/', views.newDiagnosis, name='newDiagnosis'),


    path('AIpage/<str:diagnosisID>/', views.AIPage, name='AIpage'),
    path('api/getImageAndMask/<str:diagnosisID>/', GetImageAndMaskAPIView.as_view(), name='getImageAndMask'),
    path("api/saveImage/", views.saveImage, name="saveImage"),
    path('api/getDiagnosis/<str:diagnosisID>/', GetDiagnosis.as_view(), name='getDiagnosis'),
]