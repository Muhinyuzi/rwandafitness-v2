from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from coaches.models import CoachProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_coach_profile(sender, instance, created, **kwargs):
    if created and instance.role == "coach":
        CoachProfile.objects.create(
            user=instance,
            bio="New coach",
            city="Kigali",
            available_online=True,
            available_in_person=True,
        )