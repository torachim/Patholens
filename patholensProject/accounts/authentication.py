from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend


class EmailAuthenticationBackend(BaseBackend):
    
    def authenticate(self, request, email = None, password = None):
        try:
            user = get_user_model().objects.get(email=email)
            
            if user.check_password(password=password):
                return user
        
        except get_user_model().DoesNotExist:
            return None
        
    
    def get_user(self, user_id):
        try:
            return get_user_model().objects.get(user_id)
        except get_user_model().DoesNotExist:
            return None