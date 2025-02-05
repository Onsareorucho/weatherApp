from django.shortcuts import render
import requests
from .models import City

# Create your views here.

def index(request):
    url = 'http://api.openweathermap.org/data/2.5/weather?q=las%20vegas&units=imperial&appid=f6683328b3cd5829e9560bd91753a2b5'
    cities  = City.objects.all()
    
    city_weather = requests.get(url.format(city)).json()
    
    print(city_weather)
    
    weather = {
        'city': city,
        'temperature': city_weather['main']['temp'],
        'description': city_weather['weather'][0]['description'],
        'icon': city_weather['weather'][0]['icon']
    }
    
    context = {'weather': weather}
    
    return render(request, 'weather/index.html', context)
