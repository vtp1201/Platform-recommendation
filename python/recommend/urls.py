from django.urls import path

from . import views

urlpatterns = [
    # path('recommend', views.post),
    path("update-recommend", views.update),
    path("add-files", views.addNewFile)
]