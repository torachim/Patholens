from django.urls import path
from . import views

urlpatterns = [
    path('', views.loadImage, name='loadImage'),
]