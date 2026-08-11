import re

from django.core.management.base import BaseCommand
from django.db import transaction

from bs4 import BeautifulSoup

from coaches.models import CoachTranslation
from gyms.models import GymTranslation


ALLOWED_TAGS = {
    "p",
    "br",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "a",
    "h2",
    "h3",
    "h4",
}

REMOVE_TAGS_BUT_KEEP_CONTENT = {
    "span",
    "font",
    "div",
}

ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
}
def clean_html(value: str) -> str:
    if not value:
        return ""

    soup = BeautifulSoup(value, "html.parser")

    # Supprimer complètement les éléments indésirables
    for tag in soup.find_all(
        ["script", "style", "iframe", "object"]
    ):
        tag.decompose()

    # Transformer les <br> en retours à la ligne
    for br in soup.find_all("br"):
        br.replace_with("\n")

    # Ajouter une séparation après les blocs
    for tag in soup.find_all(
        ["p", "div", "li", "h1", "h2", "h3", "h4"]
    ):
        tag.append("\n")

    # Extraire uniquement le texte
    text = soup.get_text()

    # Remplacer les espaces insécables
    text = text.replace("\xa0", " ")

    # Nettoyer les espaces inutiles sur chaque ligne
    lines = []

    for line in text.splitlines():
        line = re.sub(
            r"[ \t]+",
            " ",
            line,
        ).strip()

        if line:
            lines.append(line)

    return "\n\n".join(lines)



class Command(BaseCommand):
    help = "Clean legacy HTML imported into gym descriptions and coach bios"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without modifying the database",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        gym_changes = []
        coach_changes = []

        for translation in GymTranslation.objects.all():
            old = translation.description or ""
            new = clean_html(old)

            if old != new:
                gym_changes.append(
                    {
                        "id": translation.id,
                        "gym": translation.gym.name,
                        "language": translation.language,
                        "old": old,
                        "new": new,
                    }
                )

        for translation in CoachTranslation.objects.all():
            old = translation.bio or ""
            new = clean_html(old)

            if old != new:
                coach_changes.append(
                    {
                        "id": translation.id,
                        "coach": translation.coach.user.full_name,
                        "language": translation.language,
                        "old": old,
                        "new": new,
                    }
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "Legacy profile HTML cleanup"
            )
        )
        self.stdout.write("")

        self.stdout.write(
            f"Gym translations à nettoyer :   {len(gym_changes)}"
        )
        self.stdout.write(
            f"Coach translations à nettoyer : {len(coach_changes)}"
        )

        if dry_run:
            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    "DRY RUN - aucune donnée modifiée."
                )
            )

            for item in gym_changes[:5]:
                self.stdout.write("")
                self.stdout.write(
                    f"[GYM] {item['gym']} ({item['language']})"
                )
                self.stdout.write(
                    f"AVANT: {item['old'][:300]}"
                )
                self.stdout.write(
                    f"APRÈS: {item['new'][:300]}"
                )

            for item in coach_changes[:5]:
                self.stdout.write("")
                self.stdout.write(
                    f"[COACH] {item['coach']} ({item['language']})"
                )
                self.stdout.write(
                    f"AVANT: {item['old'][:300]}"
                )
                self.stdout.write(
                    f"APRÈS: {item['new'][:300]}"
                )

            return

        with transaction.atomic():
            for item in gym_changes:
                GymTranslation.objects.filter(
                    pk=item["id"]
                ).update(
                    description=item["new"]
                )

            for item in coach_changes:
                CoachTranslation.objects.filter(
                    pk=item["id"]
                ).update(
                    bio=item["new"]
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Nettoyage terminé."
            )
        )

        self.stdout.write(
            f"Gym translations modifiées :   {len(gym_changes)}"
        )
        self.stdout.write(
            f"Coach translations modifiées : {len(coach_changes)}"
        )
