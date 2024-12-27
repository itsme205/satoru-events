import Discord from "discord.js";
import { SlashCommand } from "@classes/default/SlashCommand";
import { fetchMember, memberHasOneRole } from "@modules/utils";
import embeds from "@modules/embeds";
import { BotConfig } from "@config/config";
import { addEventBan } from "@modules/sqlite/services/queries";

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
    await interaction.deferReply();
    const reason = interaction.options.get("причина")?.value?.toString() ?? "-";
    let hours = parseInt(
      interaction.options.get("часы")?.value?.toString() ?? "NaN"
    );
    if (isNaN(hours)) return throwError("Ошибка", "Некорректный срок.");
    hours = Math.floor(hours);
    const target = await fetchMember(
      interaction.options.get("участник")?.value?.toString() ?? "-",
      interaction.guildId ?? "-"
    );
    if (!target) return throwError("Ошибка", "Участник покинул сервер.");

    let banInfo;
    try {
      if(hours === 0){
        await target.roles.remove(BotConfig.eventBanRoleId);
      }else{
        await target.roles.add(BotConfig.eventBanRoleId);
      }
      banInfo = await addEventBan(
        target.id,
        interaction.user.id,
        reason,
        hours
      );
    } catch (err) {
      console.log(err);
      return;
    }

    if (banInfo.removed) {
      interaction.editReply({
        embeds: [
          embeds.default(
            `<@${interaction.user.id}> снял запрет с <@${target.id}>.`
          ),
        ],
      });
    } else if (banInfo.extended) {
      interaction.editReply({
        embeds: [
          embeds.default(
            `<@${interaction.user.id}> продлил запрет для <@${target.id}> на участие в клозах на **${hours} час(-ов)**.`
          ),
        ],
      });
    } else {
      interaction.editReply({
        embeds: [
          embeds.default(
            `<@${interaction.user.id}> запретил <@${target.id}> участие в клозах на **${hours} час(-ов)**.`
          ),
        ],
      });
    }
  })
  .setSlashCommandBuilder(
    new Discord.SlashCommandBuilder()
      .setName("event-ban")
      .addUserOption((opt) =>
        opt
          .setName("участник")
          .setDescription("участник, которому будет запрещено участие")
          .setRequired(true)
      )
      .addNumberOption((opt) =>
        opt
          .setName("часы")
          .setDescription("часы запрета (0, чтобы снять)")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("причина")
          .setDescription("причина запрета")
          .setRequired(true)
      )
      .setDescription("Запретить пользователю участие в ивентах.")
  );
