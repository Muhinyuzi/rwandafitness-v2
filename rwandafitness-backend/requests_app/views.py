from django.conf import settings
from django.core.mail import send_mail

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification

from .models import CoachingRequest
from .serializers import (
    CoachingRequestCreateSerializer,
    CoachingRequestSerializer,
    CoachingRequestStatusSerializer,
)


def get_display_name(user):
    return (
        user.full_name
        or user.username
        or user.email
    )


def send_status_email(
    coaching_request,
    status_value,
):
    client = coaching_request.client
    coach_user = coaching_request.coach.user

    client_name = get_display_name(client)
    coach_name = get_display_name(coach_user)

    frontend_url = getattr(
        settings,
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    request_url = (
        f"{frontend_url}/my-requests/"
        f"{coaching_request.id}"
    )

    email_config = {
        "accepted": {
            "subject": (
                "Your coaching request was accepted"
            ),
            "message": (
                f"Hello {client_name},\n\n"
                f"{coach_name} has accepted your "
                "coaching request on RwandaFitness.\n\n"
                f"Goal: {coaching_request.goal}\n\n"
                "You can view your request here:\n\n"
                f"{request_url}\n\n"
                "RwandaFitness Team"
            ),
        },
        "rejected": {
            "subject": (
                "Update on your coaching request"
            ),
            "message": (
                f"Hello {client_name},\n\n"
                f"{coach_name} was unable to accept "
                "your coaching request at this time.\n\n"
                f"Goal: {coaching_request.goal}\n\n"
                "You can review your request here:\n\n"
                f"{request_url}\n\n"
                "You can also explore other coaches "
                "on RwandaFitness.\n\n"
                "RwandaFitness Team"
            ),
        },
        "completed": {
            "subject": (
                "Your coaching request was completed"
            ),
            "message": (
                f"Hello {client_name},\n\n"
                f"{coach_name} marked your coaching "
                "request as completed.\n\n"
                f"Goal: {coaching_request.goal}\n\n"
                "You can view the request here:\n\n"
                f"{request_url}\n\n"
                "Thank you for using RwandaFitness.\n\n"
                "RwandaFitness Team"
            ),
        },
    }

    config = email_config.get(
        status_value,
    )

    if not config:
        return

    send_mail(
        subject=config["subject"],
        message=config["message"],
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[
            client.email,
        ],
        fail_silently=False,
    )


class CoachingRequestCreateAPIView(
    generics.CreateAPIView,
):
    serializer_class = CoachingRequestCreateSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def perform_create(self, serializer):
        coaching_request = serializer.save()

        coach_user = coaching_request.coach.user

        client_name = get_display_name(
            self.request.user,
        )

        # =====================================================
        # INTERNAL NOTIFICATION TO COACH
        # =====================================================

        Notification.objects.create(
            user=coach_user,
            notification_type="coaching_request",
            title="New coaching request",
            message=(
                f"{client_name} sent you a new "
                "coaching request."
            ),
            link="/dashboard/coach",
        )

        # =====================================================
        # EMAIL NOTIFICATION TO COACH
        # =====================================================

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:3000",
        )

        dashboard_url = (
            f"{frontend_url}/dashboard/coach"
        )

        coach_name = get_display_name(
            coach_user,
        )

        email_message = (
            f"Hello {coach_name},\n\n"
            "You have received a new coaching request "
            "on RwandaFitness.\n\n"
            f"Client: {client_name}\n"
            f"Goal: {coaching_request.goal}\n"
        )

        if coaching_request.message:
            email_message += (
                "\nMessage:\n"
                f"{coaching_request.message}\n"
            )

        email_message += (
            "\nLog in to RwandaFitness to view and "
            "respond to the request:\n\n"
            f"{dashboard_url}\n\n"
            "RwandaFitness Team"
        )

        send_mail(
            subject=(
                "New coaching request on RwandaFitness"
            ),
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                coach_user.email,
            ],
            fail_silently=False,
        )


class MyCoachingRequestListAPIView(
    generics.ListAPIView,
):
    serializer_class = CoachingRequestSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return CoachingRequest.objects.none()

        user = self.request.user

        queryset = (
            CoachingRequest.objects
            .select_related(
                "client",
                "coach",
                "coach__user",
            )
        )

        if user.role == "client":
            return queryset.filter(
                client=user,
            )

        if user.role == "coach":
            return queryset.filter(
                coach__user=user,
            )

        return queryset.all()


