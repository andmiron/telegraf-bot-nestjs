import { SceneSessionData } from 'telegraf/typings/scenes';

export interface CustomSceneContext extends SceneSessionData {
  time: number;
  offset: number;
  chatId: number;
  latitude: number;
  longitude: number;
  timeInput: string;
}
