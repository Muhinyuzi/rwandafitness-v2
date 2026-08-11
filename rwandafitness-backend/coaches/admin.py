from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet

from .models import (
    CoachGalleryImage,
    CoachProfile,
    CoachTranslation,
)


class CoachTranslationInlineFormSet(BaseInlineFormSet):
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
                "Each coach must have exactly two translations: "
                "one English translation and one Kinyarwanda translation."
            )

        if set(languages) != {"en", "rw"}:
            raise ValidationError(
                "Each coach must have exactly one English (en) translation "
                "and one Kinyarwanda (rw) translation."
            )


class CoachTranslationInline(admin.StackedInline):
    model = CoachTranslation
    formset = CoachTranslationInlineFormSet

    extra = 2
    min_num = 2
    max_num = 2

    fields = (
        "language",
        "bio",
    )


class CoachGalleryImageInline(admin.TabularInline):
    model = CoachGalleryImage
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


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "specialty",
        "city",
        "gym",
        "years_experience",
        "translation_status",
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
        "translations__bio",
    )

    autocomplete_fields = (
        "user",
        "gym",
    )

    readonly_fields = (
        "created_at",
    )

    inlines = (
        CoachTranslationInline,
        CoachGalleryImageInline,
    )

    @admin.display(description="Translations")
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


@admin.register(CoachTranslation)
class CoachTranslationAdmin(admin.ModelAdmin):
    list_display = (
        "coach",
        "language",
        "short_bio",
    )

    list_filter = (
        "language",
        "coach__city",
        "coach__specialty",
    )

    search_fields = (
        "coach__user__full_name",
        "coach__user__email",
        "coach__city",
        "bio",
    )

    autocomplete_fields = (
        "coach",
    )

    ordering = (
        "coach__user__full_name",
        "language",
    )

    @admin.display(description="Bio")
    def short_bio(self, obj):
        if not obj.bio:
            return "-"

        if len(obj.bio) <= 80:
            return obj.bio

        return f"{obj.bio[:80]}..."


@admin.register(CoachGalleryImage)
class CoachGalleryImageAdmin(admin.ModelAdmin):
    list_display = (
        "coach",
        "caption",
        "sort_order",
        "created_at",
    )

    list_filter = (
        "coach",
        "created_at",
    )

    search_fields = (
        "coach__user__full_name",
        "caption",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "coach__user__full_name",
        "sort_order",
        "id",
    )