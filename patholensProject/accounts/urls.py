from django.urls import path, include
from . import views


urlpatterns = [
    path('api/', include('accounts.apiUrls')),
    path('', views.loginView, name='patholensLogin'),
    path('signup/', views.signupView, name='patholensSignUp'),
    path('logout/<str:calledFrom>/', views.logoutView, name = 'patholensLogout'),
    path('tutorial/', views.first_time_tutorial, name='first_time_tutorial')



]
