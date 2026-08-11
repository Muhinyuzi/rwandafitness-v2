from django.db.models import Avg
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from gyms.models import Gym
from reviews.models import ReviewStatus

from .models import (
    CoachGalleryImage,
    CoachProfile,
    CoachTranslation,
)


SUPPORTED_LANGUAGES = {"en", "rw"}
DEFAULT_LANGUAGE = "en"


class CoachGalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CoachGalleryImage
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


class CoachTranslationMixin:
    def get_requested_language(self):
        request = self.context.get("request")

        if not request:
            return DEFAULT_LANGUAGE

        language = request.query_params.get(
            "lang",
            DEFAULT_LANGUAGE,
        )

        if language not in SUPPORTED_LANGUAGES:
            return DEFAULT_LANGUAGE

        return language

    def get_translation(self, obj):
        language = self.get_requested_language()

        prefetched_translations = getattr(
            obj,
            "_prefetched_objects_cache",
            {},
        ).get("translations")

        if prefetched_translations is not None:
            translations_by_language = {
                translation.language: translation
                for translation in prefetched_translations
            }

            return (
                translations_by_language.get(language)
                or translations_by_language.get(DEFAULT_LANGUAGE)
                or translations_by_language.get("rw")
            )

        translation = obj.translations.filter(
            language=language,
        ).first()

        if translation:
            return translation

        return (
            obj.translations.filter(
                language=DEFAULT_LANGUAGE,
            ).first()
            or obj.translations.filter(
                language="rw",
            ).first()
        )


class CoachProfileSerializer(
    CoachTranslationMixin,
    serializers.ModelSerializer,
):
    full_name = serializers.CharField(
        source="user.full_name",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    phone = serializers.CharField(
        source="user.phone",
        read_only=True,
    )

    role = serializers.CharField(
        source="user.role",
        read_only=True,
    )

    bio = serializers.SerializerMethodField()

    specialty_display = serializers.CharField(
        source="get_specialty_display",
        read_only=True,
    )

    photo_url = serializers.SerializerMethodField()

    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    gallery_images = CoachGalleryImageSerializer(
        many=True,
        read_only=True,
    )

    gym = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    gym_name = serializers.CharField(
        source="gym.name",
        read_only=True,
        default=None,
    )

    gym_slug = serializers.CharField(
        source="gym.slug",
        read_only=True,
        default=None,
    )

    class Meta:
        model = CoachProfile
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "bio",
            "specialty",
            "specialty_display",
            "years_experience",
            "city",
            "price_per_session",
            "is_verified",
            "photo",
            "photo_url",
            "available_online",
            "available_in_person",
            "instagram",
            "gym",
            "gym_name",
            "gym_slug",
            "average_rating",
            "reviews_count",
            "gallery_images",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "role",
            "bio",
            "specialty_display",
            "is_verified",
            "photo_url",
            "gym_name",
            "gym_slug",
            "average_rating",
            "reviews_count",
            "gallery_images",
            "created_at",
        ]

    def get_bio(self, obj):
        translation = self.get_translation(obj)

        if not translation:
            return ""

        return translation.bio

    def get_photo_url(self, obj):
        request = self.context.get("request")

        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)

        return None

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_average_rating(self, obj):
        approved_reviews = obj.reviews.filter(
            status=ReviewStatus.APPROVED,
        )

        average = approved_reviews.aggregate(
            average=Avg("rating"),
        )["average"]

        if average is None:
            return None

        return round(average, 1)

    @extend_schema_field(serializers.IntegerField())
    def get_reviews_count(self, obj):
        return obj.reviews.filter(
            status=ReviewStatus.APPROVED,
        ).count()


class CoachProfileUpdateSerializer(
    CoachTranslationMixin,
    serializers.ModelSerializer,
):
    bio = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
    )

    gym = serializers.PrimaryKeyRelatedField(
        queryset=Gym.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = CoachProfile
        fields = [
            "bio",
            "specialty",
            "years_experience",
            "city",
            "price_per_session",
            "available_online",
            "available_in_person",
            "instagram",
            "gym",
            "photo",
        ]

        extra_kwargs = {
            "specialty": {
                "required": False,
            },
            "years_experience": {
                "required": False,
            },
            "city": {
                "required": False,
                "allow_blank": True,
            },
            "price_per_session": {
                "required": False,
                "allow_null": True,
            },
            "available_online": {
                "required": False,
            },
            "available_in_person": {
                "required": False,
            },
            "instagram": {
                "required": False,
                "allow_blank": True,
            },
            "photo": {
                "required": False,
                "allow_null": True,
            },
        }

    def update(self, instance, validated_data):
        bio = validated_data.pop("bio", None)

        instance = super().update(
            instance,
            validated_data,
        )

        if bio is not None:
            language = self.get_requested_language()

            CoachTranslation.objects.update_or_create(
                coach=instance,
                language=language,
                defaults={
                    "bio": bio,
                },
            )

        return instance