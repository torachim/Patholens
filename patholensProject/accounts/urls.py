from django.urls import path, include
from . import views

urlpatterns = [
    path('api/', include('accounts.api_urls')),
    path('', views.loginView, name='patholensLogin'),
    path('signup/', views.signupView, name='patholensSignUp'),
    path('logout/<str:calledFrom>/', views.logoutView, name = 'patholensLogout')

]
