import Discord from "discord.js";
import { SlashCommand } from "@classes/default/SlashCommand";
import embeds from "@modules/embeds";
import { fetchMember, memberHasOneRole } from "@modules/utils";
import { BotConfig } from "@config/config";
import Event from "@modules/mongodb/models/Event";

export default new SlashCommand()
  .setExecute(async (interaction, throwError) => {
    await interaction.deferReply({ ephemeral: true });
    if (
      !(interaction.member instanceof Discord.GuildMember) ||
      (!memberHasOneRole(interaction.member, [
        ...BotConfig.roleIds.eventAdminRoleId,
        ...BotConfig.roleIds.eventerRoleId,
      ]) &&
        !interaction.member.permissions.has("Administrator"))
    )
      return throwError("Ошибка", "У вас нету прав на это.");

    const target = await fetchMember(
      interaction.options.get("участник")?.value?.toString() ?? "",
      interaction.guildId?.toString() ?? ""
    );
    if (!target) return throwError("Ошибка", "Участник не найден.");

    if (
      !memberHasOneRole(interaction.member, [
        ...BotConfig.roleIds.eventAdminRoleId,
        ...BotConfig.roleIds.eventerRoleId,
      ]) &&
      !interaction.member.permissions.has("Administrator")
    )
      return throwError("Ошибка", "Это не ивентер.");

    const event = await Event.findOne({
      _id: interaction.options.get("ивент")?.value,
    });
    if (!event) return throwError("Ошибка", "Ивент не найден.");
    if (event.createdBy !== interaction.user.id)
      return throwError("Ошибка", "Это не ваш ивент.");

    try {
      await Event.findOneAndUpdate(
        { _id: event._id },
        { $set: { createdBy: target.id } }
      );
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Что-то пошло не так...");
    }

    interaction.editReply({
      embeds: [embeds.default(`<@${target.id}> получил ивент.`)],
    });
  })
  .setSlashCommandBuilder(
    new Discord.SlashCommandBuilder()
      .setName("event-transfer")
      .addStringOption((opt) =>
        opt
          .setName("ивент")
          .setDescription("ивент, который был создан")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addUserOption((opt) =>
        opt
          .setName("участник")
          .setDescription("новый ивентер")
          .setRequired(true)
      )
      .setDescription("Открыть меню управление ивента.")
  );
