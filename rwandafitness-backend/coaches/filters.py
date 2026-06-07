import django_filters
from .models import CoachProfile


class CoachFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")
    specialty = django_filters.CharFilter(field_name="specialty", lookup_expr="iexact")
    min_price = django_filters.NumberFilter(field_name="price_per_session", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price_per_session", lookup_expr="lte")

    class Meta:
        model = CoachProfile
        fields = ["city", "specialty"]