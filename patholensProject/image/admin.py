from django.contrib import admin
from .models import UseTime, Diagnosis, Media
from django.contrib import messages

admin.site.register(UseTime)
admin.site.register(Diagnosis)


class MediaAdmin(admin.ModelAdmin):
    actions = ["addMedia"]

    def addMedia(self, request, queryset=None):
        try:
            from image.mediaHandler import addMedia
            addMedia()
        except Exception as e:
            self.message_user(request, "The new datasets where added to the Media Database", messages.SUCCESS)
            self.message_user(request, f"Their was a error when running 'addMedia': {str(e)}", messages.ERROR)

    addMedia.short_description = "Calls the function addMedia which adds all the datasets in the /media folder to the Media DB"
    

admin.site.register(Media, MediaAdmin)
