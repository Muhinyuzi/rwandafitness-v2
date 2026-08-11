from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import connections, transaction
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import User
from articles.models import Article, ArticleTranslation
from coaches.models import (
    CoachGalleryImage,
    CoachProfile,
    CoachTranslation,
)
from gyms.models import (
    Gym,
    GymGalleryImage,
    GymTranslation,
)


V1_MEDIA_DIR = Path("/home/rwandafitness/v1_media")


CATEGORY_MAP = {
    "bodybuilding": "muscle-gain",
    "event": "wellness",
    "gym": "gym-tips",
    "inkuru": "wellness",
    "nutrition": "nutrition",
    "supplementation": "nutrition",
    "video": "training",
    "workout": "training",
    "weight loss": "weight-loss",
}


class Command(BaseCommand):
    help = "Import RwandaFitness V1 data into V2"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Analyse V1 data without modifying V2",
        )

    # ==========================================================
    # LEGACY DATABASE HELPERS
    # ==========================================================

    def fetch_all(self, sql, params=None):
        with connections["legacy"].cursor() as cursor:
            cursor.execute(sql, params or [])

            columns = [
                column[0]
                for column in cursor.description
            ]

            return [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]

    def load_legacy_data(self):
        articles = self.fetch_all(
            """
            SELECT *
            FROM articles
            ORDER BY id
            """
        )

        gyms = self.fetch_all(
            """
            SELECT *
            FROM gyms
            ORDER BY id
            """
        )

        gym_photos = self.fetch_all(
            """
            SELECT *
            FROM gymphotos
            ORDER BY gym_id, id
            """
        )

        trainers = self.fetch_all(
            """
            SELECT *
            FROM trainers
            ORDER BY id
            """
        )

        trainer_photos = self.fetch_all(
            """
            SELECT *
            FROM trainerphotos
            ORDER BY trainer_id, id
            """
        )

        return {
            "articles": articles,
            "gyms": gyms,
            "gym_photos": gym_photos,
            "trainers": trainers,
            "trainer_photos": trainer_photos,
        }

    # ==========================================================
    # GENERIC HELPERS
    # ==========================================================

    def legacy_datetime(self, value):
        if value is None:
            return None

        if timezone.is_naive(value):
            return timezone.make_aware(
                value,
                timezone.get_current_timezone(),
            )

        return value

    def media_file(self, filename):
        if not filename:
            return None

        path = V1_MEDIA_DIR / filename

        if not path.is_file():
            raise CommandError(
                f"Fichier média introuvable: {path}"
            )

        return path

    def map_category(self, value):
        key = (value or "").strip().lower()

        return CATEGORY_MAP.get(
            key,
            "wellness",
        )

    # ==========================================================
    # UNIQUE VALUES
    # ==========================================================

    def unique_username(self, email, name):
        if email and "@" in email:
            base = email.split("@", 1)[0]
        else:
            base = (
                slugify(name or "coach")
                .replace("-", "_")
            )

        base = base[:120] or "coach"

        username = base
        counter = 1

        while User.objects.filter(
            username=username
        ).exists():
            username = f"{base}_{counter}"
            counter += 1

        return username

    def unique_article_slug(
        self,
        title,
        language,
    ):
        base = slugify(title) or "article"

        slug = base
        counter = 1

        while ArticleTranslation.objects.filter(
            language=language,
            slug=slug,
        ).exists():
            slug = f"{base}-{counter}"
            counter += 1

        return slug

    def unique_gym_slug(self, preferred, name):
        base = slugify(
            preferred or name
        ) or "gym"

        slug = base
        counter = 1

        while Gym.objects.filter(
            slug=slug
        ).exists():
            slug = f"{base}-{counter}"
            counter += 1

        return slug

    # ==========================================================
    # SAFETY
    # ==========================================================

    def check_target_is_safe(self):
        problems = []

        article_count = Article.objects.count()
        gym_count = Gym.objects.count()
        coach_count = CoachProfile.objects.count()

        if article_count:
            problems.append(
                f"{article_count} article(s) existent déjà"
            )

        if gym_count:
            problems.append(
                f"{gym_count} gym(s) existent déjà"
            )

        if coach_count:
            problems.append(
                f"{coach_count} coach(s) existent déjà"
            )

        if problems:
            raise CommandError(
                "Import annulé pour éviter les doublons : "
                + "; ".join(problems)
            )

    def verify_media(self, data):
        references = []

        for article in data["articles"]:
            filename = article.get(
                "image_filename"
            )

            if filename:
                references.append(
                    ("article cover", filename)
                )

        for gym in data["gyms"]:
            filename = gym.get(
                "image_filename"
            )

            if filename:
                references.append(
                    ("gym cover", filename)
                )

        for photo in data["gym_photos"]:
            filename = photo.get(
                "image_filename"
            )

            if filename:
                references.append(
                    ("gym gallery", filename)
                )

        for trainer in data["trainers"]:
            filename = trainer.get(
                "image_filename"
            )

            if filename:
                references.append(
                    ("coach profile", filename)
                )

        for photo in data["trainer_photos"]:
            filename = photo.get(
                "image_filename"
            )

            if filename:
                references.append(
                    ("coach gallery", filename)
                )

        missing = []

        for label, filename in references:
            path = V1_MEDIA_DIR / filename

            if not path.is_file():
                missing.append(
                    (label, filename)
                )

        return references, missing

    # ==========================================================
    # DRY RUN
    # ==========================================================

    def dry_run_report(self, data):
        references, missing = self.verify_media(
            data
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "RwandaFitness V1 -> V2"
            )
        )
        self.stdout.write("")

        self.stdout.write(
            "Articles à importer :      "
            f"{len(data['articles'])}"
        )

        self.stdout.write(
            "Gyms à importer :          "
            f"{len(data['gyms'])}"
        )

        self.stdout.write(
            "Gym gallery images :       "
            f"{len(data['gym_photos'])}"
        )

        self.stdout.write(
            "Coachs à importer :        "
            f"{len(data['trainers'])}"
        )

        self.stdout.write(
            "Coach gallery images :     "
            f"{len(data['trainer_photos'])}"
        )

        self.stdout.write("")

        self.stdout.write(
            "Médias nécessaires :       "
            f"{len(references)}"
        )

        self.stdout.write(
            "Médias manquants :          "
            f"{len(missing)}"
        )

        self.stdout.write("")
        self.stdout.write(
            "Catégories articles :"
        )

        for article in data["articles"]:
            old_category = article.get(
                "article_category"
            )

            new_category = self.map_category(
                old_category
            )

            self.stdout.write(
                f"  #{article['id']} "
                f"{old_category!r} "
                f"-> {new_category!r}"
            )

        if missing:
            self.stdout.write("")
            self.stdout.write(
                self.style.ERROR(
                    "Médias manquants :"
                )
            )

            for label, filename in missing:
                self.stdout.write(
                    f"  [{label}] {filename}"
                )

            raise CommandError(
                "Dry-run échoué : "
                "des médias sont manquants."
            )

        legacy_emails = [
            (trainer.get("trainer_email") or "")
            .strip()
            .lower()
            for trainer in data["trainers"]
            if trainer.get("trainer_email")
        ]

        collisions = list(
            User.objects.filter(
                email__in=legacy_emails
            ).values_list(
                "email",
                flat=True,
            )
        )

        self.stdout.write("")

        self.stdout.write(
            "Collisions email V2 :       "
            f"{len(collisions)}"
        )

        for email in collisions:
            self.stdout.write(
                f"  - {email}"
            )

        if collisions:
            raise CommandError(
                "Dry-run échoué : "
                "collisions email détectées."
            )

        self.stdout.write("")

        self.stdout.write(
            self.style.WARNING(
                "DRY RUN - "
                "aucune donnée V2 modifiée."
            )
        )

        self.stdout.write("")

        self.stdout.write(
            self.style.WARNING(
                "Non migrés volontairement : "
                "10 articlephotos "
                "+ 3 trainervideos."
            )
        )

    # ==========================================================
    # ARTICLES
    # ==========================================================

    def import_articles(
        self,
        articles,
        created_files,
    ):
        created = 0

        for old in articles:
            article = Article.objects.create(
                category=self.map_category(
                    old.get(
                        "article_category"
                    )
                ),
                author_name="RwandaFitness",
                is_published=True,
                is_featured=False,
                published_at=self.legacy_datetime(
                    old.get(
                        "date_created"
                    )
                ),
            )

            filename = old.get(
                "image_filename"
            )

            if filename:
                source = self.media_file(
                    filename
                )

                with source.open("rb") as handle:
                    article.cover_image.save(
                        filename,
                        File(handle),
                        save=True,
                    )

                if article.cover_image.name:
                    created_files.append(
                        article.cover_image.name
                    )

            rw_title = (
                old.get("article_title")
                or old.get("en_title")
                or f"Article {old['id']}"
            )

            en_title = (
                old.get("en_title")
                or old.get("article_title")
                or f"Article {old['id']}"
            )

            ArticleTranslation.objects.create(
                article=article,
                language="rw",
                title=rw_title,
                slug=self.unique_article_slug(
                    rw_title,
                    "rw",
                ),
                excerpt=(
                    old.get(
                        "article_summary"
                    )
                    or ""
                ),
                content=(
                    old.get(
                        "article_content"
                    )
                    or ""
                ),
            )

            ArticleTranslation.objects.create(
                article=article,
                language="en",
                title=en_title,
                slug=self.unique_article_slug(
                    en_title,
                    "en",
                ),
                excerpt=(
                    old.get(
                        "en_summary"
                    )
                    or ""
                ),
                content=(
                    old.get(
                        "en_content"
                    )
                    or ""
                ),
            )

            date_created = old.get(
                "date_created"
            )

            if date_created:
                Article.objects.filter(
                    pk=article.pk
                ).update(
                    created_at=(
                        self.legacy_datetime(
                            date_created
                        )
                    )
                )

            created += 1

        return created

    # ==========================================================
    # GYMS
    # ==========================================================

    def import_gyms(
        self,
        gyms,
        gym_photos,
        created_files,
    ):
        gym_map = {}

        created = 0
        gallery_created = 0

        for old in gyms:
            name = (
                old.get("gym_name")
                or f"Gym {old['id']}"
            )

            gym = Gym.objects.create(
                name=name,
                city=(
                    old.get("gym_city")
                    or ""
                ),
                address=(
                    old.get("gym_address")
                    or ""
                ),
                instagram=(
                    old.get(
                        "gym_instagram"
                    )
                    or ""
                ),
                facebook=(
                    old.get(
                        "gym_facebook"
                    )
                    or ""
                ),
                slug=self.unique_gym_slug(
                    old.get(
                        "gym_url_name"
                    ),
                    name,
                ),
                is_verified=False,
            )

            filename = old.get(
                "image_filename"
            )

            if filename:
                source = self.media_file(
                    filename
                )

                with source.open("rb") as handle:
                    gym.cover_image.save(
                        filename,
                        File(handle),
                        save=True,
                    )

                if gym.cover_image.name:
                    created_files.append(
                        gym.cover_image.name
                    )

            GymTranslation.objects.create(
                gym=gym,
                language="rw",
                description=(
                    old.get(
                        "gym_description"
                    )
                    or ""
                ),
                opening_hours="",
            )

            GymTranslation.objects.create(
                gym=gym,
                language="en",
                description=(
                    old.get(
                        "gym_english"
                    )
                    or ""
                ),
                opening_hours="",
            )

            date_created = old.get(
                "date_created"
            )

            if date_created:
                Gym.objects.filter(
                    pk=gym.pk
                ).update(
                    created_at=(
                        self.legacy_datetime(
                            date_created
                        )
                    )
                )

            gym_map[old["id"]] = gym

            created += 1

        sort_orders = {}

        for old in gym_photos:
            gym = gym_map.get(
                old.get("gym_id")
            )

            filename = old.get(
                "image_filename"
            )

            if not gym or not filename:
                continue

            source = self.media_file(
                filename
            )

            sort_order = sort_orders.get(
                old["gym_id"],
                0,
            )

            gallery = GymGalleryImage(
                gym=gym,
                caption=(
                    old.get("image_title")
                    or ""
                ),
                sort_order=sort_order,
            )

            with source.open("rb") as handle:
                gallery.image.save(
                    filename,
                    File(handle),
                    save=True,
                )

            if gallery.image.name:
                created_files.append(
                    gallery.image.name
                )

            date_created = old.get(
                "date_created"
            )

            if date_created:
                GymGalleryImage.objects.filter(
                    pk=gallery.pk
                ).update(
                    created_at=(
                        self.legacy_datetime(
                            date_created
                        )
                    )
                )

            sort_orders[
                old["gym_id"]
            ] = sort_order + 1

            gallery_created += 1

        return (
            created,
            gallery_created,
        )

    # ==========================================================
    # COACHES
    # ==========================================================

    def import_coaches(
        self,
        trainers,
        trainer_photos,
        created_files,
    ):
        coach_map = {}

        created = 0
        gallery_created = 0

        for old in trainers:
            email = (
                old.get("trainer_email")
                or ""
            ).strip().lower()

            if not email:
                raise CommandError(
                    "Trainer V1 "
                    f"#{old['id']} sans email."
                )

            if User.objects.filter(
                email=email
            ).exists():
                raise CommandError(
                    "Email déjà présent "
                    f"dans V2 : {email}"
                )

            username = self.unique_username(
                email,
                old.get(
                    "trainer_name"
                ),
            )

            user = User(
                username=username,
                email=email,
                full_name=(
                    old.get(
                        "trainer_name"
                    )
                    or email
                ),
                phone=(
                    old.get(
                        "trainer_phone_number"
                    )
                    or ""
                ),
                role="coach",
                email_verified=True,
                is_active=True,
            )

            # Les anciens hashes Flask
            # ne sont pas réutilisés.
            # Les coachs pourront utiliser
            # "Forgot password" sur V2.
            user.set_unusable_password()

            # IMPORTANT:
            # ce save déclenche accounts/signals.py,
            # qui crée automatiquement CoachProfile.
            user.save()

            # Le profil existe déjà grâce au signal.
            coach = user.coach_profile

            coach.specialty = "fitness"
            coach.years_experience = 0
            coach.city = (
                old.get("trainer_city")
                or ""
            )
            coach.price_per_session = None
            coach.is_verified = False
            coach.available_online = False
            coach.available_in_person = True
            coach.instagram = (
                old.get(
                    "trainer_instagram"
                )
                or ""
            )

            coach.save()

            filename = old.get(
                "image_filename"
            )

            if filename:
                source = self.media_file(
                    filename
                )

                with source.open("rb") as handle:
                    coach.photo.save(
                        filename,
                        File(handle),
                        save=True,
                    )

                if coach.photo.name:
                    created_files.append(
                        coach.photo.name
                    )

            CoachTranslation.objects.create(
                coach=coach,
                language="rw",
                bio=(
                    old.get(
                        "trainer_introduction"
                    )
                    or ""
                ),
            )

            CoachTranslation.objects.create(
                coach=coach,
                language="en",
                bio=(
                    old.get(
                        "trainer_english"
                    )
                    or ""
                ),
            )

            date_created = old.get(
                "date_created"
            )

            if date_created:
                created_at = (
                    self.legacy_datetime(
                        date_created
                    )
                )

                User.objects.filter(
                    pk=user.pk
                ).update(
                    created_at=created_at
                )

                CoachProfile.objects.filter(
                    pk=coach.pk
                ).update(
                    created_at=created_at
                )

            coach_map[
                old["id"]
            ] = coach

            created += 1

        sort_orders = {}

        for old in trainer_photos:
            coach = coach_map.get(
                old.get(
                    "trainer_id"
                )
            )

            filename = old.get(
                "image_filename"
            )

            if not coach or not filename:
                continue

            source = self.media_file(
                filename
            )

            sort_order = sort_orders.get(
                old["trainer_id"],
                0,
            )

            gallery = CoachGalleryImage(
                coach=coach,
                caption=(
                    old.get(
                        "image_title"
                    )
                    or ""
                ),
                sort_order=sort_order,
            )

            with source.open("rb") as handle:
                gallery.image.save(
                    filename,
                    File(handle),
                    save=True,
                )

            if gallery.image.name:
                created_files.append(
                    gallery.image.name
                )

            date_created = old.get(
                "date_created"
            )

            if date_created:
                CoachGalleryImage.objects.filter(
                    pk=gallery.pk
                ).update(
                    created_at=(
                        self.legacy_datetime(
                            date_created
                        )
                    )
                )

            sort_orders[
                old["trainer_id"]
            ] = sort_order + 1

            gallery_created += 1

        return (
            created,
            gallery_created,
        )

    # ==========================================================
    # FILE CLEANUP AFTER FAILED TRANSACTION
    # ==========================================================

    def cleanup_created_files(
        self,
        created_files,
    ):
        if not created_files:
            return

        from django.core.files.storage import (
            default_storage,
        )

        for filename in reversed(
            created_files
        ):
            try:
                if default_storage.exists(
                    filename
                ):
                    default_storage.delete(
                        filename
                    )
            except Exception as exc:
                self.stderr.write(
                    self.style.WARNING(
                        "Impossible de supprimer "
                        f"{filename}: {exc}"
                    )
                )

    # ==========================================================
    # MAIN
    # ==========================================================

    def handle(
        self,
        *args,
        **options,
    ):
        data = self.load_legacy_data()

        if options["dry_run"]:
            self.dry_run_report(
                data
            )
            return

        self.check_target_is_safe()

        references, missing = (
            self.verify_media(
                data
            )
        )

        if missing:
            for label, filename in missing:
                self.stderr.write(
                    f"[{label}] {filename}"
                )

            raise CommandError(
                "Import annulé : "
                "fichiers médias manquants."
            )

        created_files = []

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "IMPORT RwandaFitness "
                "V1 -> V2"
            )
        )
        self.stdout.write("")

        try:
            with transaction.atomic(
                using="default"
            ):
                article_count = (
                    self.import_articles(
                        data["articles"],
                        created_files,
                    )
                )

                (
                    gym_count,
                    gym_gallery_count,
                ) = self.import_gyms(
                    data["gyms"],
                    data["gym_photos"],
                    created_files,
                )

                (
                    coach_count,
                    coach_gallery_count,
                ) = self.import_coaches(
                    data["trainers"],
                    data[
                        "trainer_photos"
                    ],
                    created_files,
                )

        except Exception as exc:
            # PostgreSQL est rollbacké par
            # transaction.atomic(), mais les
            # fichiers ImageField doivent être
            # supprimés manuellement.
            self.cleanup_created_files(
                created_files
            )

            raise CommandError(
                f"Import annulé : {exc}"
            ) from exc

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "IMPORT TERMINÉ"
            )
        )
        self.stdout.write("")

        self.stdout.write(
            "Articles créés :          "
            f"{article_count}"
        )

        self.stdout.write(
            "Article translations :    "
            f"{article_count * 2}"
        )

        self.stdout.write(
            "Gyms créés :              "
            f"{gym_count}"
        )

        self.stdout.write(
            "Gym translations :        "
            f"{gym_count * 2}"
        )

        self.stdout.write(
            "Gym gallery images :      "
            f"{gym_gallery_count}"
        )

        self.stdout.write(
            "Coachs créés :            "
            f"{coach_count}"
        )

        self.stdout.write(
            "Coach translations :      "
            f"{coach_count * 2}"
        )

        self.stdout.write(
            "Coach gallery images :    "
            f"{coach_gallery_count}"
        )

        self.stdout.write("")

        self.stdout.write(
            self.style.WARNING(
                "Non migrés volontairement : "
                "10 articlephotos "
                "+ 3 trainervideos."
            )
        )
