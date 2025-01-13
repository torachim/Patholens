from django.contrib import admin
from django.contrib import messages

from import_export import resources, fields
from import_export.admin import ExportMixin

from .models import UseTime, Diagnosis, Media


class MediaAdmin(admin.ModelAdmin):
    """
    Custom admin class for managing Media objects in the admin interface.
    
    Provides a custom action to add media datasets from the /media folder to the database.
    """
    actions = ["addMedia"]

    def addMedia(self, request, queryset=None):
        """
        Adds new datasets from the /media folder to the Media database by calling the addMedia function.
        
        Args:
            * request: The HTTP request object.
            * queryset: Optional queryset of selected items (not used).
        """
        try:
            from image.mediaHandler import addMedia
            addMedia()
            self.message_user(request, "The new datasets where added to the Media Database", messages.SUCCESS)

        except Exception as e:
            self.message_user(request, f"Their was a error when running 'addMedia': {str(e)}", messages.ERROR)

    addMedia.short_description = "All data sets in the /media folder will be added to the Database"


class UseTimeInline(admin.StackedInline):
    """
    Inline admin class for managing UseTime objects related to a Diagnosis.
    
    Displays UseTime records as stacked inline forms within the Diagnosis admin interface.
    """
    model = UseTime
    verbose_name_plural = "Use Time"
    extra = 0  # Ensures no empty additional forms are shown


class DiagnosisResource(resources.ModelResource):
    """
    Custom resource class for managing import/export of Diagnosis objects.
    
    Defines custom fields and logic for exporting data related to Diagnosis, including related UseTime data.
    """
    actionTime = fields.Field(column_name="actionTime")
    
    class Meta:
        """
        Meta options for DiagnosisResource.
        
        Specifies the model and fields to be included in the export process.
        """
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
    """
    Custom method to retrieve the `actionTime` field from the related UseTime object.

    Args:
        diagnosis: The Diagnosis object being processed.

    Returns:
        The `actionTime` value as a string if available, otherwise `None`.
    """
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
