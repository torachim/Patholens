from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import redirect


def loginView(request):

    information = {"error": False}

    # when user is already loged in
    if request.user.is_authenticated:

        print("already logged in")
        
        # TODO: rediretc to starting page
        return redirect("/")

    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get("password")

        # remove @ and . so that the usernmae is email without the special characters
        email = email.replace("@", "")
        email = email.replace(".", "")


        user = authenticate(username=email, password=password)

        if user is not None:
            login(request, user)
            return redirect("/")
        
        else:
            information["error"] = True

    return render(request, "accounts/login.html", information)
