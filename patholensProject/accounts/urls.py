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
