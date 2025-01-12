from django.contrib import admin
from .models import UseTime, Diagnosis, Media
from django.contrib import messages
from import_export import resources, fields
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


class UseTimeInline(admin.StackedInline):
    model = UseTime
    verbose_name_plural = "Use Time"
    extra = 0  # Ensures no empty additional forms are shown


class DiagnosisResource(resources.ModelResource):
    
    actionTime = fields.Field(column_name="actionTime")
    class Meta:
        model = Diagnosis
        # to be exported fields
        fields = (
            'diagID', 
            'doctor', 
            'mediaFolder', 
            'imageURL', 
            'confidence', 
            'confidenceOfEditedDiag', 
            'confidenceOfAIdiag', 
            "actionTime", # this is the field from the UseTime model
            )

    # this method is called automatically by the import_export library
    def dehydrate_actionTime(self, diagnosis):
        try:
            return diagnosis.usetime.toDict().get('actionTime')
        except UseTime.DoesNotExist:
            return None


@admin.register(Diagnosis)
class DiagnosisAdmin(ExportMixin, admin.ModelAdmin):
    # links the custom resource
    resource_class = DiagnosisResource
    # attributes which should be showed
    list_display = ('diagID', 'doctor')
    # adds a filter options
    list_filter = ('doctor', 'mediaFolder')
    # adds the information from useTime to the diagnosis
    inlines = [UseTimeInline]

admin.site.register(Media, MediaAdmin)
admin.site.register(UseTime)