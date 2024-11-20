from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import redirect


# Create your views here.
def login_view(request):
    information = {
        'error' : False
        }
    
    #when user is already loged in 
    if request.user.is_authenticated:
        
        # TODO: rediretc to starting page
        return redirect('/')  
    
    
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        

        user = authenticate(username=email, password=password)
        
        if (user is not None):
            login(request, user)
            messages.success(request, "Login was successfully")
            
            # TODO:  redirect to start page
            return redirect("/")
        else:
            information["error"] = True

    return render(request, 'accounts/login.html', information)

    
    