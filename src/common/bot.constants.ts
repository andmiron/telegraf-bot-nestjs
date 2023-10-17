export enum BotCommandName {
  START = 'start',
  WEATHER = 'weather',
  CHECK = 'check',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  UPDATE = 'update',
}

export enum BotCommandDescription {
  START = 'Start the bot',
  WEATHER = 'Get current weather',
  CHECK = 'Check subscription status',
  SUBSCRIBE = 'Get daily weather updates',
  UNSUBSCRIBE = 'Stop getting weather updates',
  UPDATE = 'Update subscription data',
}

export enum BotResponse {
  START = 'I will help you be aware of the weather every day.\nTo find available commands use bot menu or keyboard below 📲',
  CHECK = 'Next weather update coming at: ⌚',
  NO_SUBSCRIPTION = 'You have not subscribed yet.\nTo subscribe use /subscribe',
  SHARE_LOCATION = 'Share your location with button below 📲',
  SHARE_BUTTON = 'Send my location 📍',
  WEATHER_FETCH_ERROR = 'An error occurred.\nTry again later with /subscribe',
  ALREADY_SUBSCRIBE = `You already have subscription.\nTo update data use /update`,
  UNSUBSCRIBE = 'Your subscription has been declined 🔕',
  TIME_INPUT = 'Enter desired time ⌛ in HH:MM format\nor use keyboard below ⬇️\n(or /cancel to exit)',
  SUBMIT_SUBSCRIPTION = `Good. Submit to subscribe ⬇️\n(or /cancel to exit)`,
  SUBSCRIBED = `Cool! Your subscription is set at: ✔️`,
  SCENE_EXIT = 'Exited the process 🤚',
  SUBSCRIBE_BUTTON = 'Subscribe 🔔',
}

export enum ScenesId {
  WEATHER_SCENE = 'weatherScene',
  SUBSCRIBE_SCENE = 'subscribeScene',
}

export enum WeatherAPI {
  BASE_URL = 'https://api.openweathermap.org/',
}

export const WeatherGroup: Record<string, string> = {
  Thunderstorm: '⚡️',
  Clouds: '☁️',
  Clear: '☀️',
  Atmosphere: '🌈',
  Snow: '❄️',
  Rain: '🌧',
  Drizzle: '🥶',
};

export interface WeatherDto {
  cityName: string;
  weatherDescription: string;
  weatherGroup: string;
  minTemp: number;
  maxTemp: number;
  feels_like: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  sunset: string;
  sunrise: string;
}

export const TimeTrigger = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const TimeZone = 'Etc/Universal';
