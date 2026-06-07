from django.urls import path
from .views import RegisterAPIView, LoginAPIView, MeAPIView

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="api-register"),
    path("login/", LoginAPIView.as_view(), name="api-login"),
    path("me/", MeAPIView.as_view(), name="api-me"),
]