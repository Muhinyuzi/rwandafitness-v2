from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Review, ReviewStatus
from .serializers import ReviewSerializer


class ReviewViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = (
            Review.objects.filter(
                status=ReviewStatus.APPROVED,
            )
            .select_related(
                "client",
                "coach",
                "coach__user",
                "request",
            )
        )

        coach_id = self.request.query_params.get("coach")

        if coach_id:
            queryset = queryset.filter(
                coach_id=coach_id,
            )

        return queryset

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        return [IsAuthenticated()]