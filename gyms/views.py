from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Gym
from .serializers import GymSerializer


class GymListAPIView(generics.ListAPIView):
    queryset = (
        Gym.objects.prefetch_related("gallery_images", "coaches__user")
        .all()
    )
    serializer_class = GymSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["name", "city", "description"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class GymDetailAPIView(generics.RetrieveAPIView):
    queryset = (
        Gym.objects.prefetch_related("gallery_images", "coaches__user")
        .all()
    )
    serializer_class = GymSerializer
    lookup_field = "slug"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context