from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import redirect


# Create your views here.
def login_view(request):
    error = False
    
    # when user is already loged in 
    if request.user.is_authenticated:
        
        # TODO: rediretc to starting page
        return redirect('/')  
    
    
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        user = authenticate(username=username, password=password)
        
        if (user is not None):
            login(request, user)
            messages.success(request, "Erfolgreich eingeloggt!")
            
            # TODO:  redirect to start page
            return redirect("/")
        else:
            error = True


    return render(request, 'accounts/login.html')

    
    
    