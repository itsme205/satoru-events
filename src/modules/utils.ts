import Discord from "discord.js";
import { v4 } from "uuid";
import embeds from "./embeds";
import { BotConfig } from "@config/config";
import axios from "axios";

export function memberHasOneRole(
  member: Discord.GuildMember,
  roles: string[]
): boolean {
  let result = false;
  for (let i in roles) {
    if (member.roles.cache.has(roles[i])) {
      result = true;
      break;
    }
  }

  return result;
}
export async function collectButtonAccept(
  interaction: Discord.Interaction,
  messageEmbeds: Discord.EmbedBuilder[],
  ephemeral: boolean = true
): Promise<{
  accepted: boolean;
  collectedInteraction: Discord.ButtonInteraction;
}> {
  return await new Promise(async (resolve, reject) => {
    if (!interaction.isButton() && !interaction.isAnySelectMenu()) {
      reject("Invalid interaction type.");
      return;
    }
    const reply = await interaction[
      interaction.replied || interaction.deferred ? "editReply" : "reply"
    ]({
      ephemeral,
      fetchReply: true,
      embeds: messageEmbeds,
      components: [
        new Discord.ActionRowBuilder<Discord.ButtonBuilder>().setComponents([
          new Discord.ButtonBuilder({
            label: "Да",
            custom_id: "collectAccept_yes",
            style: Discord.ButtonStyle.Success,
          }),
          new Discord.ButtonBuilder({
            label: "Нет",
            custom_id: "collectAccept_no",
            style: Discord.ButtonStyle.Danger,
          }),
        ]),
      ],
    });

    const collector = reply.createMessageComponentCollector({
      time: 60_000 * 5,
      filter: (collectedInteraction) =>
        collectedInteraction.user.id === interaction.user.id,
    });
    collector.on("collect", (collectedInteraction) => {
      if (!collectedInteraction.isButton()) return;

      if (collectedInteraction.customId === "collectAccept_yes") {
        resolve({ accepted: true, collectedInteraction });
      } else {
        resolve({ accepted: false, collectedInteraction });
      }
      collector.stop("success");
    });
    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        reject("The acception denied.");
        await interaction.editReply({
          components: [],
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("DarkNavy")
              .setDescription("Время ожидания вышло."),
          ],
        });
        return;
      }
    });
  });
}
export function wrapButtons(
  buttons: Discord.ButtonBuilder[]
): Discord.ActionRowBuilder<Discord.ButtonBuilder>[] {
  var rows: Discord.ActionRowBuilder<Discord.ButtonBuilder>[] = [
    new Discord.ActionRowBuilder<Discord.ButtonBuilder>(),
  ];
  for (let i in buttons) {
    if ((rows.at(-1)?.components.length || 0) >= 5) {
      rows.push(new Discord.ActionRowBuilder<Discord.ButtonBuilder>());
    }

    rows.at(-1)?.addComponents(buttons[i]);
  }
  return rows;
}
export async function collectCommandAccept(
  interaction: Discord.CommandInteraction,
  messageEmbeds: Discord.EmbedBuilder[],
  ephemeral: boolean = true
): Promise<{
  accepted: boolean;
  collectedInteraction: Discord.ButtonInteraction;
}> {
  return await new Promise(async (resolve, reject) => {
    const reply = await interaction[
      interaction.replied || interaction.deferred ? "editReply" : "reply"
    ]({
      ephemeral,
      fetchReply: true,
      embeds: messageEmbeds,
      components: [
        new Discord.ActionRowBuilder<Discord.ButtonBuilder>().setComponents([
          new Discord.ButtonBuilder({
            label: "Да",
            custom_id: "collectAccept_yes",
            style: Discord.ButtonStyle.Success,
          }),
          new Discord.ButtonBuilder({
            label: "Нет",
            custom_id: "collectAccept_no",
            style: Discord.ButtonStyle.Danger,
          }),
        ]),
      ],
    });

    const collector = reply.createMessageComponentCollector({
      time: 60_000 * 5,
      filter: (collectedInteraction) =>
        collectedInteraction.user.id === interaction.user.id,
    });
    collector.on("collect", (collectedInteraction) => {
      if (!collectedInteraction.isButton()) return;

      if (collectedInteraction.customId === "collectAccept_yes") {
        resolve({ accepted: true, collectedInteraction });
      } else {
        resolve({ accepted: false, collectedInteraction });
      }
      collector.stop("success");
    });
    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        reject(new Error("Time of waiting is out"));
        await interaction.editReply({
          components: [],
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Red")
              .setDescription("Время ожидания вышло."),
          ],
        });
        return;
      }
    });
  });
}

/**
 * Fetch message create options from https://messages.style
 * @param code Code or URL (https://messages.style/...)
 */
export async function fetchMessageData(
  query: string
): Promise<Discord.MessageCreateOptions> {
  console.log(`Fetching message data by query ${query}.`);
  const code = query.startsWith("https://")
    ? query.split("/").at(-1) ?? query
    : query;

  let res;
  try {
    res = (await axios.get(`https://message.style/api/shared-messages/${code}`))
      .data;
  } catch (err: any) {
    throw new Error(err);
  }

  if (!res.success)
    throw new Error("REST API returned error: " + res.error?.code);

  return {
    content: res.data.data.content,
    embeds: res.data.data.embeds,
  };
}

