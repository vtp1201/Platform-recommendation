from django.urls import path

from . import views

urlpatterns = [
    path('recommend', views.RecommendJobView.as_view(), name='index'),
]