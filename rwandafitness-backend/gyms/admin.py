from django.contrib import admin
from .models import Gym, GymGalleryImage


class GymGalleryImageInline(admin.TabularInline):
    model = GymGalleryImage
    extra = 1


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "phone",
        "email",
        "is_verified",
        "created_by",
    )
    list_filter = (
        "city",
        "is_verified",
    )
    search_fields = (
        "name",
        "city",
        "email",
        "phone",
    )
    inlines = [GymGalleryImageInline]


@admin.register(GymGalleryImage)
class GymGalleryImageAdmin(admin.ModelAdmin):
    list_display = ("gym", "caption", "sort_order", "created_at")
    list_filter = ("gym",)
    search_fields = ("gym__name", "caption")