export function getMemberRank(
  member: Discord.GuildMember
): "eventer" | "admin" | undefined {
  if (memberHasOneRole(member, BotConfig.roleIds.eventAdminRoleId))
    return "admin";
  if (memberHasOneRole(member, BotConfig.roleIds.eventerRoleId))
    return "eventer";
  return;
}

export async function fetchMember(
  memberId: string,
  guildId: string
): Promise<Discord.GuildMember | undefined> {
  const guild = global.client.guilds.cache.get(guildId);
  if (!guild) return;

  var member = guild.members.cache.get(memberId);
  if (member) return member;

  try {
    member = await guild.members.fetch(memberId);
  } catch (err) {
    console.log(err);
    return;
  }

  return member;
}
export async function fetchMessage(
  channelId: string,
  messageId: string
): Promise<Discord.Message | undefined> {
  const channel = global.client.channels.cache.get(channelId);
  if (!channel || channel.type !== Discord.ChannelType.GuildText) return;

  let msg;
  try {
    msg = await channel.messages.fetch(messageId);
  } catch (err) {
    console.log(err);
    msg = undefined;
  }

  return msg;
}
export async function fastReply(
  interaction: Discord.Interaction,
  options: Discord.InteractionReplyOptions
): Promise<Discord.Message | Discord.InteractionResponse<boolean> | undefined> {
  if (interaction?.isButton() || interaction?.isAnySelectMenu()) {
    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply({
        ...options,
        ...{ fetchReply: true },
      });
    } else {
      return await interaction.reply({
        ...options,
        ...{ fetchReply: true },
      });
    }
  }
}
export async function collectMember(
  interaction: Discord.Interaction,
  ephemeral: boolean = true,
  messageEmbeds?: Discord.EmbedBuilder[]
): Promise<Discord.GuildMember | undefined> {
  return await new Promise(async (resolve, reject) => {
    if (
      !interaction.isButton() &&
      !interaction.isAnySelectMenu() &&
      !interaction.isCommand()
    ) {
      reject("Invalid interaction type.");
      return;
    }

    const interactionReply = await fastReply(interaction, {
      ephemeral,
      ...(messageEmbeds && messageEmbeds.length > 0
        ? { embeds: messageEmbeds }
        : {
            embeds: [embeds.default("Выберите пользователя")],
          }),
      ...{
        components: [
          new Discord.ActionRowBuilder<Discord.UserSelectMenuBuilder>().setComponents(
            [
              new Discord.UserSelectMenuBuilder({
                placeholder: "Участники",
                custom_id: "userCollector_select",
              }),
            ]
          ),
        ],
      },
    });
    if (!interactionReply) {
      reject("Cannot reply this interaction.");
      return;
    }

    const collector = interactionReply.createMessageComponentCollector({
      time: 60_000 * 5,
      filter: (collectedInteraction) =>
        collectedInteraction.user.id === interaction.user.id,
    });
    collector.on("collect", async (inter) => {
      console.log(inter.customId);
      if (!inter.isUserSelectMenu() || !inter.guild) {
        inter.deferUpdate();
        return;
      }
      collector.stop();

      await inter.deferUpdate();

      const userId = inter.values[0];
      if (!userId) return;

      let member;
      try {
        member = await inter.guild.members.fetch(userId);
      } catch (err) {
        reject(err);
        console.log(err);
        interaction.editReply({
          components: [],
          embeds: [
            embeds.error(
              "Ошибка",
              "Не удалось найти пользователя, повторите попытку позже."
            ),
          ],
        });
        return;
      }

      resolve(member);
    });
    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        reject("Timed out.");
        interaction.editReply({
          components: [],
          embeds: [
            new Discord.EmbedBuilder()
              .setColor("Red")
              .setDescription("Время ожидания вышло."),
          ],
        });
        return;
      }
    });
  });
}
export function makeMessageEditOptions(
  createOptions: Discord.MessageCreateOptions
): Discord.MessageEditOptions {
  return {
    content: createOptions.content,
    embeds: createOptions.embeds,
    components: createOptions.components,
  };
}
export async function collectModalData(
  interaction: Discord.ButtonInteraction | Discord.CommandInteraction,
  title: string,
  components: Discord.TextInputBuilder[]
): Promise<Discord.ModalSubmitInteraction> {
  const id = v4();
  await interaction.showModal(
    new Discord.ModalBuilder({
      title: title,
      customId: id,
      components: components.map((comp) =>
        new Discord.ActionRowBuilder<Discord.TextInputBuilder>().setComponents([
          comp,
        ])
      ),
    })
  );

  const submit = await interaction.awaitModalSubmit({
    time: 60_000 * 60,
    filter: (sbm) => sbm.user.id === interaction.user.id && sbm.customId === id,
  });
  return submit;
}
