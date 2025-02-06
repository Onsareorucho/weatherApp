"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, AlertCircle, ThermometerSun, Sun, Moon, Mail, Phone, Share2 } from 'lucide-react';

const WeatherApp = () => {
  const [searchCity, setSearchCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  // Define staticCities inside the component
  const staticCities = [
    { name: 'London', temp: 18, humidity: 75, windSpeed: 12, condition: 'Cloudy' },
    { name: 'New York', temp: 22, humidity: 65, windSpeed: 8, condition: 'Sunny' },
    { name: 'Tokyo', temp: 25, humidity: 70, windSpeed: 10, condition: 'Clear' },
  ];

  useEffect(() => {
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkModePreference);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = async (e) => {
    e.preventDefault();
    setShareLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Weather report sent to ${contactValue} via ${contactMethod}`);
      setIsShareModalOpen(false);
      setContactValue('');
    } catch (err) {
      alert('Failed to share weather report. Please try again.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Add your search logic here
  };

  const getCurrentLocation = () => {
    // Add your location logic here
  };

  const ShareModal = () => (
    isShareModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-lg max-w-md w-full`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Share Weather Report</h2>
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleShareReport} className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="email"
                  checked={contactMethod === 'email'}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="form-radio"
                />
                <span>Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="phone"
                  checked={contactMethod === 'phone'}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="form-radio"
                />
                <span>Phone</span>
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="contact" className="block">
                {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                id="contact"
                type={contactMethod === 'email' ? 'email' : 'tel'}
                placeholder={contactMethod === 'email' ? 'Enter email' : 'Enter phone number'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                className={`w-full p-2 rounded border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={shareLoading}
              className={`w-full p-2 rounded ${
                isDarkMode ? 
                'bg-blue-600 hover:bg-blue-700' : 
                'bg-sky-500 hover:bg-sky-600'
              } text-white disabled:opacity-50`}
            >
              {shareLoading ? 'Sending...' : 'Share Report'}
            </button>
          </form>
        </div>
      </div>
    )
  );

  const WeatherCard = ({ data, isStatic }) => (
    <div className="w-full">
      <div className={`rounded-lg overflow-hidden ${
        isDarkMode ? 
        'bg-gray-800 border-gray-700 text-white' : 
        'bg-sky-50 border-sky-200'
      } shadow-lg hover:shadow-xl transition-shadow duration-300 border`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-sky-100'}`}>
          <div className={`flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-sky-800'}`}>
            <div className="flex items-center gap-2">
              <Sun className={`h-6 w-6 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-400'}`} />
              <h3 className="text-lg font-bold">{data.city || data.name}</h3>
            </div>
            {!isStatic && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className={`p-2 rounded-md ${
                  isDarkMode ? 
                  'hover:bg-gray-700 text-white' : 
                  'hover:bg-sky-100'
                }`}
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {['Temperature', 'Humidity', 'Wind Speed', 'Condition'].map((metric, index) => (
              <div
                key={metric}
                className={`text-center p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-sky-100'
                }`}
              >
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-sky-600'}`}>
                  {metric}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-sky-800'}`}>
                  {index === 0 ? `${data.temp}°C` :
                   index === 1 ? `${data.humidity}%` :
                   index === 2 ? `${data.windSpeed} km/h` :
                   data.condition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 
      'bg-gray-900' : 
      'bg-gradient-to-b from-sky-100 to-sky-200'
    } p-4`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2">
            <h1 className={`text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-sky-800'
            }`}>Weather Dashboard</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-sky-600'}>
              Check weather conditions worldwide
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-md ${
              isDarkMode ? 'text-white hover:bg-gray-800' : 'hover:bg-sky-100'
            }`}
          >
            {isDarkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </button>
        </div>

        <div className={`rounded-lg p-6 ${
          isDarkMode ? 
          'bg-gray-800/80 border-gray-700' : 
          'bg-white/80 backdrop-blur-sm border-sky-200'
        } border`}>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter city name"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className={`flex-1 p-2 rounded border ${
                isDarkMode ? 
                'bg-gray-700 border-gray-600 text-white' : 
                'border-sky-200'
              }`}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                isDarkMode ? 
                'bg-blue-600 hover:bg-blue-700' : 
                'bg-sky-500 hover:bg-sky-600'
              } text-white disabled:opacity-50`}
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded border ${
                isDarkMode ? 
                'border-blue-500 text-blue-500 hover:bg-gray-700' : 
                'border-sky-500 text-sky-500 hover:bg-sky-50'
              } disabled:opacity-50`}
            >
              <MapPin className="h-4 w-4" />
              Current Location
            </button>
          </form>
        </div>

        {error && (
          <div className={`p-4 rounded flex items-center gap-2 ${
            isDarkMode ? 'bg-red-900/50 border-red-800' : 'bg-red-50 border-red-200'
          } border`}>
            <AlertCircle className="h-4 w-4" />
            <p className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {weatherData && weatherData.map((data, index) => (
            <WeatherCard key={index} data={data} />
          ))}

          <div>
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-sky-800'
            }`}>
              <ThermometerSun className={`h-6 w-6 ${
                isDarkMode ? 'text-yellow-300' : 'text-yellow-400'
              }`} />
              Major Cities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staticCities.map((city) => (
                <WeatherCard
                  key={city.name}
                  data={city}
                  isStatic
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ShareModal />
    </div>
  );
};

export default WeatherApp;