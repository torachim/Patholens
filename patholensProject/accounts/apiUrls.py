from django.urls import path
from . import apiViews

urlpatterns = [
    path('getURL/<str:diagID>/', apiViews.getURLApi, name='getUrlApi'),
    path('getDoctorID/', apiViews.getDocID, name='getDocID')
]
