from django.contrib import admin
from .models import CoachingRequest


@admin.register(CoachingRequest)
class CoachingRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "coach",
        "goal",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "created_at",
    )
    search_fields = (
        "client__full_name",
        "client__email",
        "coach__user__full_name",
        "goal",
        "message",
    )