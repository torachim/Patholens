from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


def signupView(request):

    information = {"userFree": True, "equalPasswords": True, "passwordStrength": True}

    # user is already loged in
    if request.user.is_authenticated:
        # TODO: rediretc to starting page
        print("nutzer ist schon eingeloggt")
    
    if request.method == "POST":
        firstName = request.POST.get("firstName")
        lastName = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")

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
            information["userFree"] = False                
            return render(request, "accounts/signup.html", {"information": information})

        elif confirmPassword != password:
            information["equalPasswords"] = False
            return render(request, "accounts/signup.html", {"information": information})

        
        try:
            validate_password(password)

        # reason why password is not strong enough
        except ValidationError as e:
            print(e.messages)

            information["passwordStrength"] = False
            return render(request, "accounts/signup.html", {"information": information})

        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=firstName,
            last_name=lastName,
            password=password,
        )
        login(request, user)

        print("Nutzer ist erfolgreich registriert worden")

    else:
        print("Error: POST was not used")

    return render(request, "accounts/signup.html", {"information": information})
