import EventType from "@modules/mongodb/models/EventType";
import type Discord from "discord.js";

export default {
  eventName: "interactionCreate",
  execute: async (interaction: Discord.Interaction) => {
    if (
      !interaction.isAutocomplete() ||
      (interaction.commandName !== "event-create" &&
        interaction.commandName !== "event-type") ||
      (interaction.options.getFocused(true).name != "тип" &&
        interaction.options.getFocused(true).name != "название")
    )
      return;

    const eventTypes = await EventType.find({});

    interaction.respond(
      eventTypes.map((preset) => ({
        name: preset.name,
        value: preset._id,
      }))
    );
  },
};
