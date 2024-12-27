import { TSendError } from "@classes/default/SlashCommand";
import { BotConfig } from "@config/config";
import { CooldownManager } from "@modules/cooldowns/classes/CooldownManager";
import embeds from "@modules/embeds";
import Event from "@modules/mongodb/models/Event";
import EventType from "@modules/mongodb/models/EventType";
import Discord from "discord.js";

const cooldowns = new CooldownManager();

export default {
  execute: async (
    interaction: Discord.ButtonInteraction,
    throwError: TSendError
  ) => {
    const eventId = interaction.customId.split("_").at(-1);
    if (cooldowns.isCooldowned(eventId?.toString() ?? ""))
      return throwError("Ошибка", "Подождите 5 минут перед повторным анонсом.");
    if (!interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    cooldowns.setCooldown(interaction.user.id, 60 * 5);

    const channel = interaction.guild.channels.cache.get(
      BotConfig.announceChannelId
    );
    if (!channel || !channel.isTextBased())
      return throwError("Ошибка", "Канал с аннонсами на найден или невалиден.");

    let eventData = await Event.findOne({ _id: eventId });
    if (!eventData) return throwError("Ошибка", "Не удалось найти ивент.");
    const eventType = await EventType.findOne({ _id: eventData.eventTypeId });
    if (!eventType) return throwError("Тип ивента не найден.");

    console.log(eventType.announceMessageCreateOptions)
    try {
      await channel.send(eventType.announceMessageCreateOptions);
    } catch (err) {
      console.log(err);
      cooldowns.setCooldown(interaction.user.id, 0);
      return throwError("Ошибка", "Не удалось отправить оповещение.");
    }

    interaction.editReply({
      embeds: [embeds.default("Оповещение отправлено.")],
    });
  },
};
