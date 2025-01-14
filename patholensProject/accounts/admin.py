from django import forms
from django.contrib import admin

from .models import Doctors


class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctors
        # show every field in the panel
        fields = '__all__'
        widgets = {
            'datasets': forms.CheckboxSelectMultiple,
        }


class DoctorAdmin(admin.ModelAdmin):
    form = DoctorForm
    filter_horizontal = ('datasets',)


admin.site.register(Doctors, DoctorAdmin)
