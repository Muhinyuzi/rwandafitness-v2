from django.db.models import Prefetch

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, generics

from .models import Gym, GymTranslation
from .serializers import GymSerializer


class GymListAPIView(generics.ListAPIView):
    serializer_class = GymSerializer

    queryset = (
        Gym.objects.prefetch_related(
            "gallery_images",
            "coaches__user",
            Prefetch(
                "translations",
                queryset=GymTranslation.objects.all(),
            ),
        )
        .all()
    )

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]

    search_fields = [
        "name",
        "city",
        "translations__description",
    ]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class GymDetailAPIView(generics.RetrieveAPIView):
    serializer_class = GymSerializer
    lookup_field = "slug"

    queryset = (
        Gym.objects.prefetch_related(
            "gallery_images",
            "coaches__user",
            Prefetch(
                "translations",
                queryset=GymTranslation.objects.all(),
            ),
        )
        .all()
    )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context