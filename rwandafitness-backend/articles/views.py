from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics

from .models import Article, ArticleTranslation
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
)


SUPPORTED_LANGUAGES = {"en", "rw"}
DEFAULT_LANGUAGE = "en"


def get_requested_language(request):
    language = request.query_params.get("lang", DEFAULT_LANGUAGE)

    if language not in SUPPORTED_LANGUAGES:
        return DEFAULT_LANGUAGE

    return language


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
        "translations__title",
        "translations__excerpt",
        "translations__content",
        "author_name",
    ]

    def get_queryset(self):
        language = get_requested_language(self.request)

        return (
            Article.objects
            .filter(
                is_published=True,
                translations__language=language,
            )
            .prefetch_related("translations")
            .distinct()
            .order_by("-published_at", "-created_at")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["language"] = get_requested_language(self.request)
        return context


class FeaturedArticleListAPIView(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        language = get_requested_language(self.request)

        return (
            Article.objects
            .filter(
                is_published=True,
                is_featured=True,
                translations__language=language,
            )
            .prefetch_related("translations")
            .distinct()
            .order_by("-published_at", "-created_at")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["language"] = get_requested_language(self.request)
        return context


class ArticleDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer

    def get_object(self):
        language = get_requested_language(self.request)
        slug = self.kwargs["slug"]

        translation = get_object_or_404(
            ArticleTranslation.objects.select_related("article"),
            language=language,
            slug=slug,
            article__is_published=True,
        )

        self.article_language = language

        return translation.article

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["language"] = getattr(
            self,
            "article_language",
            get_requested_language(self.request),
        )
        return context