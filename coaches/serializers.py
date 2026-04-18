from rest_framework import serializers
from .models import CoachProfile, CoachGalleryImage


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


class CoachProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    photo_url = serializers.SerializerMethodField()
    gallery_images = CoachGalleryImageSerializer(many=True, read_only=True)

    gym = serializers.PrimaryKeyRelatedField(read_only=True)
    gym_name = serializers.CharField(source="gym.name", read_only=True)
    gym_slug = serializers.CharField(source="gym.slug", read_only=True)

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
            "gallery_images",
            "created_at",
        ]

    def get_photo_url(self, obj):
        request = self.context.get("request")

        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)

        return None