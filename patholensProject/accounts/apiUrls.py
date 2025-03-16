from django.urls import path
from .apiViews import getURLAPIView, getDocIDView

urlpatterns = [
    path('getURL/<str:diagID>/', getURLAPIView.as_view(), name='getUrlApi'),
    path('getDoctorID/', getDocIDView.as_view(), name='getDocID')
]
