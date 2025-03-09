from django.contrib import admin
from django.contrib import messages
from django.contrib.admin.exceptions import DisallowedModelAdminLookup
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from import_export import resources, fields
from import_export.admin import ExportMixin

from .models import UseTime, Diagnosis, Media


class MediaAdmin(admin.ModelAdmin):
    """
    Custom admin class for managing Media objects in the admin interface.
    
    Provides a custom action to add media datasets from the /media folder to the database.
    """
    actions = ["syncMediaToDBAdminFunc"]

    def syncMediaToDBAdminFunc(self, request, queryset=None):
        """
        Adds new datasets from the /media folder to the Media database by calling the syncMediaToDB function.
        
        Args:
            * request: The HTTP request object.
            * queryset: Optional queryset of selected items (not used).
        """
        try:
            from image.mediaHandler import syncMediaToDB
            syncMediaToDB()
            self.message_user(request, "The Media Database is now up to date.", messages.SUCCESS)

        except Exception as e:
            self.message_user(request, f"Their was a error when running 'syncMediaToDB': {str(e)}", messages.ERROR)

    syncMediaToDBAdminFunc.short_description = "Add all datasets from the /media folder to the database"


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

    def get_search_results(self, request, queryset, search_term):
        """
        Handles search results in the admin interface, addressing disallowed lookups.

        Catches `DisallowedModelAdminLookup` exceptions and prevents errors when 
        filtering by restricted fields, such as `doctor__doctorID__exact`.

        Args:
            request (HttpRequest): The HTTP request object.
            queryset (QuerySet): The queryset to filter.
            search_term (str): The search term entered in the admin.

        Returns:
            tuple: Filtered queryset and a boolean indicating if results are reduced.

        Raises:
            DisallowedModelAdminLookup: For unsupported lookups not explicitly handled.
        """
        try:
            return super().get_search_results(request, queryset, search_term)
        except DisallowedModelAdminLookup as e:
            if "doctor__doctorID__exact" in str(e):
                # Log or handle the disallowed lookup gracefully
                self.message_user(request, "Filtering by doctor ID is restricted.", messages.ERROR)
                return queryset.none(), False
            raise
    
    def lookup_allowed(self, lookup, value):
        """
        Allow specific lookups in the admin filter that are otherwise disallowed.

        Parameters:
            * lookup (str): The lookup string to check.
            * value (Any): The value associated with the lookup.

        Returns:
            bool: True if the lookup is allowed, False otherwise.
        """
        if lookup == "doctor__doctorID__exact":
            return True
        return super().lookup_allowed(lookup, value)

    
admin.site.register(Media, MediaAdmin)
admin.site.register(UseTime)
