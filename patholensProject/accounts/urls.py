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

from django.urls import path
from . import views
from .apiViews import getURLApi
from .apiViews import getDocID

urlpatterns = [
    path('', views.loginView, name='patholensLogin'),
    path('signup/', views.signupView, name='patholensSignUp'),
    path('logout/<str:calledFrom>/', views.logoutView, name = 'patholensLogout'),

    path('api/getURL/<str:diagID>/', getURLApi, name='getUrlApi'),
    path('api/getDoctorID/', getDocID, name='getDocID'),

]
