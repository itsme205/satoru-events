import { SlashSubCommand } from "@classes/default/SlashSubCommand";
import embeds from "@modules/embeds";
import EventType from "@modules/mongodb/models/EventType";
import {
  collectModalData,
  fetchMessageData,
  getMemberRank,
} from "@modules/utils";
import Discord, { SlashCommandSubcommandBuilder } from "discord.js";

export const eventTypeCreateSubcommand = new SlashSubCommand()
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

    if ((await EventType.count()) >= 10)
      return throwError(
        "Ошибка",
        "Создано максимальное количество типов (10)."
      );

    const name =
      interaction.options.get("название")?.value?.toString() ?? "unnamed";
    const rulesUrl =
      interaction.options.get("правила")?.value?.toString() ?? "-";
    const announceUrl =
      interaction.options.get("аннонс")?.value?.toString() ?? "-";
    let existingType = await EventType.findOne({ name });
    if (existingType)
      return throwError(
        "Ошибка",
        "Тип ивента с таким названием уже существует."
      );

    const submit = await collectModalData(interaction, "Событие", [
      new Discord.TextInputBuilder({
        label: "Название события",
        custom_id: "name",
        maxLength: 100,
        required: true,
        style: Discord.TextInputStyle.Short,
      }),
      new Discord.TextInputBuilder({
        label: "Описание",
        custom_id: "description",
        maxLength: 900,
        required: true,
        style: Discord.TextInputStyle.Paragraph,
      }),
      new Discord.TextInputBuilder({
        label: "URL картинки",
        custom_id: "imageUrl",
        required: false,
        style: Discord.TextInputStyle.Short,
      }),
    ]);

    const scheduledEvent = {
      name: submit.fields.getTextInputValue("name") ?? "-",
      description: submit.fields.getTextInputValue("description") ?? "-",
      imageUrl: submit.fields.getTextInputValue("imageUrl") ?? "-",
    };

    await submit.reply({
      ephemeral: true,
      embeds: [
        embeds.default(
          `Загружаем сообщение с сайта **${rulesUrl}** и **${announceUrl}**\n... Это может занять некоторое время.`
        ),
      ],
    });

    let rulesMessageCreateOptions;
    let announceMessageCreateOptions;
    try {
      rulesMessageCreateOptions = await fetchMessageData(rulesUrl);
      announceMessageCreateOptions = await fetchMessageData(announceUrl);
    } catch (err) {
      console.log(err);
      return throwError(
        "Ошибка",
        "При загрузке сообщения произошла ошибка. Повторите попытку позже."
      );
    }

    let eventType;
    try {
      eventType = new EventType({
        name,
        createdBy: interaction.user.id,
        createdAt: new Date(),
        rulesMessageCreateOptions,
        announceMessageCreateOptions,
        scheduledEvent,
      });
      await eventType.save();
    } catch (err) {
      console.log(err);
      return throwError(
        "Ошибка",
        "Не удалось сохранить пресет. Повторите попытку позже."
      );
    }

    submit.editReply({
      embeds: [
        embeds.default(`Новый пресет **${name}** был успешно сохранён.`),
      ],
    });
  })
  .setSlashSubCommandBuilder(
    new SlashCommandSubcommandBuilder()
      .setName("create")
      .setDescription("Создать новый тип ивента.")
      .addStringOption((opt) =>
        opt
          .setName("название")
          .setDescription("параметр должен быть уникальным")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("правила")
          .setDescription(
            "ссылка на сообщение правил (https://messages.style/)"
          )
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("аннонс")
          .setDescription(
            "ссылка на сообщение аннонса (https://messages.style/)"
          )
          .setRequired(true)
      )
  );
