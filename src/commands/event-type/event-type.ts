import Discord from "discord.js";
import { SlashCommand } from "@classes/default/SlashCommand";
import { eventTypeCreateSubcommand } from "./event-type create";
import { eventTypeDeleteSubcommand } from "./event-type delete";

export default new SlashCommand()
  .setSlashCommandBuilder(
    new Discord.SlashCommandBuilder()
      .setName("event-type")
      .setDescription("Управление типами ивентов.")
  )
  .addSubCommand(eventTypeCreateSubcommand)
  .addSubCommand(eventTypeDeleteSubcommand);
