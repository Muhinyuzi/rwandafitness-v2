from rest_framework import serializers

from .models import Article


class ArticleListSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image_url",
            "category",
            "author_name",
            "published_at",
        ]

    def get_translation(self, obj):
        language = self.context.get("language", "en")

        translations = list(obj.translations.all())

        translation = next(
            (
                item
                for item in translations
                if item.language == language
            ),
            None,
        )

        # Sécurité : utiliser l’anglais si la traduction demandée manque.
        if translation is None and language != "en":
            translation = next(
                (
                    item
                    for item in translations
                    if item.language == "en"
                ),
                None,
            )

        return translation

    def get_title(self, obj):
        translation = self.get_translation(obj)
        return translation.title if translation else ""

    def get_slug(self, obj):
        translation = self.get_translation(obj)
        return translation.slug if translation else ""

    def get_excerpt(self, obj):
        translation = self.get_translation(obj)
        return translation.excerpt if translation else ""

    def get_cover_image_url(self, obj):
        if not obj.cover_image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.cover_image.url,
            )

        return obj.cover_image.url


class ArticleDetailSerializer(ArticleListSerializer):
    content = serializers.SerializerMethodField()

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + [
            "content",
        ]

    def get_content(self, obj):
        translation = self.get_translation(obj)
        return translation.content if translation else ""