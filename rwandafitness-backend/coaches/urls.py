from django.urls import path
from .views import CoachListAPIView, CoachDetailAPIView, MyCoachProfileAPIView

urlpatterns = [
    path("", CoachListAPIView.as_view(), name="coach-list"),
    path("me/", MyCoachProfileAPIView.as_view(), name="coach-me"),
    path("<int:pk>/", CoachDetailAPIView.as_view(), name="coach-detail"),
]