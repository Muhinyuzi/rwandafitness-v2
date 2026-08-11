from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet

from .models import Article, ArticleTranslation


class ArticleTranslationInlineFormSet(BaseInlineFormSet):
    """
    Vérifie qu'un article publié possède exactement :
    - une traduction anglaise ;
    - une traduction kinyarwanda.
    """

    def clean(self):
        super().clean()

        # Ne pas continuer si une autre erreur existe déjà.
        if any(self.errors):
            return

        article = self.instance

        languages = []

        for form in self.forms:
            cleaned_data = getattr(form, "cleaned_data", None)

            if not cleaned_data:
                continue

            # Ignorer les traductions supprimées.
            if cleaned_data.get("DELETE"):
                continue

            language = cleaned_data.get("language")

            if language:
                languages.append(language)

        # Empêcher deux traductions dans la même langue.
        if len(languages) != len(set(languages)):
            raise ValidationError(
                "Chaque langue ne peut être utilisée qu'une seule fois. "
                "Ajoutez une traduction English et une traduction Kinyarwanda."
            )

        # Les deux traductions sont obligatoires avant publication.
        if article.is_published:
            required_languages = {"en", "rw"}
            existing_languages = set(languages)
            missing_languages = required_languages - existing_languages

            if missing_languages:
                language_names = {
                    "en": "English",
                    "rw": "Kinyarwanda",
                }

                missing_names = [
                    language_names[language]
                    for language in sorted(missing_languages)
                ]

                raise ValidationError(
                    "Impossible de publier cet article. "
                    "Traduction(s) manquante(s) : "
                    f"{', '.join(missing_names)}."
                )


class ArticleTranslationInline(admin.StackedInline):
    model = ArticleTranslation
    formset = ArticleTranslationInlineFormSet

    # Affiche deux formulaires lors de la création.
    extra = 2
    max_num = 2

    fields = (
        "language",
        "title",
        "slug",
        "excerpt",
        "content",
    )


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "category",
        "author_name",
        "translation_status",
        "is_published",
        "is_featured",
        "published_at",
    )

    list_filter = (
        "category",
        "is_published",
        "is_featured",
    )

    search_fields = (
        "translations__title",
        "translations__slug",
        "author_name",
    )

    ordering = (
        "-published_at",
        "-id",
    )

    inlines = [
        ArticleTranslationInline,
    ]

    @admin.display(description="Languages")
    def translation_status(self, obj):
        languages = set(
            obj.translations.values_list(
                "language",
                flat=True,
            )
        )

        if {"en", "rw"}.issubset(languages):
            return "✅ 2/2"

        return f"⚠️ {len(languages)}/2"


@admin.register(ArticleTranslation)
class ArticleTranslationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "language",
        "article",
        "slug",
    )

    list_filter = (
        "language",
    )

    search_fields = (
        "title",
        "slug",
        "content",
    )

    prepopulated_fields = {
        "slug": (
            "title",
        ),
    }