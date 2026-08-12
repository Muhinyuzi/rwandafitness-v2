import re

from django.core.management.base import BaseCommand
from django.db import transaction

from coaches.models import CoachProfile, CoachTranslation
from gyms.models import Gym


COACH_NAMES = {
    "Arnoldine",
    "Bojhak",
    "Cadet",
    "Naillah",
    "Kanda",
    "Eric",
    "Thetrainerofficial",
}


SECTION_LABELS = {
    "en": {
        "names": (
            "Names:",
        ),
        "address": (
            "Address:",
        ),
        "style": (
            "Coaching style:",
        ),
        "experience": (
            "Experience:",
        ),
        "gym": (
            "Main gym:",
            "Main gym :",
        ),
        "others": (
            "Others:",
        ),
    },
    "rw": {
        "names": (
            "Amazina:",
        ),
        "address": (
            "Aho atuye:",
        ),
        "style": (
            "Uko akora:",
        ),
        "experience": (
            "Uburambe:",
        ),
        "gym": (
            "Gym akoreramo:",
            "Gym:",
        ),
        "others": (
            "Ibindi:",
            "Ibindi wamenya:",
        ),
    },
}


def normalize_text(value):
    if not value:
        return ""

    value = value.replace("\r\n", "\n")
    value = value.replace("\r", "\n")

    lines = []

    for line in value.splitlines():
        line = re.sub(
            r"[ \t]+",
            " ",
            line,
        ).strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def starts_with_any(line, values):
    lower = line.lower()

    for value in values:
        if lower.startswith(value.lower()):
            return value

    return None


def find_section(line, language):
    labels = SECTION_LABELS[language]

    for section, values in labels.items():
        matched = starts_with_any(
            line,
            values,
        )

        if matched:
            return section, matched

    return None, None


def parse_bio(
    bio,
    language,
):
    bio = normalize_text(bio)

    result = {
        "names": [],
        "address": [],
        "style": [],
        "experience": [],
        "gym": [],
        "others": [],
    }

    current_section = None

    for line in bio.splitlines():
        section, label = find_section(
            line,
            language,
        )

        if section:
            current_section = section

            remaining = line[
                len(label):
            ].strip()

            if remaining:
                result[
                    current_section
                ].append(
                    remaining
                )

            continue

        if current_section:
            result[
                current_section
            ].append(
                line
            )
        else:
            result["others"].append(
                line
            )

    return result


def build_bio(parsed):
    parts = []

    experience = " ".join(
        parsed["experience"]
    ).strip()

    others = " ".join(
        parsed["others"]
    ).strip()

    if experience:
        parts.append(experience)

    if others:
        parts.append(others)

    return "\n\n".join(parts)


def extract_city(parsed):
    address = " ".join(
        parsed["address"]
    ).strip()

    if not address:
        return ""

    first_part = address.split(",")[0].strip()

    return first_part


def extract_gym_name(parsed):
    return " ".join(
        parsed["gym"]
    ).strip()


def normalize_gym_name(value):
    if not value:
        return ""

    value = value.strip()

    aliases = {
        "Cali fitness": "Cali Fitness",
        "Cali Fitness": "Cali Fitness",
        "Body fuel": "Body Fuel",
        "Body Fuel": "Body Fuel",
        "Body Marks": "Body Marks",
        "Fitnesspoint": "Fitnesspoint",
        "Fitness Point": "Fitnesspoint",
        "Zone Fitness": "Zone Fitness",
    }

    return aliases.get(
        value,
        value,
    )


class Command(BaseCommand):
    help = (
        "Structure imported V1 coach bios "
        "into V2 coach fields"
    )

    def add_arguments(
        self,
        parser,
    ):
        parser.add_argument(
            "--dry-run",
            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):
        dry_run = options["dry_run"]

        coaches = (
            CoachProfile.objects
            .filter(
                user__full_name__in=COACH_NAMES
            )
            .select_related(
                "user",
                "gym",
            )
            .prefetch_related(
                "translations"
            )
            .order_by(
                "id"
            )
        )

        changes = []

        for coach in coaches:
            translations = {
                tr.language: tr
                for tr
                in coach.translations.all()
            }

            parsed = {}

            for language in (
                "en",
                "rw",
            ):
                translation = (
                    translations.get(
                        language
                    )
                )

                if not translation:
                    continue

                parsed[
                    language
                ] = parse_bio(
                    translation.bio,
                    language,
                )

            city = coach.city

            if "en" in parsed:
                parsed_city = extract_city(
                    parsed["en"]
                )

                if parsed_city:
                    city = parsed_city

            elif "rw" in parsed:
                parsed_city = extract_city(
                    parsed["rw"]
                )

                if parsed_city:
                    city = parsed_city

            gym_name = ""

            for language in (
                "en",
                "rw",
            ):
                if language in parsed:
                    value = extract_gym_name(
                        parsed[
                            language
                        ]
                    )

                    if value:
                        gym_name = (
                            normalize_gym_name(
                                value
                            )
                        )
                        break

            gym = None

            if gym_name:
                gym = Gym.objects.filter(
                    name__iexact=gym_name
                ).first()

            item = {
                "coach": coach,
                "city": city,
                "gym": gym,
                "gym_name": gym_name,
                "translations": {},
            }

            for language, data in parsed.items():
                translation = translations[
                    language
                ]

                bio = build_bio(
                    data
                )

                item[
                    "translations"
                ][language] = {
                    "object": translation,
                    "bio": bio,
                    "style": " ".join(
                        data["style"]
                    ).strip(),
                    "address": " ".join(
                        data["address"]
                    ).strip(),
                }

            changes.append(
                item
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "V1 coach restructuring"
            )
        )

        for item in changes:
            coach = item["coach"]

            self.stdout.write(
                "\n"
                + "=" * 70
            )

            self.stdout.write(
                coach.user.full_name
            )

            self.stdout.write(
                f"City: "
                f"{item['city'] or '(vide)'}"
            )

            self.stdout.write(
                f"Gym detected: "
                f"{item['gym_name'] or '(vide)'}"
            )

            self.stdout.write(
                f"Gym matched: "
                f"{item['gym'].name if item['gym'] else '(aucun)'}"
            )

            for language, data in (
                item[
                    "translations"
                ].items()
            ):
                self.stdout.write(
                    f"\n--- "
                    f"{language.upper()} ---"
                )

                self.stdout.write(
                    "ADDRESS:"
                )

                self.stdout.write(
                    data[
                        "address"
                    ]
                    or "(vide)"
                )

                self.stdout.write(
                    "\nCOACHING STYLE:"
                )

                self.stdout.write(
                    data[
                        "style"
                    ]
                    or "(vide)"
                )

                self.stdout.write(
                    "\nBIO:"
                )

                self.stdout.write(
                    data[
                        "bio"
                    ]
                    or "(vide)"
                )

        if dry_run:
            self.stdout.write("")

            self.stdout.write(
                self.style.WARNING(
                    "DRY RUN - "
                    "aucune donnée modifiée."
                )
            )

            return

        with transaction.atomic():
            for item in changes:
                coach = item["coach"]

                coach.city = item["city"]

                if item["gym"]:
                    coach.gym = item["gym"]

                coach.save(
                    update_fields=[
                        "city",
                        "gym",
                    ]
                )

                for data in (
                    item[
                        "translations"
                    ].values()
                ):
                    translation = (
                        data["object"]
                    )

                    translation.bio = (
                        data["bio"]
                    )

                    translation.save(
                        update_fields=[
                            "bio",
                        ]
                    )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Coachs restructurés."
            )
        )
