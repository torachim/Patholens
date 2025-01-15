from django.urls import path, include
from . import views
from .apiViews import getURLApi
from .apiViews import getDocID

urlpatterns = [
    path('api/', include('accounts.apiUrls')),
    path('', views.loginView, name='patholensLogin'),
    path('signup/', views.signupView, name='patholensSignUp'),
    path('logout/<str:calledFrom>/', views.logoutView, name = 'patholensLogout')

]
