from django.utils import timezone

from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
)
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Notification.objects.none()

        return (
            Notification.objects
            .filter(
                user=self.request.user,
            )
            .order_by(
                "-created_at",
            )
        )


class NotificationUnreadCountView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    @extend_schema(
        responses={
            200: {
                "type": "object",
                "properties": {
                    "count": {
                        "type": "integer",
                    },
                },
            },
        },
    )
    def get(self, request):
        count = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False,
            )
            .count()
        )

        return Response(
            {
                "count": count,
            },
        )


class NotificationMarkReadView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    @extend_schema(
        responses={
            200: NotificationSerializer,
            404: OpenApiResponse(
                description="Notification not found.",
            ),
        },
    )
    def post(
        self,
        request,
        pk,
    ):
        notification = (
            Notification.objects
            .filter(
                id=pk,
                user=request.user,
            )
            .first()
        )

        if not notification:
            return Response(
                {
                    "detail": "Notification not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = (
                timezone.now()
            )

            notification.save(
                update_fields=[
                    "is_read",
                    "read_at",
                ],
            )

        serializer = (
            NotificationSerializer(
                notification,
            )
        )

        return Response(
            serializer.data,
        )


class NotificationMarkAllReadView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    @extend_schema(
        responses={
            200: {
                "type": "object",
                "properties": {
                    "updated": {
                        "type": "integer",
                    },
                },
            },
        },
    )
    def post(self, request):
        updated = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False,
            )
            .update(
                is_read=True,
                read_at=timezone.now(),
            )
        )

        return Response(
            {
                "updated": updated,
            },
        )