class CoachingRequestDetailAPIView(
    generics.RetrieveAPIView,
):
    serializer_class = CoachingRequestSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return CoachingRequest.objects.none()

        user = self.request.user

        queryset = (
            CoachingRequest.objects
            .select_related(
                "client",
                "coach",
                "coach__user",
            )
        )

        if user.role == "client":
            return queryset.filter(
                client=user,
            )

        if user.role == "coach":
            return queryset.filter(
                coach__user=user,
            )

        return queryset.all()


class CoachingRequestStatusUpdateAPIView(
    generics.UpdateAPIView,
):
    serializer_class = CoachingRequestStatusSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    http_method_names = [
        "patch",
    ]

    def get_queryset(self):
        return (
            CoachingRequest.objects
            .select_related(
                "client",
                "coach",
                "coach__user",
            )
        )

    def perform_update(self, serializer):
        coaching_request = self.get_object()
        user = self.request.user

        # =====================================================
        # PERMISSIONS
        # =====================================================

        if user.role == "coach":
            if coaching_request.coach.user != user:
                raise PermissionDenied(
                    "You cannot update this request.",
                )

        elif user.role == "admin":
            pass

        else:
            raise PermissionDenied(
                "Only the assigned coach or an admin "
                "can update status.",
            )

        # =====================================================
        # SAVE OLD STATUS
        # =====================================================

        old_status = coaching_request.status

        updated_request = serializer.save()

        new_status = updated_request.status

        if old_status == new_status:
            return

        # =====================================================
        # NOTIFICATION DATA
        # =====================================================

        coach_name = get_display_name(
            updated_request.coach.user,
        )

        notification_data = {
            "accepted": {
                "notification_type": "request_accepted",
                "title": "Coaching request accepted",
                "message": (
                    f"{coach_name} accepted your "
                    "coaching request."
                ),
            },
            "rejected": {
                "notification_type": "request_rejected",
                "title": "Coaching request declined",
                "message": (
                    f"{coach_name} declined your "
                    "coaching request."
                ),
            },
            "completed": {
                "notification_type": "request_completed",
                "title": "Coaching completed",
                "message": (
                    f"{coach_name} marked your "
                    "coaching request as completed."
                ),
            },
        }

        data = notification_data.get(
            new_status,
        )

        if not data:
            return

        # =====================================================
        # INTERNAL NOTIFICATION TO CLIENT
        # =====================================================

        Notification.objects.create(
            user=updated_request.client,
            notification_type=data[
                "notification_type"
            ],
            title=data["title"],
            message=data["message"],
            link=f"/my-requests/{updated_request.id}",
        )

        # =====================================================
        # EMAIL TO CLIENT
        # =====================================================

        send_status_email(
            updated_request,
            new_status,
        )


class RequestsStatsAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        user = request.user

        if user.role == "coach":
            queryset = (
                CoachingRequest.objects
                .filter(
                    coach__user=user,
                )
            )
        else:
            queryset = (
                CoachingRequest.objects
                .filter(
                    client=user,
                )
            )

        return Response(
            {
                "total": queryset.count(),
                "pending": queryset.filter(
                    status="pending",
                ).count(),
                "accepted": queryset.filter(
                    status="accepted",
                ).count(),
                "rejected": queryset.filter(
                    status="rejected",
                ).count(),
                "completed": queryset.filter(
                    status="completed",
                ).count(),
            }
        )


class CoachDashboardAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        user = request.user

        if user.role != "coach":
            raise PermissionDenied(
                "Only coaches can access this dashboard.",
            )

        queryset = (
            CoachingRequest.objects
            .select_related(
                "client",
                "coach",
                "coach__user",
            )
            .filter(
                coach__user=user,
            )
        )

        recent_requests = queryset[:5]

        return Response(
            {
                "stats": {
                    "total": queryset.count(),
                    "pending": queryset.filter(
                        status="pending",
                    ).count(),
                    "accepted": queryset.filter(
                        status="accepted",
                    ).count(),
                    "rejected": queryset.filter(
                        status="rejected",
                    ).count(),
                    "completed": queryset.filter(
                        status="completed",
                    ).count(),
                },
                "recent_requests": (
                    CoachingRequestSerializer(
                        recent_requests,
                        many=True,
                    ).data
                ),
            }
        )