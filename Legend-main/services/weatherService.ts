export interface WeatherData {
  city: string;
  temp: string;
  description: string;
  icon: string;
}

const REGION_COORDINATES: Record<string, { lat: number, lon: number }> = {
  '서울': { lat: 37.5665, lon: 126.9780 },
  '부산': { lat: 35.1796, lon: 129.0756 },
  '대구': { lat: 35.8714, lon: 128.6014 },
  '인천': { lat: 37.4563, lon: 126.7052 },
  '광주': { lat: 35.1595, lon: 126.8526 },
  '대전': { lat: 36.3504, lon: 127.3845 },
  '울산': { lat: 35.5384, lon: 129.3114 },
  '제주': { lat: 33.4996, lon: 126.5312 }
};

const getFallbackWeather = (cityName: string): WeatherData => ({
  city: cityName,
  temp: '—',
  description: '정보 없음',
  icon: '🌡️'
});

export async function fetchWeatherByCity(cityName: string): Promise<WeatherData> {
  const coords = REGION_COORDINATES[cityName];
  if (!coords) return getFallbackWeather(cityName);

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`
    );
    
    if (!response.ok) throw new Error('Weather API failed');
    
    const data = await response.json();
    const code = data.current.weather_code;
    const { description, icon } = mapWeatherCode(code);

    return {
      city: cityName,
      temp: Math.round(data.current.temperature_2m).toString(),
      description,
      icon
    };
  } catch (error) {
    console.error(`Weather fetch error for ${cityName}:`, error);
    return getFallbackWeather(cityName);
  }
}

function mapWeatherCode(code: number): { description: string, icon: string } {
  // 0 -> 맑음
  if (code === 0) return { description: '맑음', icon: '☀️' };
  
  // 1,2,3,45,48 -> 흐림
  if ([1, 2, 3, 45, 48].includes(code)) return { description: '흐림', icon: '☁️' };
  
  // 51,53,55,61,63,65,80,81,82 -> 비
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { description: '비', icon: '🌧️' };
  
  // 71,73,75 -> 눈
  if ([71, 73, 75].includes(code)) return { description: '눈', icon: '❄️' };
  
  // 그 외 -> 흐림
  return { description: '흐림', icon: '☁️' };
}

export const REGIONS = Object.keys(REGION_COORDINATES);
