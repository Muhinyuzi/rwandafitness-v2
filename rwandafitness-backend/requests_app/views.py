from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CoachingRequest
from .serializers import (
    CoachingRequestSerializer,
    CoachingRequestCreateSerializer,
    CoachingRequestStatusSerializer,
)


class CoachingRequestCreateAPIView(generics.CreateAPIView):
    serializer_class = CoachingRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyCoachingRequestListAPIView(generics.ListAPIView):
    serializer_class = CoachingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "client":
            return CoachingRequest.objects.select_related(
                "client", "coach", "coach__user"
            ).filter(client=user)

        if user.role == "coach":
            return CoachingRequest.objects.select_related(
                "client", "coach", "coach__user"
            ).filter(coach__user=user)

        return CoachingRequest.objects.select_related(
            "client", "coach", "coach__user"
        ).all()


class CoachingRequestDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CoachingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = CoachingRequest.objects.select_related("client", "coach", "coach__user")

        if user.role == "client":
            return qs.filter(client=user)

        if user.role == "coach":
            return qs.filter(coach__user=user)

        return qs.all()


class CoachingRequestStatusUpdateAPIView(generics.UpdateAPIView):
    serializer_class = CoachingRequestStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return CoachingRequest.objects.select_related("client", "coach", "coach__user")

    def perform_update(self, serializer):
        coaching_request = self.get_object()
        user = self.request.user

        if user.role == "coach":
            if coaching_request.coach.user != user:
                raise PermissionDenied("You cannot update this request.")
        elif user.role == "admin":
            pass
        else:
            raise PermissionDenied("Only the assigned coach or an admin can update status.")

        serializer.save()



class RequestsStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "coach":
            qs = CoachingRequest.objects.filter(coach__user=user)
        else:
            qs = CoachingRequest.objects.filter(client=user)

        return Response({
            "total": qs.count(),
            "pending": qs.filter(status="pending").count(),
            "accepted": qs.filter(status="accepted").count(),
            "rejected": qs.filter(status="rejected").count(),
        })   
        
class CoachDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "coach":
            raise PermissionDenied("Only coaches can access this dashboard.")

        qs = CoachingRequest.objects.select_related(
            "client",
            "coach",
            "coach__user",
        ).filter(coach__user=user)

        recent_requests = qs[:5]

        return Response(
            {
                "stats": {
                    "total": qs.count(),
                    "pending": qs.filter(status="pending").count(),
                    "accepted": qs.filter(status="accepted").count(),
                    "rejected": qs.filter(status="rejected").count(),
                    "completed": qs.filter(status="completed").count(),
                },
                "recent_requests": CoachingRequestSerializer(
                    recent_requests,
                    many=True,
                ).data,
            }
        )             