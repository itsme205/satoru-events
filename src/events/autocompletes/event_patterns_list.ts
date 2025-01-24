import { eventChannelPatterns } from "@config/channelPatterns";
import type Discord from "discord.js";

export default {
  eventName: "interactionCreate",
  execute: async (interaction: Discord.Interaction) => {
    if (
      !interaction.isAutocomplete() ||
      interaction.commandName !== "event-create" ||
      interaction.options.getFocused(true).name != "паттерн"
    )
      return;

    interaction.respond(
      Object.keys(eventChannelPatterns).map((key) => {
        return {
          name: key,
          value: key,
        };
      })
    );
  },
};
