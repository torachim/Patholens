from django.contrib import admin
from .models import UseTime, Diagnosis, Media
from django.contrib import messages
from import_export import resources
from import_export.admin import ExportMixin


class MediaAdmin(admin.ModelAdmin):
    actions = ["addMedia"]

    def addMedia(self, request, queryset=None):
        try:
            from image.mediaHandler import addMedia
            addMedia()
            self.message_user(request, "The new datasets where added to the Media Database", messages.SUCCESS)

        except Exception as e:
            self.message_user(request, f"Their was a error when running 'addMedia': {str(e)}", messages.ERROR)

    addMedia.short_description = "All data sets in the /media folder will be added to the Database"


class DiagnosisResource(resources.ModelResource):
    class Meta:
        model = Diagnosis
        # to be exported fields
        fields = ('diagID', 'doctor', 'mediaFolder', 'imageURL', 'confidence', 'confidenceOfEditedDiag', 'confidenceOfAIdiag')


@admin.register(Diagnosis)
class DiagnosisAdmin(ExportMixin, admin.ModelAdmin):
    # links the custom resource
    resource_class = DiagnosisResource
    # attributes which should be showed
    list_display = ('diagID', 'doctor')
    # adds a filter options
    list_filter = ('doctor', 'mediaFolder')


admin.site.register(Media, MediaAdmin)
admin.site.register(UseTime)