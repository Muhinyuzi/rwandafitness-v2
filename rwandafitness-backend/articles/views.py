from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Article
from .serializers import (
    ArticleListSerializer,
    ArticleDetailSerializer,
)


class ArticleListAPIView(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]

    filterset_fields = [
        "category",
        "is_featured",
    ]

    search_fields = [
        "title",
        "excerpt",
        "content",
        "author_name",
    ]

    def get_queryset(self):
        return Article.objects.filter(
            is_published=True,
        ).order_by("-published_at", "-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class FeaturedArticleListAPIView(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        return Article.objects.filter(
            is_published=True,
            is_featured=True,
        ).order_by("-published_at", "-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ArticleDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Article.objects.filter(
            is_published=True,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context