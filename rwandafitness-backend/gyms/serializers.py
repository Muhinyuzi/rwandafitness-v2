from rest_framework import serializers

from coaches.models import CoachProfile

from .models import Gym, GymGalleryImage, GymTranslation


class GymGalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GymGalleryImage
        fields = [
            "id",
            "image",
            "image_url",
            "caption",
            "sort_order",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")

        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        return None


class GymCoachSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        source="user.full_name",
        read_only=True,
    )
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CoachProfile
        fields = [
            "id",
            "full_name",
            "specialty",
            "city",
            "price_per_session",
            "is_verified",
            "photo_url",
        ]

    def get_photo_url(self, obj):
        request = self.context.get("request")

        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)

        return None


class GymSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()
    opening_hours = serializers.SerializerMethodField()

    cover_image_url = serializers.SerializerMethodField()

    gallery_images = GymGalleryImageSerializer(
        many=True,
        read_only=True,
    )

    coaches = GymCoachSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Gym
        fields = [
            "id",
            "name",
            "description",
            "city",
            "address",
            "phone",
            "email",
            "website",
            "opening_hours",
            "cover_image",
            "cover_image_url",
            "instagram",
            "facebook",
            "latitude",
            "longitude",
            "slug",
            "is_verified",
            "gallery_images",
            "coaches",
            "created_at",
        ]

    def get_requested_language(self):
        request = self.context.get("request")

        if not request:
            return "en"

        language = request.query_params.get("lang", "en")

        if language not in {"en", "rw"}:
            return "en"

        return language

    def get_translation(self, obj):
        language = self.get_requested_language()

        translations = getattr(
            obj,
            "_prefetched_objects_cache",
            {},
        ).get("translations")

        if translations is not None:
            translation_by_language = {
                translation.language: translation
                for translation in translations
            }

            return (
                translation_by_language.get(language)
                or translation_by_language.get("en")
                or translation_by_language.get("rw")
            )

        translation = obj.translations.filter(
            language=language,
        ).first()

        if translation:
            return translation

        return (
            obj.translations.filter(language="en").first()
            or obj.translations.filter(language="rw").first()
        )

    def get_description(self, obj):
        translation = self.get_translation(obj)

        if not translation:
            return ""

        return translation.description

    def get_opening_hours(self, obj):
        translation = self.get_translation(obj)

        if not translation:
            return ""

        return translation.opening_hours

    def get_cover_image_url(self, obj):
        request = self.context.get("request")

        if obj.cover_image and request:
            return request.build_absolute_uri(
                obj.cover_image.url
            )

        return None