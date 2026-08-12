from django.core.management.base import BaseCommand
from django.db import transaction

from gyms.models import Gym, GymTranslation


GYMS = [
    {
        "name": "Soho Training Studio",
        "city": "Kigali",
        "address": "2 KG 637 Street, Kigali",
        "phone": "+250792400521",
        "email": "",
        "website": "",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "A training studio in Kigali offering structured "
                    "fitness, strength and conditioning workouts in a "
                    "community-focused environment."
                ),
                "opening_hours": (
                    "Monday-Friday: 6:00 AM - 9:00 PM; "
                    "Saturday-Sunday: 8:00 AM - 5:00 PM"
                ),
            },
            "rw": {
                "description": (
                    "Ni training studio i Kigali ifasha abantu gukora "
                    "imyitozo ya fitness, strength na conditioning mu "
                    "buryo buteguye kandi bukorerwa mu itsinda."
                ),
                "opening_hours": (
                    "Kuwa mbere-Kuwa gatanu: 6:00-21:00; "
                    "Kuwa gatandatu-Ku cyumweru: 8:00-17:00"
                ),
            },
        },
    },
    {
        "name": "Apollo Fitness Gym",
        "city": "Rubavu",
        "address": "Habib Center, 3rd Floor, Gisenyi, Rubavu District",
        "phone": "+250788123456",
        "email": "info@apollofitness.rw",
        "website": "",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "Fitness gym located in Gisenyi, Rubavu, offering "
                    "gym access, coaching and fitness programs for "
                    "different training levels."
                ),
                "opening_hours": (
                    "Monday-Friday: 6:00 AM - 10:00 PM; "
                    "Saturday-Sunday: 8:00 AM - 8:00 PM"
                ),
            },
            "rw": {
                "description": (
                    "Ni gym iherereye i Gisenyi mu Karere ka Rubavu. "
                    "Itanga uburyo bwo gukorera fitness, coaching "
                    "n'imyitozo ijyanye n'inzego zitandukanye."
                ),
                "opening_hours": (
                    "Kuwa mbere-Kuwa gatanu: 6:00-22:00; "
                    "Kuwa gatandatu-Ku cyumweru: 8:00-20:00"
                ),
            },
        },
    },
    {
        "name": "Light House Hotel Health Gym & Spa",
        "city": "Huye",
        "address": "Mukoni, Huye",
        "phone": "+250788538805",
        "email": "",
        "website": "https://www.lighthouserwanda.com/",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "Health and fitness facility at Light House Hotel "
                    "in Huye offering gym and wellness services, "
                    "including sauna facilities."
                ),
                "opening_hours": "",
            },
            "rw": {
                "description": (
                    "Ni fitness na wellness center iri muri Light House "
                    "Hotel i Huye. Ifite gym ndetse na serivisi zo "
                    "kuruhura umubiri zirimo sauna."
                ),
                "opening_hours": "",
            },
        },
    },
    {
        "name": "Holistic Fitness Rwanda",
        "city": "Huye",
        "address": "Taba, Huye, Butare",
        "phone": "+250787675370",
        "email": "",
        "website": "",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "Fitness center in Huye focused on general fitness "
                    "and wellness activities."
                ),
                "opening_hours": "",
            },
            "rw": {
                "description": (
                    "Ni fitness center iherereye i Huye yibanda ku "
                    "myitozo ngororamubiri no kwita ku buzima muri rusange."
                ),
                "opening_hours": "",
            },
        },
    },
    {
        "name": "Comfort Hotel Fitness Center",
        "city": "Musanze",
        "address": "Musanze, Northern Province",
        "phone": "+250791330698",
        "email": "",
        "website": "",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "Fitness facility located at Comfort Hotel in "
                    "Musanze. The hotel includes a gym among its "
                    "recreation and wellness amenities."
                ),
                "opening_hours": "",
            },
            "rw": {
                "description": (
                    "Ni fitness facility iri muri Comfort Hotel i "
                    "Musanze. Hotel ifite gym mu bikorwa byayo bya "
                    "sport na wellness."
                ),
                "opening_hours": "",
            },
        },
    },
    {
        "name": "Fatima Hotel Fitness Center",
        "city": "Musanze",
        "address": "Ruhengeri-Gisenyi Road, Musanze",
        "phone": "+250788332202",
        "email": "",
        "website": "",
        "instagram": "",
        "facebook": "",
        "is_verified": False,
        "translations": {
            "en": {
                "description": (
                    "Fitness and wellness facility at Fatima Hotel in "
                    "Musanze, with gym facilities alongside other "
                    "wellness services."
                ),
                "opening_hours": "",
            },
            "rw": {
                "description": (
                    "Ni fitness na wellness facility iri muri Fatima "
                    "Hotel i Musanze. Ifite gym hamwe n'izindi serivisi "
                    "zijyanye no kwita ku mubiri."
                ),
                "opening_hours": "",
            },
        },
    },
]


class Command(BaseCommand):
    help = "Add missing RwandaFitness gyms without deleting existing data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be created without modifying the database",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "RwandaFitness missing gyms seed"
            )
        )

        created_count = 0
        existing_count = 0
        translation_count = 0

        with transaction.atomic():
            for item in GYMS:
                existing_gym = Gym.objects.filter(
                    name__iexact=item["name"]
                ).first()

                if existing_gym:
                    gym = existing_gym
                    existing_count += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"EXISTS: {gym.name} ({gym.city})"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"CREATE: {item['name']} ({item['city']})"
                        )
                    )

                    if dry_run:
                        continue

                    gym = Gym.objects.create(
                        name=item["name"],
                        city=item["city"],
                        address=item["address"],
                        phone=item["phone"],
                        email=item["email"],
                        website=item["website"],
                        instagram=item["instagram"],
                        facebook=item["facebook"],
                        is_verified=item["is_verified"],
                    )

                    created_count += 1

                if dry_run:
                    continue

                for language, translation_data in (
                    item["translations"].items()
                ):
                    _, created = GymTranslation.objects.update_or_create(
                        gym=gym,
                        language=language,
                        defaults={
                            "description": translation_data["description"],
                            "opening_hours": translation_data["opening_hours"],
                        },
                    )

                    if created:
                        translation_count += 1

            if dry_run:
                transaction.set_rollback(True)

        self.stdout.write("")

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    "DRY RUN - aucune donnée modifiée."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Gyms créés : {created_count}"
            )
        )

        self.stdout.write(
            f"Gyms déjà existants : {existing_count}"
        )

        self.stdout.write(
            f"Nouvelles traductions : {translation_count}"
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seed terminé."
            )
        )
