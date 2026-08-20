from django.shortcuts import get_object_or_404

from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)

from .models import Video
from .serializers import VideoSerializer


class VideoListView(ListAPIView):
    serializer_class = VideoSerializer

    def get_queryset(self):
        language = self.request.query_params.get(
            "lang",
            "en",
        )

        if language not in {"en", "rw"}:
            language = "en"

        queryset = (
            Video.objects
            .filter(
                is_published=True,
                translations__language=language,
            )
            .select_related(
                "coach",
                "coach__user",
                "gym",
                "article",
            )
            .prefetch_related(
                "translations",
                "article__translations",
            )
            .distinct()
        )

        coach_id = self.request.query_params.get("coach")
        gym_id = self.request.query_params.get("gym")
        article_id = self.request.query_params.get("article")

        if coach_id:
            queryset = queryset.filter(
                coach_id=coach_id,
            )

        if gym_id:
            queryset = queryset.filter(
                gym_id=gym_id,
            )

        if article_id:
            queryset = queryset.filter(
                article_id=article_id,
            )

        return queryset


class VideoDetailView(RetrieveAPIView):
    serializer_class = VideoSerializer

    def get_object(self):
        language = self.request.query_params.get(
            "lang",
            "en",
        )

        if language not in {"en", "rw"}:
            language = "en"

        slug = self.kwargs["slug"]

        queryset = (
            Video.objects
            .filter(
                is_published=True,
                translations__language=language,
                translations__slug=slug,
            )
            .select_related(
                "coach",
                "coach__user",
                "gym",
                "article",
            )
            .prefetch_related(
                "translations",
                "article__translations",
            )
            .distinct()
        )

        return get_object_or_404(queryset)