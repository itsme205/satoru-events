import { TSendError } from "@classes/default/SlashCommand";
import embeds from "@modules/embeds";
import Event from "@modules/mongodb/models/Event";
import { collectButtonAccept } from "@modules/utils";
import Discord from "discord.js";

export default {
  execute: async (
    interaction: Discord.ButtonInteraction,
    throwError: TSendError
  ) => {
    if (!interaction.guild) return;
    const eventId = interaction.customId.split("_").at(-1);
    await interaction.deferReply({ ephemeral: true });

    let eventData = await Event.findOne({ _id: eventId });
    if (!eventData) return throwError("Ошибка", "Не удалось найти ивент.");

    const acception = await collectButtonAccept(
      interaction,
      [embeds.default("Вы точно хотите удалить ивент?")],
      true
    );
    if (!acception.accepted)
      return interaction.editReply({
        embeds: [
          embeds
            .default("ладно")
            .setImage(
              "https://img-webcalypt.ru/storage/memes/6709/202411/AQP4s8F1DpOXLkYqxjqGaawhvSjbUX0VAYinW5jGS63FiJVtwGpo6zuqfMWbt3eFuVYov0P7iRJDfv3nnf3bePnJGt3YdiG9zdXalLh0YFkqkTVHeH7XrL4UZo6DLhTh.jpeg"
            ),
        ],
        components: [],
      });

    const parent = interaction.guild.channels.cache.get(eventData.parentId);
    const channels = interaction.guild.channels.cache.filter(
      (ch) => ch.parentId === eventData.parentId
    );
    channels.forEach((ch) =>
      ch.delete(`Event deleted by ${interaction.user.id}`)
    );
    parent
      ?.delete(`Event deleted by ${interaction.user.id}`)
      .catch((err) => console.log(err));

    try {
      await Event.deleteOne({ _id: eventData._id });
    } catch (err) {
      console.log(err);
    }

    interaction.editReply({
      embeds: [embeds.default("Ивент был успешно удален.")],
    });
  },
};
