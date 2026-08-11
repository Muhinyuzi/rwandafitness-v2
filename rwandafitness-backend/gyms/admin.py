from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet

from .models import Gym, GymGalleryImage, GymTranslation


class GymTranslationInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()

        if any(self.errors):
            return

        languages = []

        for form in self.forms:
            cleaned_data = getattr(form, "cleaned_data", None)

            if not cleaned_data:
                continue

            if cleaned_data.get("DELETE", False):
                continue

            language = cleaned_data.get("language")

            if language:
                languages.append(language)

        if len(languages) != 2:
            raise ValidationError(
                "Each gym must have exactly two translations: "
                "one English translation and one Kinyarwanda translation."
            )

        if set(languages) != {"en", "rw"}:
            raise ValidationError(
                "Each gym must have exactly one English (en) translation "
                "and one Kinyarwanda (rw) translation."
            )


class GymTranslationInline(admin.StackedInline):
    model = GymTranslation
    formset = GymTranslationInlineFormSet

    extra = 2
    min_num = 2
    max_num = 2

    fields = (
        "language",
        "description",
        "opening_hours",
    )


class GymGalleryImageInline(admin.TabularInline):
    model = GymGalleryImage
    extra = 1

    fields = (
        "image",
        "caption",
        "sort_order",
    )

    ordering = (
        "sort_order",
        "id",
    )


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "phone",
        "email",
        "translation_status",
        "is_verified",
        "created_by",
        "created_at",
    )

    list_filter = (
        "city",
        "is_verified",
        "created_at",
    )

    search_fields = (
        "name",
        "city",
        "email",
        "phone",
        "address",
        "translations__description",
        "translations__opening_hours",
    )

    readonly_fields = (
        "created_at",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    inlines = (
        GymTranslationInline,
        GymGalleryImageInline,
    )

    @admin.display(
        description="Translations",
        ordering="name",
    )
    def translation_status(self, obj):
        languages = set(
            obj.translations.values_list(
                "language",
                flat=True,
            )
        )

        if languages == {"en", "rw"}:
            return "EN + RW"

        if languages == {"en"}:
            return "EN only"

        if languages == {"rw"}:
            return "RW only"

        return "Missing"


@admin.register(GymTranslation)
class GymTranslationAdmin(admin.ModelAdmin):
    list_display = (
        "gym",
        "language",
        "short_description",
        "opening_hours",
    )

    list_filter = (
        "language",
        "gym__city",
    )

    search_fields = (
        "gym__name",
        "gym__city",
        "description",
        "opening_hours",
    )

    autocomplete_fields = (
        "gym",
    )

    ordering = (
        "gym__name",
        "language",
    )

    @admin.display(description="Description")
    def short_description(self, obj):
        if not obj.description:
            return "-"

        if len(obj.description) <= 80:
            return obj.description

        return f"{obj.description[:80]}..."


@admin.register(GymGalleryImage)
class GymGalleryImageAdmin(admin.ModelAdmin):
    list_display = (
        "gym",
        "caption",
        "sort_order",
        "created_at",
    )

    list_filter = (
        "gym",
        "created_at",
    )

    search_fields = (
        "gym__name",
        "caption",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "gym__name",
        "sort_order",
        "id",
    )