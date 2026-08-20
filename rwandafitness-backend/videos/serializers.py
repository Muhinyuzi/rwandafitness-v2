from rest_framework import serializers

from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    coach = serializers.SerializerMethodField()
    gym = serializers.SerializerMethodField()
    article = serializers.SerializerMethodField()

    class Meta:
        model = Video

        fields = [
            "id",
            "title",
            "slug",
            "description",
            "video_url",
            "language",
            "thumbnail",
            "coach",
            "gym",
            "article",
            "is_published",
            "sort_order",
            "created_at",
            "updated_at",
        ]

    # =========================================================
    # LANGUAGE
    # =========================================================

    def get_language(self):
        request = self.context.get("request")

        language = "en"

        if request:
            language = request.query_params.get(
                "lang",
                "en",
            )

        if language not in {"en", "rw"}:
            language = "en"

        return language

    # =========================================================
    # VIDEO TRANSLATION
    # =========================================================

    def get_translation(self, obj):
        language = self.get_language()

        translations = getattr(
            obj,
            "_prefetched_objects_cache",
            {},
        ).get("translations")

        if translations is not None:
            return next(
                (
                    translation
                    for translation in translations
                    if translation.language == language
                ),
                None,
            )

        return obj.translations.filter(
            language=language,
        ).first()

    def get_title(self, obj):
        translation = self.get_translation(obj)

        if translation:
            return translation.title

        return ""

    def get_slug(self, obj):
        translation = self.get_translation(obj)

        if translation:
            return translation.slug

        return ""

    def get_description(self, obj):
        translation = self.get_translation(obj)

        if translation:
            return translation.description

        return ""

    # =========================================================
    # COACH
    # =========================================================

    def get_coach(self, obj):
        if not obj.coach:
            return None

        user = obj.coach.user

        return {
            "id": obj.coach.id,
            "full_name": user.full_name,
        }

    # =========================================================
    # GYM
    # =========================================================

    def get_gym(self, obj):
        if not obj.gym:
            return None

        return {
            "id": obj.gym.id,
            "name": obj.gym.name,
            "slug": obj.gym.slug,
        }

    # =========================================================
    # ARTICLE
    # =========================================================

    def get_article(self, obj):
        if not obj.article:
            return None

        language = self.get_language()

        translation = obj.article.translations.filter(
            language=language,
        ).first()

        if not translation:
            return {
                "id": obj.article.id,
                "title": "",
                "slug": "",
            }

        return {
            "id": obj.article.id,
            "title": translation.title,
            "slug": translation.slug,
        }