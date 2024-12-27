import Discord from "discord.js";
import { SlashCommand } from "@classes/default/SlashCommand";
import { memberHasOneRole } from "@modules/utils";
import { BotConfig } from "@config/config";
import EventType from "@modules/mongodb/models/EventType";
import Event from "@modules/mongodb/models/Event";
import { messages } from "@config/messages";

export default new SlashCommand()
  .setExecute(async (interaction, throwError) => {
    if (
      !(interaction.member instanceof Discord.GuildMember) ||
      (!memberHasOneRole(interaction.member, [
        ...BotConfig.roleIds.eventAdminRoleId,
        ...BotConfig.roleIds.eventerRoleId,
      ]) &&
        !interaction.member.permissions.has("Administrator"))
    )
      return throwError("Ошибка", "У вас нету прав на это.");

    await interaction.deferReply({ ephemeral: true });
    const eventId = interaction.options.get("ивент")?.value;
    let eventData = await Event.findOne({ _id: eventId });
    if (!eventData) return throwError("Ошибка", "Ивент не найден.");

    const eventType = await EventType.findOne({ _id: eventData.eventTypeId });
    if (!eventType) return throwError("Ошибка", "Тип ивента не найден.");

    const msgOptions = messages.eventManage(eventData);
    return interaction.editReply({
      content: msgOptions.content,
      components: msgOptions.components,
      embeds: msgOptions.embeds,
    });
  })
  .setSlashCommandBuilder(
    new Discord.SlashCommandBuilder()
      .setName("event-panel")
      .addStringOption((opt) =>
        opt
          .setName("ивент")
          .setDescription("ивент, который был создан")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .setDescription("Открыть меню управление ивента.")
  );
