from django.urls import path

from .views import (
    LoginAPIView,
    MeAPIView,
    RegisterAPIView,
    VerifyEmailAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="api-register"),
    path("login/", LoginAPIView.as_view(), name="api-login"),
    path("me/", MeAPIView.as_view(), name="api-me"),

    path(
        "verify-email/<uuid:token>/",
        VerifyEmailAPIView.as_view(),
        name="api-verify-email",
    ),
    
    path(
        "forgot-password/",
        ForgotPasswordAPIView.as_view(),
        name="api-forgot-password",
    ),

    path(
        "reset-password/<uuid:token>/",
        ResetPasswordAPIView.as_view(),
        name="api-reset-password",
    ),
]