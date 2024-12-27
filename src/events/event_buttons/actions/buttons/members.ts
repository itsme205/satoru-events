import { TSendError } from "@classes/default/SlashCommand";
import embeds from "@modules/embeds";
import { StringsList } from "@modules/list";
import Event from "@modules/mongodb/models/Event";
import Discord from "discord.js";

export default {
  execute: async (
    interaction: Discord.ButtonInteraction,
    throwError: TSendError
  ) => {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) return;
    const eventId = interaction.customId.split("_").at(-1);

    let eventData = await Event.findOne({ _id: eventId });
    if (!eventData) return throwError("Ошибка", "Не удалось найти ивент.");

    if (Object.keys(eventData.members ?? {}).length === 0)
      return throwError("Ошибка", "Список пользователей пуст.");

    const list = new StringsList(interaction, {
      ephemeralReply: true,
      collector: {
        time: 60_000 * 5,
      },
      embed: embeds.default("no-content"),
      startPage: 0,
      stringJoiner: "\n",
      elementsOnPage: 10,
      strings: Object.keys(eventData?.members ?? {})
        .sort(
          (a, b) =>
            (eventData?.members ?? {})[a].progress -
            (eventData?.members ?? {})[b].progress
        )
        .map(
          (id) =>
            `<@${id}> - **${(eventData?.members ?? {})[id].progress} мин.**`
        ),
    });

    list.showList();
  },
};
