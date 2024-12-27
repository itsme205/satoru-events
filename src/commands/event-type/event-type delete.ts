import { SlashSubCommand } from "@classes/default/SlashSubCommand";
import embeds from "@modules/embeds";
import EventType from "@modules/mongodb/models/EventType";
import { collectButtonAccept, getMemberRank } from "@modules/utils";
import Discord, { SlashCommandSubcommandBuilder } from "discord.js";

export const eventTypeDeleteSubcommand = new SlashSubCommand()
  .setExecute(async (interaction, throwError) => {
    if (!(interaction.member instanceof Discord.GuildMember)) return;
    if (
      getMemberRank(interaction.member) !== "admin" &&
      !interaction.member.permissions.has("Administrator")
    )
      return throwError(
        "Ошибка",
        "У вас недостаточно прав для использования данной команды."
      );

    await interaction.deferReply({ ephemeral: true });

    const eventTypeId =
      interaction.options.get("название")?.value?.toString() ?? "no-id";

    let eventType;
    try {
      eventType = await EventType.findOne({ _id: eventTypeId });
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Не удалось загрузить информацию");
    }

    if (!eventType)
      return throwError("Ошибка", "Ивента с таким названием не существует.");

    try {
      await EventType.deleteOne({
        _id: eventTypeId,
      });
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Не удалось удалить ивент.");
    }

    interaction.editReply({
      embeds: [embeds.default(`Ивент **${eventType.name}** был удален.`)],
    });
  })
  .setSlashSubCommandBuilder(
    new SlashCommandSubcommandBuilder()
      .setName("delete")
      .setDescription("Удалить тип ивента.")
      .addStringOption((opt) =>
        opt
          .setName("название")
          .setDescription("название ивента")
          .setRequired(true)
          .setAutocomplete(true)
      )
  );
