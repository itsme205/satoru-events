import { MessageCreateOptions } from "discord.js";
import Mongoose from "mongoose";

export interface IEventType extends Mongoose.Document {
  name: string;
  createdBy: string;
  createdAt: Date;
  rulesMessageCreateOptions: MessageCreateOptions;
  announceMessageCreateOptions: MessageCreateOptions;
  scheduledEvent?: {
    name: string;
    description: string;
    imageUrl?: string;
  };
}

const modelSchema = new Mongoose.Schema<IEventType>({
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true },
  rulesMessageCreateOptions: { type: {}, required: true },
  announceMessageCreateOptions: { type: {}, required: true },
  scheduledEvent: {
    type: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: { type: String, required: false },
    },
    required: false,
  },
});
export const EventType = Mongoose.model("event-types", modelSchema);

export default EventType;
