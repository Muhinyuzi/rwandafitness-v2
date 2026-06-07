from rest_framework import serializers
from .models import CoachingRequest


class CoachingRequestSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.full_name", read_only=True)
    client_email = serializers.EmailField(source="client.email", read_only=True)
    coach_name = serializers.CharField(source="coach.user.full_name", read_only=True)
    coach_email = serializers.EmailField(source="coach.user.email", read_only=True)

    class Meta:
        model = CoachingRequest
        fields = [
            "id",
            "client",
            "client_name",
            "client_email",
            "coach",
            "coach_name",
            "coach_email",
            "goal",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "client",
            "client_name",
            "client_email",
            "status",
            "created_at",
            "updated_at",
        ]


class CoachingRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachingRequest
        fields = [
            "coach",
            "goal",
            "message",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        if user.role != "client":
            raise serializers.ValidationError("Only clients can create a coaching request.")

        coach = attrs["coach"]
        if coach.user.role != "coach":
            raise serializers.ValidationError("Selected coach is invalid.")

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return CoachingRequest.objects.create(
            client=request.user,
            **validated_data,
        )


class CoachingRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachingRequest
        fields = ["status"]

    def validate_status(self, value):
        allowed = ["accepted", "rejected", "completed"]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(allowed)}."
            )
        return value