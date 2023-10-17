import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Command {
  @Prop({ required: true })
  command: string;

  @Prop({ required: true })
  description: string;
}

export const CommandModel = SchemaFactory.createForClass(Command);
