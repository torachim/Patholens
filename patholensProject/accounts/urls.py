from django.urls import path
from . import views

urlpatterns = [
    path('', views.loginView, name='patholensLogin'),
    path('signup/', views.signupView, name='patholensSignUp'),
    path('logout/<str:calledFrom>/', views.logoutView, name = 'patholensLogout'),

    path('api/getURL/<str:diagID>/', views.getURLApi, name='getUrlApi'),
    path('api/getDoctorID/', views.getDocID, name='getDocID'),

]
