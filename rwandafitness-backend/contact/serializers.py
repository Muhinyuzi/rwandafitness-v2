from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "is_read",
            "created_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "invalid_name"
            )

        return value

    def validate_subject(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "invalid_subject"
            )

        return value

    def validate_message(self, value):
        value = value.strip()

        if len(value) < 10:
            raise serializers.ValidationError(
                "invalid_message"
            )

        return value