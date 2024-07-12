import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVarKeys } from '../config/env.vars';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class TimeConverter {
  constructor(
    @InjectPinoLogger() private logger: PinoLogger,
    private configService: ConfigService,
  ) {}

  convertHoursStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  isMinuteToRunCron(userTime: number, offset: number): boolean {
    const currentMinute = new Date().getHours() * 60 + new Date().getMinutes();
    const userTimeUtc =
      userTime - offset < 0 ? userTime - offset + 1440 : userTime - offset;
    this.logger.info({ currentMinute, userTimeUtc });
    return currentMinute === userTimeUtc;
  }

  async getUtcOffsetMinutesFromCoordinates(lat: number, lng: number) {
    const apiKey = this.configService.getOrThrow(EnvVarKeys.GOOGLE_API_KEY);
    const timestamp = Math.floor(Date.now() / 1000);
    const requestString = `https://maps.googleapis.com/maps/api/timezone/json?location=${+lat}%2C${+lng}&timestamp=${+timestamp}&key=${apiKey}`;

    try {
      const axiosResponse = await axios.get(requestString);
      const { rawOffset, dstOffset } = axiosResponse.data;
      return rawOffset / 60 + dstOffset / 60;
    } catch (err) {
      this.logger.error(err.message);
      throw new Error(err.message);
    }
  }
}
