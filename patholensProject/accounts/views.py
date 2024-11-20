from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import redirect

from django.contrib.auth.models import User

def loginView(request):

    information = {"username": True,
                   "password": True,
                   }

    # user is already loged in
    if request.user.is_authenticated:
        # TODO: rediretc to starting page
        return redirect("/")

    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        # remove '@' and '.' so that the usernmae is the email but without the special characters
        email = email.replace("@", "")
        email = email.replace(".", "")

        userExistent = User.objects.filter(username=email).exists()

        
        # user is not existent 
        if (userExistent == False):
            information["username"] = False
            return render(request, "accounts/login.html", information)
        
        
        user = authenticate(username=email, password=password)

        # login was successful
        if user is not None:
            login(request, user)
            return redirect("/")
        
        # password is incorrect
        else:
            information["password"] = False
    
    else:
        print("Error as POST was not used")
        
    return render(request, "accounts/login.html", {"information": information})
