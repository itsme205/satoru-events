import Mongoose from "mongoose";

export interface IEvent extends Mongoose.Document {
  eventTypeId: string;
  createdBy: string;
  createdAt: Date;
  parentId: string;
  rulesChannelId: string;
  manageChannelId: string;
  status: "closed" | "opened";
  members?: { [key: string]: { progress: number } };
}

const modelSchema = new Mongoose.Schema<IEvent>({
  eventTypeId: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, required: true },
  parentId: { type: String, required: true },
  rulesChannelId: { type: String, required: true },
  manageChannelId: { type: String, required: true },
  status: { type: String, required: true },
  members: {
    type: {},
    required: true,
  },
});
export const Event = Mongoose.model("events", modelSchema);

export default Event;
