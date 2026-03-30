"use client";

import { useEffect, useState } from "react";
import { useGameSync } from "@/hooks/use-game-sync";
import { SERVICES } from "@/lib/gamification";
import { API_PREFIXES } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Droplets, Wind, Thermometer, RefreshCw } from "lucide-react";

const service = SERVICES.find((s) => s.id === "mausam_chakra")!;

interface WeatherData {
  location?: string;
  temp?: number;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
  description?: string;
  icon?: string;
  forecast?: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
  }>;
}

export default function MausamChakraPage() {
  const { earnXP } = useGameSync();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend
        const res = await fetch(`${API_PREFIXES.mausamChakra}/weather/current?lat=29.0&lon=77.0`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        } else {
          // Use mock data for demo
          setWeather({
            location: "Karnal, Haryana",
            temp: 28,
            feels_like: 30,
            humidity: 65,
            wind_speed: 12,
            description: "Partly Cloudy",
            icon: "🌤️",
            forecast: [
              { date: "Tomorrow", temp_max: 30, temp_min: 22, description: "Sunny" },
              { date: "Day 3", temp_max: 29, temp_min: 21, description: "Cloudy" },
              { date: "Day 4", temp_max: 27, temp_min: 20, description: "Light Rain" },
            ],
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        // Use mock data for demo
        setWeather({
          location: "Karnal, Haryana",
          temp: 28,
          feels_like: 30,
          humidity: 65,
          wind_speed: 12,
          description: "Partly Cloudy",
          icon: "🌤️",
          forecast: [
            { date: "Tomorrow", temp_max: 30, temp_min: 22, description: "Sunny" },
            { date: "Day 3", temp_max: 29, temp_min: 21, description: "Cloudy" },
            { date: "Day 4", temp_max: 27, temp_min: 20, description: "Light Rain" },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // Award XP on first view
  useEffect(() => {
    if (!loading && !xpAwarded && weather) {
      earnXP("weather_check", { service: "mausam_chakra" });
      setXpAwarded(true);
    }
  }, [loading, xpAwarded, weather, earnXP]);

  return (
    <div className="space-y-4">
      {/* Service header */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${service.color}20` }}
        >
          {service.icon}
        </div>
        <div className="flex-grow">
          <h1 className="text-xl font-bold text-gray-800">{service.name}</h1>
          <p className="text-gray-500 text-sm">{service.description}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          FREE
        </Badge>
      </div>

      {/* XP notification */}
      {xpAwarded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-medium">+5 XP earned for checking weather!</span>
        </div>
      )}

      {/* Weather content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          <p>Loading weather...</p>
        </div>
      ) : weather ? (
        <>
          {/* Current weather card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">📍 {weather.location}</p>
                  <p className="text-4xl font-bold">{weather.temp}°C</p>
                  <p className="text-blue-100 text-sm">Feels like {weather.feels_like}°C</p>
                </div>
                <div className="text-6xl">{weather.icon}</div>
              </div>
              <p className="text-lg text-blue-50">{weather.description}</p>
            </CardContent>
          </Card>

          {/* Weather details */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-xl font-bold text-gray-800">{weather.humidity}%</p>
                <p className="text-xs text-gray-500">Humidity</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Wind className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                <p className="text-xl font-bold text-gray-800">{weather.wind_speed}</p>
                <p className="text-xs text-gray-500">km/h Wind</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-xl font-bold text-gray-800">{weather.feels_like}°</p>
                <p className="text-xs text-gray-500">Feels Like</p>
              </CardContent>
            </Card>
          </div>

          {/* Forecast */}
          {weather.forecast && weather.forecast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">3-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weather.forecast.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{day.date}</p>
                        <p className="text-sm text-gray-500">{day.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold text-gray-800">{day.temp_max}°</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-gray-500">{day.temp_min}°</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advisory */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Farm Advisory</p>
                <p className="text-yellow-700">
                  Good conditions for field work. Consider irrigation if no rain is expected in the next 3 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Cloud className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Weather data unavailable</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
