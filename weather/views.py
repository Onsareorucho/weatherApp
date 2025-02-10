import os
from django.http import JsonResponse
from django.shortcuts import render
import requests
from .models import City
import json
from django.views.decorators.csrf import csrf_exempt
import pika
from .processQueue import processQueue
from flask import Flask, request

from logging import getLogger
# Create your views here.
logger = getLogger(__name__)
def index(request):
    cities = City.objects.all()
    
    weather_data = []
    
    for city in cities:
        try:
            url = f'http://api.openweathermap.org/data/2.5/weather?q={city.name}&units=metric&appid=f6683328b3cd5829e9560bd91753a2b5'
            response = requests.get(url)
            response.raise_for_status()
            
            city_weather = response.json()
            
            weather = {
                'name': city.name,
                'temperature': round(city_weather['main']['temp'],3),
                'condition': city_weather['weather'][0]['description'],
                'humidity': city_weather['main']['humidity'],
                'wind_speed': round(city_weather['wind']['speed'] * 3.6,3), 
                'sunrise': city_weather['sys']['sunrise'],
                'sunset': city_weather['sys']['sunset']
            }
            weather_data.append(weather)
        except (requests.RequestException, KeyError) as e:
            print(f"Error fetching data for {city.name}: {str(e)}")
    
    return JsonResponse(weather_data, safe=False)
 
 
def search(request,city):
   weather_data = []
   try:
      url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid=f6683328b3cd5829e9560bd91753a2b5'
      response = requests.get(url)
      response.raise_for_status()
      
      city_weather = response.json()
      
      weather = {
            'name': city,
            'temperature': round(city_weather['main']['temp'],3),
            'condition': city_weather['weather'][0]['description'],
            'humidity': city_weather['main']['humidity'],
            'wind_speed': round(city_weather['wind']['speed'] * 3.6,3), 
            'sunrise': city_weather['sys']['sunrise'],
            'sunset': city_weather['sys']['sunset']
      }
      weather_data.append(weather)
   except (requests.RequestException, KeyError) as e:
      print(f"Error fetching data for {city.name}: {str(e)}")
    
   return JsonResponse(weather_data, safe=False)

@csrf_exempt
def shareWeather(request):
   data = json.loads(request.body)
   contact_method = data['type']
   recepient = data['value']
   weather_info = data['weather']
   message = prepareWeatherReport(weather_info)+"#_#" + recepient
   if contact_method == 'phone':
      #todo, add to queue
      # sendMessageAsSMS(message,recepient)
      logger.debug('calling demo_task.')
      addToQueue(message, 'sms')
      processQueue(repeat=10)
      
   else:
      sendMessageAsEmail(message,recepient)
   
   return JsonResponse(message, safe=False)

def sendMessageAsEmail(message,recepient):
   return message



 
def prepareWeatherReport(weather):
   message = (
        f"The weather in {weather['name']} today is: {weather['condition']}\n"
        f"The temperature is {weather['temperature']}°C \n"
        f"Humidity is at {weather['humidity']}%\n"
        f"Wind speed is at {weather['wind_speed']} m/s\n"
        "Have a good day!\n"
    )
   
   return message

#rabbit MQ handling, establish a connection
def addToQueue(message, type): 
   connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
   channel = connection.channel()
   #create a queue called sendmessage
   channel.queue_declare(queue= type)
   channel.basic_publish(exchange='',
                        routing_key=type,
                        body=message)
   print(f" [x] Sent {message}")
