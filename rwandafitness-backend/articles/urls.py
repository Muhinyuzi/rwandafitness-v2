from django.urls import path

from .views import (
    ArticleListAPIView,
    ArticleDetailAPIView,
    FeaturedArticleListAPIView,
)

urlpatterns = [
    path("", ArticleListAPIView.as_view(), name="article-list"),
    path("featured/", FeaturedArticleListAPIView.as_view(), name="article-featured"),
    path("<slug:slug>/", ArticleDetailAPIView.as_view(), name="article-detail"),
]