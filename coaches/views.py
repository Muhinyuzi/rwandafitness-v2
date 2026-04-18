from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import CoachProfile
from .serializers import CoachProfileSerializer
from .filters import CoachFilter


class CoachListAPIView(generics.ListAPIView):
    queryset = (
        CoachProfile.objects.select_related("user")
        .prefetch_related("gallery_images")
        .filter(user__role="coach")
    )
    serializer_class = CoachProfileSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CoachFilter
    search_fields = ["user__full_name", "city", "bio"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class CoachDetailAPIView(generics.RetrieveAPIView):
    queryset = (
        CoachProfile.objects.select_related("user")
        .prefetch_related("gallery_images")
        .filter(user__role="coach")
    )
    serializer_class = CoachProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context