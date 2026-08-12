import re

from django.core.management.base import BaseCommand
from django.db import transaction

from gyms.models import Gym


GYM_NAMES = {
    "Cali Fitness",
    "Body Fuel",
    "Body Marks",
    "Fitnesspoint",
    "Zone Fitness",
}


SECTION_LABELS = {
    "en": {
        "location": (
            "Location:",
        ),
        "hours": (
            "Working Hours:",
        ),
        "services": (
            "Services offered:",
        ),
        "others": (
            "Others:",
        ),
        "contacts": (
            "Contacts:",
        ),
    },
    "rw": {
        "location": (
            "Aho ikorera:",
            "Aho iherereye:",
        ),
        "hours": (
            "Amasaha ikora:",
        ),
        "services": (
            "Services batanga:",
        ),
        "others": (
            "Ibindi wamenya:",
            "Ikindi wamenya:",
            "Uburambe:",
        ),
        "contacts": (
            "Contacts:",
        ),
    },
}


def normalize_text(value):
    if not value:
        return ""

    value = value.replace("\r\n", "\n")
    value = value.replace("\r", "\n")

    lines = []

    for line in value.split("\n"):
        line = re.sub(
            r"[ \t]+",
            " ",
            line,
        ).strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def starts_with_any(line, values):
    line_lower = line.lower()

    for value in values:
        if line_lower.startswith(
            value.lower()
        ):
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


def parse_description(
    description,
    language,
):
    description = normalize_text(
        description
    )

    result = {
        "location": [],
        "hours": [],
        "services": [],
        "others": [],
        "contacts": [],
    }

    current_section = None

    ignored_lines = {
        "location map",
        "web site",
        "website",
    }

    for line in description.splitlines():
        if line.lower() in ignored_lines:
            continue

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
            result[current_section].append(
                line
            )
        else:
            # Unidentified content is preserved
            # as general description.
            result["others"].append(
                line
            )

    return result


def clean_phone(value):
    if not value:
        return ""

    phones = re.findall(
        r"\+250[\d\s-]{8,15}",
        value,
    )

    cleaned = []

    for phone in phones:
        phone = re.sub(
            r"\s+",
            "",
            phone,
        ).rstrip("-")

        if phone not in cleaned:
            cleaned.append(phone)

    return ", ".join(cleaned)


def clean_email(value):
    if not value:
        return ""

    match = re.search(
        r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}",
        value,
    )

    if match:
        return match.group(0)

    return ""


def build_description(parsed):
    parts = []

    services = " ".join(
        parsed["services"]
    ).strip()

    others = " ".join(
        parsed["others"]
    ).strip()

    if services:
        parts.append(services)

    if others:
        parts.append(others)

    return "\n\n".join(parts)


def build_hours(parsed):
    return "\n".join(
        parsed["hours"]
    ).strip()


class Command(BaseCommand):
    help = (
        "Structure imported V1 gym "
        "descriptions into V2 fields"
    )

    def add_arguments(self, parser):
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

        gyms = (
            Gym.objects
            .filter(name__in=GYM_NAMES)
            .prefetch_related(
                "translations"
            )
            .order_by("id")
        )

        changes = []

        for gym in gyms:
            translations = {
                tr.language: tr
                for tr
                in gym.translations.all()
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

                parsed[language] = (
                    parse_description(
                        translation.description,
                        language,
                    )
                )

            # Prefer English contact information,
            # then fall back to Kinyarwanda.
            contact_text = ""

            for language in (
                "en",
                "rw",
            ):
                if language in parsed:
                    contact_text += (
                        "\n"
                        + "\n".join(
                            parsed[
                                language
                            ]["contacts"]
                        )
                    )

            phone = (
                clean_phone(contact_text)
                or gym.phone
            )

            email = (
                clean_email(contact_text)
                or gym.email
            )

            item = {
                "gym": gym,
                "phone": phone,
                "email": email,
                "translations": {},
            }

            for language, data in parsed.items():
                translation = translations[language]

                description = build_description(
                    data
                )

                # Correction of a legacy V1 typo:
                # Zone Fitness RW incorrectly
                # mentioned Fitnesspoint Gym.
                if (
                    gym.name == "Zone Fitness"
                    and language == "rw"
                ):
                    description = (
                        description.replace(
                            "Fitnesspoint Gym "
                            "ni gym nshyashya",
                            "Zone Fitness "
                            "ni gym nshyashya",
                        )
                    )

                item["translations"][language] = {
                    "object": translation,
                    "description": description,
                    "opening_hours": (
                        build_hours(data)
                    ),
                }

            changes.append(item)

        self.stdout.write("")
        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "V1 gym restructuring"
            )
        )

        for item in changes:
            gym = item["gym"]

            self.stdout.write(
                "\n"
                + "=" * 70
            )

            self.stdout.write(
                gym.name
            )

            self.stdout.write(
                f"Phone: "
                f"{item['phone'] or '(vide)'}"
            )

            self.stdout.write(
                f"Email: "
                f"{item['email'] or '(vide)'}"
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
                    "OPENING HOURS:"
                )

                self.stdout.write(
                    data[
                        "opening_hours"
                    ]
                    or "(vide)"
                )

                self.stdout.write(
                    "\nDESCRIPTION:"
                )

                self.stdout.write(
                    data[
                        "description"
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
                gym = item["gym"]

                gym.phone = item["phone"]
                gym.email = item["email"]

                gym.save(
                    update_fields=[
                        "phone",
                        "email",
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

                    translation.description = (
                        data[
                            "description"
                        ]
                    )

                    translation.opening_hours = (
                        data[
                            "opening_hours"
                        ]
                    )

                    translation.save(
                        update_fields=[
                            "description",
                            "opening_hours",
                        ]
                    )

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Gyms restructurés."
            )
        )