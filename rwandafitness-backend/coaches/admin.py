from django.contrib import admin
from .models import CoachProfile, CoachGalleryImage


class CoachGalleryImageInline(admin.TabularInline):
    model = CoachGalleryImage
    extra = 1


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "specialty",
        "city",
        "gym",
        "years_experience",
        "is_verified",
        "available_online",
        "available_in_person",
    )
    list_filter = (
        "specialty",
        "is_verified",
        "available_online",
        "available_in_person",
        "city",
        "gym",
    )
    search_fields = (
        "user__full_name",
        "user__email",
        "city",
        "gym__name",
    )
    inlines = [CoachGalleryImageInline]


@admin.register(CoachGalleryImage)
class CoachGalleryImageAdmin(admin.ModelAdmin):
    list_display = ("coach", "caption", "sort_order", "created_at")
    list_filter = ("coach",)
    search_fields = ("coach__user__full_name", "caption")