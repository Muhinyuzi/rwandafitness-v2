from rest_framework import serializers
from .models import Article


class ArticleListSerializer(serializers.ModelSerializer):
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
            "is_featured",
        ]

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        if obj.cover_image:
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None


class ArticleDetailSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image_url",
            "category",
            "author_name",
            "published_at",
            "is_featured",
            "created_at",
            "updated_at",
        ]

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        if obj.cover_image:
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None


class ArticleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "author_name",
            "category",
            "is_published",
            "is_featured",
            "published_at",
        ]