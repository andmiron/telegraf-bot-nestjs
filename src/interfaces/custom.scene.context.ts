import { Scenes } from 'telegraf';

interface MySceneSession extends Scenes.SceneSessionData {
  time: number;
  offset: number;
  chatId: number;
  latitude: number;
  longitude: number;
  timeInput: string;
}

export type CustomContext = Scenes.SceneContext<MySceneSession>;
