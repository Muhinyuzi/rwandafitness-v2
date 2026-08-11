from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField(
        read_only=True,
    )
    coach_name = serializers.SerializerMethodField(
        read_only=True,
    )

    class Meta:
        model = Review
        fields = (
            "id",
            "request",
            "coach",
            "client",
            "client_name",
            "coach_name",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "coach",
            "client",
            "client_name",
            "coach_name",
            "created_at",
            "updated_at",
        )

    def get_client_name(self, obj):
        return (
            getattr(obj.client, "full_name", "")
            or getattr(obj.client, "username", "")
            or obj.client.email
        )

    def get_coach_name(self, obj):
        coach_user = obj.coach.user

        return (
            getattr(coach_user, "full_name", "")
            or getattr(coach_user, "username", "")
            or coach_user.email
        )

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError(
                "invalid_rating"
            )

        return value

    def validate_comment(self, value):
        return value.strip()

    def validate(self, attrs):
        http_request = self.context["request"]
        user = http_request.user

        coaching_request = attrs.get("request")

        if not coaching_request:
            raise serializers.ValidationError(
                {
                    "request": "request_required",
                }
            )

        if coaching_request.client_id != user.id:
            raise serializers.ValidationError(
                {
                    "request": "not_request_owner",
                }
            )

        if (
            coaching_request.status
            != coaching_request.STATUS_COMPLETED
        ):
            raise serializers.ValidationError(
                {
                    "request": "request_not_completed",
                }
            )

        if hasattr(coaching_request, "review"):
            raise serializers.ValidationError(
                {
                    "request": "review_already_exists",
                }
            )

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        coaching_request = validated_data["request"]

        return Review.objects.create(
            client=user,
            coach=coaching_request.coach,
            **validated_data,
        )