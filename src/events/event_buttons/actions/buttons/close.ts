import { TSendError } from "@classes/default/SlashCommand";
import { messages } from "@config/messages";
import { CooldownManager } from "@modules/cooldowns/classes/CooldownManager";
import embeds from "@modules/embeds";
import Event from "@modules/mongodb/models/Event";
import { makeMessageEditOptions } from "@modules/utils";
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

    const parent = interaction.guild?.channels.cache.get(eventData.parentId);
    if (!parent)
      return throwError(
        "Ошибка",
        "Не удалось найти категорию. Повторите попытку позже."
      );
    if (parent.type !== Discord.ChannelType.GuildCategory)
      return throwError("Ошибка", "Категория невалидна.");

    const manageChannel = interaction.guild.channels.cache.get(
      eventData.manageChannelId
    );
    if (
      manageChannel &&
      manageChannel.type === Discord.ChannelType.GuildText &&
      manageChannel
        .permissionsFor(interaction.guild.roles.everyone.id)
        ?.serialize().ViewChannel
    ) {
      manageChannel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { ViewChannel: false }
      );
    }

    const channels = interaction.guild.channels.cache.filter(
      (ch) => ch.parentId === parent.id && ch.id !== eventData?.manageChannelId
    );
    if (eventData.status === "closed") {
      parent.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
        ViewChannel: true,
        Connect: null,
        SendMessages: null,
      });
      channels.forEach((ch) => {
        if (ch.isTextBased()) return;

        ch.permissionOverwrites.edit(
          interaction.guild?.roles.everyone.id ?? "",
          {
            ViewChannel: true,
            Connect: null,
            SendMessages: null,
          }
        );
      });
    } else {
      parent.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
        ViewChannel: false,
        Connect: null,
        SendMessages: null,
      });

      channels.forEach((ch) => {
        if (ch.isTextBased()) return;

        ch.permissionOverwrites.edit(
          interaction.guild?.roles.everyone.id ?? "",
          {
            ViewChannel: false,
            Connect: null,
            SendMessages: null,
          }
        );
      });
    }

    try {
      await Event.findOneAndUpdate(
        { _id: eventData._id },
        {
          $set: { status: eventData.status === "closed" ? "opened" : "closed" },
        }
      );
    } catch (err) {
      console.log(err);
      return throwError(
        "Ошибка",
        "Не удалось сохранить изменения в базе данных."
      );
    }

    interaction.editReply({
      embeds: [
        embeds.default(
          eventData.status === "closed"
            ? "Вы **открыли** ивент для обычных пользователей."
            : "Вы **закрыли** ивент для обычных пользователей."
        ),
      ],
    });

    eventData = await Event.findOne({ _id: eventId });

    if (eventData && interaction.message)
      interaction.message
        .edit(makeMessageEditOptions(messages.eventManage(eventData)))
        .catch((err) => console.log(err));
  },
};
