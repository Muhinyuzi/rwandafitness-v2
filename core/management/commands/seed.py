from decimal import Decimal
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from coaches.models import CoachProfile, CoachGalleryImage
from gyms.models import Gym, GymGalleryImage
from requests_app.models import CoachingRequest

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with rich RwandaFitness data"

    def handle(self, *args, **kwargs):
        self.stdout.write("🧹 Cleaning database...")

        CoachingRequest.objects.all().delete()
        CoachGalleryImage.objects.all().delete()
        CoachProfile.objects.all().delete()
        GymGalleryImage.objects.all().delete()
        Gym.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("👤 Creating users...")

        admin = User.objects.create_superuser(
            email="admin@rf.com",
            username="admin",
            password="admin123",
            full_name="Admin RwandaFitness",
            role="admin",
        )

        cities = ["Kigali", "Musanze", "Huye"]
        specialties = ["fitness", "bodybuilding", "weight_loss", "crossfit", "yoga"]
        goals = ["Weight loss", "Muscle gain", "Home fitness", "Strength training"]

        coach_names = [
            "Jean Fitness",
            "Alice Trainer",
            "Eric Strong",
            "Grace Fit",
            "David Power",
            "Chris Gym",
            "Linda Yoga",
            "Patrick Cross",
        ]

        coach_bios = [
            "Certified fitness coach with 5+ years experience helping clients build sustainable habits.",
            "Helping clients transform their body and mindset through consistent training.",
            "Specialized in weight loss, nutrition basics, and practical coaching plans.",
            "Professional trainer focused on strength, discipline, and measurable progress.",
        ]

        gym_data = [
            {
                "name": "Kigali Fitness Center",
                "city": "Kigali",
                "description": "A modern gym in Kigali with full equipment, cardio machines, and strength coaching.",
            },
            {
                "name": "Iron Gym Rwanda",
                "city": "Kigali",
                "description": "Focused on bodybuilding, strength training, and serious lifting culture.",
            },
            {
                "name": "City Gym Kigali",
                "city": "Kigali",
                "description": "Accessible and practical fitness space for beginners and regular members.",
            },
            {
                "name": "PowerHouse Gym",
                "city": "Huye",
                "description": "Local gym offering weight training and group fitness sessions.",
            },
            {
                "name": "Elite Fitness Club",
                "city": "Kigali",
                "description": "Premium-style fitness club with personal coaching and flexible schedules.",
            },
            {
                "name": "Mountain Fitness Musanze",
                "city": "Musanze",
                "description": "A growing gym community in Musanze for cardio, fitness, and strength training.",
            },
        ]

        request_messages = [
            "I want serious coaching and a structured program.",
            "I need help with consistency and a realistic weekly plan.",
            "I want to improve my fitness and train with better structure.",
            "I am looking for a coach to help me build a strong routine.",
        ]

        self.stdout.write("🏢 Creating gyms...")

        gyms = []

        for i, item in enumerate(gym_data):
            gym = Gym.objects.create(
                name=item["name"],
                description=item["description"],
                city=item["city"],
                address=f"{item['city']}, Rwanda",
                phone=f"07810000{i:02d}",
                email=f"contact{i}@gym.com",
                website=f"https://gym{i}.com",
                opening_hours=random.choice(
                    [
                        "Mon-Sat: 6:00 AM - 9:00 PM",
                        "Mon-Fri: 5:30 AM - 10:00 PM, Sat: 7:00 AM - 8:00 PM",
                        "Daily: 6:00 AM - 8:00 PM",
                    ]
                ),
                instagram=f"https://instagram.com/gym{i}",
                facebook=f"https://facebook.com/gym{i}",
                latitude=None,
                longitude=None,
                is_verified=random.choice([True, True, False]),
                created_by=admin,
            )
            gyms.append(gym)

        self.stdout.write("👤 Creating coach users...")

        coach_users = []

        for i, name in enumerate(coach_names):
            user = User.objects.create_user(
                email=f"coach{i}@rf.com",
                username=f"coach{i}",
                password="test1234",
                full_name=name,
                role="coach",
                phone=f"07800000{i:02d}",
            )
            coach_users.append(user)

        self.stdout.write("👤 Creating client users...")

        clients = []

        for i in range(5):
            user = User.objects.create_user(
                email=f"client{i}@rf.com",
                username=f"client{i}",
                password="test1234",
                full_name=f"Client {i}",
                role="client",
                phone=f"07900000{i:02d}",
            )
            clients.append(user)

        self.stdout.write("🏋️ Updating coach profiles...")

        coach_profiles = []

        for i, user in enumerate(coach_users):
            profile = CoachProfile.objects.get(user=user)

            profile.bio = random.choice(coach_bios)
            profile.specialty = random.choice(specialties)
            profile.years_experience = random.randint(1, 10)
            profile.city = random.choice(cities)
            profile.price_per_session = Decimal(random.randint(10, 80))
            profile.is_verified = random.choice([True, True, True, False])
            profile.available_online = random.choice([True, False])
            profile.available_in_person = True
            profile.instagram = f"https://instagram.com/{user.username}"

            # Lien optionnel vers un gym
            profile.gym = random.choice(gyms + [None, None])

            profile.save()
            coach_profiles.append(profile)

        self.stdout.write("📝 Creating coaching requests...")

        statuses = ["pending", "accepted", "rejected"]

        for i, client in enumerate(clients):
            coach = coach_profiles[i % len(coach_profiles)]
            CoachingRequest.objects.create(
                client=client,
                coach=coach,
                goal=random.choice(goals),
                message=random.choice(request_messages),
                status=random.choice(statuses),
            )

        for _ in range(15):
            CoachingRequest.objects.create(
                client=random.choice(clients),
                coach=random.choice(coach_profiles),
                goal=random.choice(goals),
                message=random.choice(request_messages),
                status=random.choice(statuses),
            )

        self.stdout.write(self.style.SUCCESS("🔥 SEED COMPLETED SUCCESSFULLY"))