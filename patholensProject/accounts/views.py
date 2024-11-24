from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


def signupView(request):

    information = {"availableUser": True, "equalPasswords": True, "passwordStrength": True, "entryComplete": True}

    # user is already loged in
    if request.user.is_authenticated:
        # TODO: rediretc to starting page
        print("user ist already logged in")
    
    if request.method == "POST":
        firstName = request.POST.get("firstName")
        lastName = request.POST.get("lastName")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")
        
        
        # stirp checks if one element is empyt or None
        webParameters = [firstName.strip(), lastName.strip(), email.strip(), password.strip(), confirmPassword.strip()]
        
        # one parameter is missing 
        if not all(webParameters):
            information["entryComplete"] = False
            print("in no all parm are filled")
            return termination(request, information)

        
        elif confirmPassword != password:
            information["equalPasswords"] = False
            return termination(request, information)
        
        
        # our username it the email but without the special characters
        username = email.replace("@", "")
        username = username.replace(".", "")

        
        # check if a user exists with one of these variables
        usernameExists = User.objects.filter(username=username).exists()
        nameExists = User.objects.filter(first_name=firstName, last_name=lastName).exists()
        emailExists = User.objects.filter(email=email).exists()

        alreadyExistent = [
            usernameExists,
            nameExists,
            emailExists,
        ]

        if any(alreadyExistent):
            information["availableUser"] = False                
            return termination(request, information)


        # check if password is strong enough        
        try:
            validate_password(password)

        # reason why password is not strong enough
        except ValidationError as e:
            print(e.messages)

            information["passwordStrength"] = False
            return termination(request, information)

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=firstName,
            last_name=lastName,
            password=password,
        )
        login(request, user)

        print("user was successfully signed up")

    else:
        print("Error: POST was not used")

    return render(request, "accounts/signup.html", {"information": information})



def termination(request, information):
    logout(request)
    return render(request, "accounts/signup.html", {"information": information})