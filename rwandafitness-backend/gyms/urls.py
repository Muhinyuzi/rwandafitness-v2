from django.urls import path
from .views import GymListAPIView, GymDetailAPIView

urlpatterns = [
    path("", GymListAPIView.as_view(), name="gym-list"),
    path("<slug:slug>/", GymDetailAPIView.as_view(), name="gym-detail"),
]