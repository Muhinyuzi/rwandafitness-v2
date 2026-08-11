from django.conf import settings
from django.core.mail import EmailMessage

from rest_framework import mixins, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageViewSet(
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        contact_message = serializer.save()

        try:
            email = EmailMessage(
                subject=f"[RwandaFitness] {contact_message.subject}",
                body=(
                    "Nouveau message reçu depuis RwandaFitness\n\n"
                    f"Nom : {contact_message.name}\n"
                    f"Email : {contact_message.email}\n"
                    f"Sujet : {contact_message.subject}\n\n"
                    f"Message :\n{contact_message.message}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.CONTACT_NOTIFICATION_EMAIL],
                reply_to=[contact_message.email],
            )

            email.send(fail_silently=False)

        except Exception as error:
            print("Contact email notification error:", error)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )