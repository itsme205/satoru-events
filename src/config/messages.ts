import embeds from "@modules/embeds";
import { IEvent } from "@modules/mongodb/models/Event";
import { wrapButtons } from "@modules/utils";
import Discord from "discord.js";

export const messages = {
  eventManage: (event: IEvent): Discord.MessageCreateOptions => {
    return {
      embeds: [
        embeds.default(
          `Ивент создал: <@${event.createdBy}>\n` +
            `Категория ивента: <#${event.parentId}>\n` +
            `Канал с правилами: <#${event.rulesChannelId}>\n` +
            `Канал управления: <#${event.manageChannelId}>\n` +
            `Статус: **${event.status}**\n` +
            `Количество участников (посещало канал): **${
              Object.keys(event.members ?? {}).length
            } шт.**`
        ),
      ],
      components: wrapButtons([
        new Discord.ButtonBuilder({
          label: event.status === "closed" ? "Открыть" : "Закрыть",
          customId: `eventManage_close_${event._id}`,
          style:
            event.status === "closed"
              ? Discord.ButtonStyle.Success
              : Discord.ButtonStyle.Danger,
        }),
        new Discord.ButtonBuilder({
          label: "Список участников",
          customId: `eventManage_members_${event._id}`,
          style: Discord.ButtonStyle.Secondary,
        }),
        new Discord.ButtonBuilder({
          label: "Анонсировать ивент",
          customId: `eventManage_announce_${event._id}`,
          style: Discord.ButtonStyle.Secondary,
        }),
        new Discord.ButtonBuilder({
          label: "Удалить",
          customId: `eventManage_delete_${event._id}`,
          style: Discord.ButtonStyle.Danger,
        }),
      ]),
    };
  },
};
