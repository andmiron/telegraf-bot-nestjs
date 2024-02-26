import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  chatId: number;

  @Prop()
  timeInput: string;

  @Prop({ required: true })
  time: number;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  offset: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
