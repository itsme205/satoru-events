import type Discord from "discord.js";
import embeds from "../../modules/embeds";

const actions = {
  /* Buttons  */
  close: require("./actions/buttons/close"),
  announce: require("./actions/buttons/announce"),
  delete: require("./actions/buttons/delete"),
  members: require("./actions/buttons/members"),

  /* Select Menus  */
} as Record<string, any>;

export default {
  eventName: "interactionCreate",
  execute: async (interaction: Discord.Interaction) => {
    if (
      (!interaction.isButton() && !interaction.isStringSelectMenu()) ||
      !interaction.customId.startsWith("eventManage_")
    )
      return;

    const action: string = interaction.customId.split("_")[1];

    if (
      actions[action]?.default?.execute &&
      typeof actions[action].default.execute === "function"
    ) {
      actions[action].default.execute(
        interaction,
        async (title: string, description: string) => {
          return await new Promise(async (resolve) => {
            if (interaction.replied) {
              resolve(interaction);
              return;
            }

            try {
              await interaction[
                interaction?.replied || interaction?.deferred
                  ? "editReply"
                  : "reply"
              ]({
                ephemeral: true,
                embeds: [embeds.error(title, description)],
              });
            } catch (err) {
              console.log("throwError() returned error.", err);
            }
          });
        }
      );
    } else {
      return await interaction.reply({
        embeds: [
          embeds.error(
            "Ошибка",
            "К сожалению, нам не удалось обработать это действие.\nПовторите попытку позже, если проблема сохранится - сообщите об этом администрации."
          ),
        ],
        ephemeral: true,
      });
    }
  },
};
