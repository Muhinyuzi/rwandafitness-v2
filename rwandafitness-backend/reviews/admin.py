from django.contrib import admin

from .models import Review, ReviewStatus


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "coach",
        "rating",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "rating",
        "created_at",
    )

    search_fields = (
        "client__email",
        "client__full_name",
        "coach__user__email",
        "coach__user__full_name",
        "comment",
    )

    list_editable = (
        "status",
    )

    readonly_fields = (
        "request",
        "coach",
        "client",
        "rating",
        "comment",
        "created_at",
        "updated_at",
    )

    actions = (
        "approve_reviews",
        "reject_reviews",
    )

    @admin.action(description="Approve selected reviews")
    def approve_reviews(self, request, queryset):
        queryset.update(status=ReviewStatus.APPROVED)

    @admin.action(description="Reject selected reviews")
    def reject_reviews(self, request, queryset):
        queryset.update(status=ReviewStatus.REJECTED)