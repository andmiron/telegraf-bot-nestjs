import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVarKeys } from '../common/env.vars';

@Injectable()
export class TimeConverter {
  constructor(private configService: ConfigService) {}

  convertHoursStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  async getUtcOffsetMinutesFromCoordinates(lat: number, lng: number) {
    const apiKey = this.configService.getOrThrow(EnvVarKeys.GOOGLE_API_KEY);
    const timestamp = Math.floor(Date.now() / 1000);

    const requestString = `https://maps.googleapis.com/maps/api/timezone/json?location=${+lat}%2C${+lng}&timestamp=${+timestamp}&key=${apiKey}`;
    const axiosResponse = await axios.get(requestString);
    const { rawOffset, dstOffset } = axiosResponse.data;

    return rawOffset / 60 + dstOffset / 60;
  }
}
