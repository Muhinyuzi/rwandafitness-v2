from django.urls import path
from .views import CoachListAPIView, CoachDetailAPIView

urlpatterns = [
    path("", CoachListAPIView.as_view(), name="coach-list"),
    path("<int:pk>/", CoachDetailAPIView.as_view(), name="coach-detail"),
]