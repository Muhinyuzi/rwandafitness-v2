from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.urls import reverse

from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    EmailVerificationToken,
    PasswordResetToken,
)
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    MeSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        user.email_verified = False
        user.is_active = False
        user.save(update_fields=["email_verified", "is_active"])

        verification_token, _ = EmailVerificationToken.objects.get_or_create(
            user=user
        )

        verify_url = request.build_absolute_uri(
            reverse(
                "api-verify-email",
                kwargs={"token": verification_token.token},
            )
        )

        send_mail(
            subject="Verify your RwandaFitness account",
            message=(
                f"Hi {user.full_name},\n\n"
                "Welcome to RwandaFitness.\n\n"
                "Please verify your email address by clicking this link:\n\n"
                f"{verify_url}\n\n"
                "This link expires in 24 hours.\n\n"
                "RwandaFitness Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": (
                    "Account created successfully. "
                    "Please check your email to verify your account."
                ),
                "user": MeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            verification_token = EmailVerificationToken.objects.get(
                token=token
            )
        except EmailVerificationToken.DoesNotExist:
            return Response(
                {"detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification_token.is_expired():
            verification_token.delete()

            return Response(
                {"detail": "Verification link has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = verification_token.user
        user.email_verified = True
        user.is_active = True
        user.save(update_fields=["email_verified", "is_active"])

        verification_token.delete()

        frontend_url = getattr(
            settings,
            "FRONTEND_URL",
            "http://localhost:3000",
        )

        return redirect(f"{frontend_url}/email-verified")


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        if not user.email_verified:
            return Response(
                {
                    "detail": (
                        "Please verify your email before logging in."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": MeSerializer(user).data,
            }
        )


class MeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class ForgotPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        user = User.objects.filter(
            email__iexact=email
        ).first()

        if user:
            reset_token, _ = PasswordResetToken.objects.get_or_create(
                user=user
            )

            frontend_url = getattr(
                settings,
                "FRONTEND_URL",
                "http://localhost:3000",
            )

            reset_url = (
                f"{frontend_url}/reset-password/"
                f"{reset_token.token}"
            )

            send_mail(
                subject="Reset your RwandaFitness password",
                message=(
                    f"Hello {user.full_name},\n\n"
                    "We received a request to reset your password.\n\n"
                    "Click the link below:\n\n"
                    f"{reset_url}\n\n"
                    "This link expires in 24 hours.\n\n"
                    "If you didn't request this, simply ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {
                "detail": (
                    "If this email exists, a reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if reset_token.is_expired():
            reset_token.delete()

            return Response(
                {"detail": "Reset link has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = reset_token.user
        user.set_password(serializer.validated_data["password"])
        user.save()

        reset_token.delete()

        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )