from django.urls import path
from . import views

urlpatterns = [
    path('getURL/<str:diagID>/', views.getURLApi, name='getUrlApi'),
    path('getDoctorID/', views.getDocID, name='getDocID')
]
