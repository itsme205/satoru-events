import Discord, {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
import { SlashCommand } from "@classes/default/SlashCommand";
import EventType from "@modules/mongodb/models/EventType";
import { BotConfig } from "@config/config";
import Event from "@modules/mongodb/models/Event";
import embeds from "@modules/embeds";
import { messages } from "@config/messages";
import { memberHasOneRole } from "@modules/utils";
import { eventChannelPatterns } from "@config/channelPatterns";

export default new SlashCommand()
  .setExecute(async (interaction, throwError) => {
    if (!interaction.guild) return;
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

    if ((await Event.count({ createdBy: interaction.user.id })) >= 5)
      return throwError("Ошибка", "Нельзя создать больше 5 ивентов.");

    const channelsPattern =
      eventChannelPatterns[
        (interaction.options.get("паттерн")?.value ?? "").toString()
      ];
    if (!channelsPattern)
      return throwError("Ошибка", "Паттерн каналов не найден.");

    const eventTypeId =
      interaction.options.get("тип")?.value?.toString() ?? "-1";
    const eventType = await EventType.findOne({ _id: eventTypeId });
    if (!eventType) return throwError("Ошибка", "Данный тип ивента не найден.");

    let parent;
    try {
      parent = await interaction.guild.channels.create({
        name: eventType.name,
        type: Discord.ChannelType.GuildCategory,
        permissionOverwrites: [...BotConfig.categoryDefaultPermissions],
      });
      parent.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
        ViewChannel: false,
      });
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Не удалось создать категорию.");
    }

    [
      ...BotConfig.roleIds.eventAdminRoleId,
      ...BotConfig.roleIds.eventerRoleId,
    ].forEach((id) => {
      parent.permissionOverwrites.edit(id, {
        ViewChannel: true,
        SendMessages: true,
        MoveMembers: true,
        Connect: true,
        ManageChannels: true,
        ManageMessages: true,
        ManageWebhooks: true,
      });
    });

    let manageChannel;
    let rulesChannel;
    let voiceChannel: Discord.VoiceBasedChannel | undefined;
    try {
      manageChannel = await interaction.guild.channels.create({
        name: "управление",
        parent: parent.id,
        type: Discord.ChannelType.GuildText,
      });
      await manageChannel.lockPermissions();
      await manageChannel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        {
          ViewChannel: false,
        }
      );

      rulesChannel = await interaction.guild.channels.create({
        name: "правила",
        parent: parent.id,
        type: Discord.ChannelType.GuildText,
      });
      await rulesChannel.lockPermissions();
      await rulesChannel.permissionOverwrites.edit(
        interaction.guild.roles.everyone.id,
        { SendMessages: false }
      );

      for (let i in channelsPattern) {
        let channel;
        try {
          channel = await interaction.guild.channels.create({
            ...channelsPattern[i],
            ...{
              parent: parent.id,
            },
          });
          await channel.lockPermissions();
        } catch (err) {
          console.log(err);
        }

        if (!voiceChannel && channel && channel.isVoiceBased()) {
          voiceChannel = channel;
        }
      }
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Не удалось создать каналы.");
    }
    rulesChannel
      ?.send(eventType.rulesMessageCreateOptions)
      .catch((err) => console.log(err));

    let document;
    try {
      document = new Event({
        eventTypeId: eventTypeId,
        createdBy: interaction.user.id,
        createdAt: new Date(),
        parentId: parent.id,
        rulesChannelId: rulesChannel?.id,
        manageChannelId: manageChannel?.id,
        members: {},
        status: "closed",
      });
      await document.save();
    } catch (err) {
      console.log(err);
      return throwError("Ошибка", "Не удалось сохранить ивент.");
    }

    const scheduledEventStartDate = new Date();
    scheduledEventStartDate.setMinutes(
      scheduledEventStartDate.getMinutes() +
        parseInt(interaction.options.get("минуты")?.value?.toString() ?? "5")
    );
    if (eventType.scheduledEvent && voiceChannel)
      interaction.guild.scheduledEvents
        .create({
          name: eventType.scheduledEvent.name,
          scheduledStartTime: scheduledEventStartDate,
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          entityType: GuildScheduledEventEntityType.Voice,
          description: eventType.scheduledEvent.description,
          channel: voiceChannel.id,
          image: eventType.scheduledEvent.imageUrl,
        })
        .catch((err) => console.log(err));

    manageChannel
      .send(messages.eventManage(document))
      .catch((err) => console.log(err));

    interaction.editReply({
      embeds: [embeds.default("Вы успешно создали ивент.")],
    });
  })
  .setSlashCommandBuilder(
    new Discord.SlashCommandBuilder()
      .setName("event-create")
      .addStringOption((opt) =>
        opt
          .setName("тип")
          .setDescription("тип ивента, который вы хотите использовать")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("паттерн")
          .setDescription("паттерн, который вы хотите использовать")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addNumberOption((opt) =>
        opt
          .setName("минуты")
          .setDescription("через сколько минут начнется ивент?")
          .setRequired(false)
      )
      .setDescription("Создать ивент.")
  );
