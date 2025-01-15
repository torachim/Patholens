from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import redirect
from django.http import JsonResponse
from django.shortcuts import render

from image.mediaHandler import addMedia
from image.diagnosisManager import getURL
from . import doctorManager


def customLogin(request, user):
    # Call the default login function
    login(request, user)
    
    # if their are any new folders in the media folder the ulrs will be added to the db or a new entry will be added
    addMedia()

def signupView(request):

    information = {
        "availableUser": True,
        "equalPasswords": True,
        "passwordStrength": True,
        "entryComplete": True,
    }

    # user is already logged in
    if request.user.is_authenticated:
        return redirect("StartingPage")

    if request.method == "POST":
        firstName = request.POST.get("firstName")
        lastName = request.POST.get("lastName")
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirmPassword = request.POST.get("confirmPassword")

        # strip checks if one element is empty or None
        webParameters = [
            firstName.strip(),
            lastName.strip(),
            email.strip(),
            password.strip(),
            confirmPassword.strip(),
        ]

        # one parameter is missing
        if not all(webParameters):
            information["entryComplete"] = False
            return termination(request, information)

        elif confirmPassword != password:
            information["equalPasswords"] = False
            return termination(request, information)

        # our username is the email but without the special characters
        username = email.replace("@", "AT")
        username = username.replace(".", "POINT")

        # check if a user exists with one of these variables
        usernameExists = User.objects.filter(username=username).exists()
        nameExists = User.objects.filter(
            first_name=firstName, last_name=lastName
        ).exists()
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
            information["passwordStrength"] = False
            return termination(request, information)

        # user creation
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=firstName,
            last_name=lastName,
            password=password,
        )

        # creates a doctor
        doctorManager.createDoctor(user)

        # login of user
        customLogin(request, user)
        
        return redirect("StartingPage")

    return render(request, "accounts/signup.html", {"information": information})

def termination(request, information):
    logout(request)
    return render(request, "accounts/signup.html", {"information": information})

def loginView(request):

    information = {
        "username": True,
        "password": True,
    }

    # user is already logged in
    if request.user.is_authenticated:
        return redirect("StartingPage")

    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        # remove '@' and '.' so that the username is the email but without the special characters
        email = email.replace("@", "AT")
        email = email.replace(".", "POINT")

        userExistent = User.objects.filter(username=email).exists()

        # user is not existent
        if not userExistent:
            information["username"] = False
            return render(request, "accounts/login.html", {"information": information})

        user = authenticate(username=email, password=password)

        # login was successful
        if user is not None:
            customLogin(request, user)
            return redirect("StartingPage")

        # password is incorrect
        else:
            information["password"] = False


    return render(request, "accounts/login.html", {"information": information})

@login_required
def logoutView(request, calledFrom):
    # if called from one of these pages, the process needs to be saved before logging out
    if calledFrom == "diagnosisPage" or calledFrom == "editPage":
        # TODO: save progress
        pass

    logout(request)
    return redirect("/")  # redirects to the login screen

