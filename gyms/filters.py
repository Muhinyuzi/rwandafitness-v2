import django_filters
from .models import Gym


class GymFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name="city", lookup_expr="icontains")

    class Meta:
        model = Gym
        fields = ["city"]