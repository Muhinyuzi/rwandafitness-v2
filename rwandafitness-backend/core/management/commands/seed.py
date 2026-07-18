from decimal import Decimal
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from articles.models import Article
from coaches.models import CoachProfile, CoachGalleryImage
from gyms.models import Gym, GymGalleryImage
from requests_app.models import CoachingRequest

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with rich RwandaFitness data"

    def handle(self, *args, **kwargs):
        self.stdout.write("🧹 Cleaning database...")

        CoachingRequest.objects.all().delete()
        Article.objects.all().delete()
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
                "name": "WAKA Fitness",
                "city": "Kigali",
                "description": "Modern fitness club in Kigali focused on strength, cardio and group workouts.",
            },
            {
                "name": "Kigali Fit Gym",
                "city": "Kigali",
                "description": "Community-driven gym offering structured workouts, personal training and functional fitness.",
            },
            {
                "name": "Kigali Wellness Hub",
                "city": "Kigali",
                "description": "Fitness and wellness space combining training, yoga and recovery activities.",
            },
            {
                "name": "Fitness Point",
                "city": "Kigali",
                "description": "Accessible gym space for beginners and regular fitness members.",
            },
            {
                "name": "Maisha Spa & Healthclub Kigali Serena",
                "city": "Kigali",
                "description": "Premium health club offering gym access, spa and wellness services.",
            },
            {
                "name": "Platinum Gym Kigali",
                "city": "Kigali",
                "description": "Training gym in Kigali focused on fitness, coaching and member progress.",
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

        for user in coach_users:
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

        self.stdout.write("📰 Creating articles...")

        articles_data = [
            {
                "title": "How to Start Your Fitness Journey in Rwanda",
                "excerpt": "Simple steps to begin training consistently, even if you are starting from zero.",
                "content": """
Starting your fitness journey does not need to be complicated.

Begin with small goals: walking more, training two or three times per week, and improving your meals gradually. The most important part is consistency.

A good coach can help you avoid confusion, create a realistic plan, and stay motivated. RwandaFitness helps you discover coaches and gyms that match your goals.
""",
                "category": "training",
                "is_featured": True,
            },
            {
                "title": "Nutrition Basics for Better Results",
                "excerpt": "Training is important, but nutrition plays a major role in your progress.",
                "content": """
Good nutrition supports your workouts, recovery, and energy.

Focus on simple habits: eat enough protein, drink water, include fruits and vegetables, and avoid depending only on processed foods.

You do not need a perfect diet. You need a realistic routine that you can maintain every week.
""",
                "category": "nutrition",
                "is_featured": True,
            },
            {
                "title": "Weight Loss: Focus on Habits, Not Pressure",
                "excerpt": "Healthy weight loss comes from consistent habits, not extreme restrictions.",
                "content": """
Weight loss is easier to maintain when you focus on habits instead of pressure.

Start with regular movement, better meal structure, enough sleep, and realistic goals. Avoid extreme diets that are difficult to continue.

A coach can help you track progress and adjust your plan safely.
""",
                "category": "weight-loss",
                "is_featured": True,
            },
            {
                "title": "Why Strength Training Matters",
                "excerpt": "Strength training helps build muscle, confidence, and long-term health.",
                "content": """
Strength training is not only for bodybuilders.

It helps improve posture, muscle tone, metabolism, and general confidence. Beginners can start with basic movements and progress slowly.

The key is proper technique and a program adapted to your level.
""",
                "category": "muscle-gain",
                "is_featured": False,
            },
            {
                "title": "How to Choose the Right Gym",
                "excerpt": "Choosing a gym is easier when you know what to look for.",
                "content": """
A good gym should match your schedule, budget, training style, and comfort level.

Look at equipment, cleanliness, location, opening hours, and whether coaches are available.

The best gym is not always the biggest one. It is the one you can attend consistently.
""",
                "category": "gym-tips",
                "is_featured": False,
            },
        ]

        for item in articles_data:
            Article.objects.create(
                title=item["title"],
                excerpt=item["excerpt"],
                content=item["content"].strip(),
                category=item["category"],
                author_name="RwandaFitness Team",
                is_published=True,
                is_featured=item["is_featured"],
            )

        self.stdout.write(self.style.SUCCESS("🔥 SEED COMPLETED SUCCESSFULLY"))