from rest_framework import generics, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend

from .models import CoachProfile
from .serializers import CoachProfileSerializer, CoachProfileUpdateSerializer
from .filters import CoachFilter


class CoachListAPIView(generics.ListAPIView):
    queryset = (
        CoachProfile.objects.select_related("user", "gym")
        .prefetch_related("gallery_images")
        .filter(user__role="coach")
    )
    serializer_class = CoachProfileSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CoachFilter
    search_fields = ["user__full_name", "city", "bio", "gym__name"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class CoachDetailAPIView(generics.RetrieveAPIView):
    queryset = (
        CoachProfile.objects.select_related("user", "gym")
        .prefetch_related("gallery_images")
        .filter(user__role="coach")
    )
    serializer_class = CoachProfileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class MyCoachProfileAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CoachProfileUpdateSerializer
        return CoachProfileSerializer

    def get_queryset(self):
        return (
            CoachProfile.objects.select_related("user", "gym")
            .prefetch_related("gallery_images")
            .filter(user=self.request.user, user__role="coach")
        )

    def get_object(self):
        return self.get_queryset().get()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context