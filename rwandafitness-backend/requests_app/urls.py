from django.urls import path
from .views import (
    CoachingRequestCreateAPIView,
    MyCoachingRequestListAPIView,
    CoachingRequestDetailAPIView,
    CoachingRequestStatusUpdateAPIView,
    RequestsStatsAPIView,
)

urlpatterns = [
    path("stats/", RequestsStatsAPIView.as_view(), name="requests-stats"),
    path("create/", CoachingRequestCreateAPIView.as_view(), name="coaching-request-create"),

    path("", MyCoachingRequestListAPIView.as_view(), name="my-coaching-requests"),

    path("<int:pk>/status/", CoachingRequestStatusUpdateAPIView.as_view(), name="coaching-request-status"),
    path("<int:pk>/", CoachingRequestDetailAPIView.as_view(), name="coaching-request-detail"),
]