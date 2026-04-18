from rest_framework import serializers
from .models import Gym, GymGalleryImage
from coaches.models import CoachProfile


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
    full_name = serializers.CharField(source="user.full_name", read_only=True)
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
    cover_image_url = serializers.SerializerMethodField()
    gallery_images = GymGalleryImageSerializer(many=True, read_only=True)
    coaches = GymCoachSerializer(many=True, read_only=True)

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

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None