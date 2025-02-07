from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('city/<str:city>', views.search),
    path('share', views.shareWeather),
]