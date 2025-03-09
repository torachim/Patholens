from django import forms
from django.contrib import admin

from .models import Doctors
from image.models import Media

class DoctorForm(forms.ModelForm):
    class Meta:
        model = Doctors
        # show every field in the panel
        fields = '__all__'
        widgets = {
            'datasets': forms.CheckboxSelectMultiple,
        }


class DoctorAdmin(admin.ModelAdmin):
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "datasets":
            # only show visible datasets
            kwargs["queryset"] = Media.objects.filter(visibility=True)
        return super().formfield_for_manytomany(db_field, request, **kwargs)
    
    form = DoctorForm
    filter_horizontal = ('datasets',)


admin.site.register(Doctors, DoctorAdmin)
