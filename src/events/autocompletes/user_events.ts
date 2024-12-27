import Event from "@modules/mongodb/models/Event";
import EventType from "@modules/mongodb/models/EventType";
import type Discord from "discord.js";

export default {
  eventName: "interactionCreate",
  execute: async (interaction: Discord.Interaction) => {
    if (
      !interaction.isAutocomplete() ||
      (interaction.commandName !== "event-panel" &&
        interaction.commandName !== "event-transfer")
    )
      return;

    const events = await Event.find({ createdBy: interaction.user.id });
    const eventTypes = await EventType.find({});
    return interaction.respond(
      events.map((obj) => ({
        name:
          eventTypes.find((type) => type._id === obj.eventTypeId)?.name ??
          obj._id,
        value: obj._id,
      }))
    );
  },
};
