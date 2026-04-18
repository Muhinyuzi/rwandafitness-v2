from django.urls import path
from .views import (
    CoachingRequestCreateAPIView,
    MyCoachingRequestListAPIView,
    CoachingRequestDetailAPIView,
    CoachingRequestStatusUpdateAPIView,
)

urlpatterns = [
    path("", MyCoachingRequestListAPIView.as_view(), name="my-coaching-requests"),
    path("create/", CoachingRequestCreateAPIView.as_view(), name="coaching-request-create"),
    path("<int:pk>/", CoachingRequestDetailAPIView.as_view(), name="coaching-request-detail"),
    path("<int:pk>/status/", CoachingRequestStatusUpdateAPIView.as_view(), name="coaching-request-status"),
]