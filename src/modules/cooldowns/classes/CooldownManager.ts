import {
  Colors,
  type CommandInteraction,
  EmbedBuilder,
  type InteractionResponse,
  type Message,
} from "discord.js";

export class CooldownManager {
  constructor() {
    setInterval(() => {
      this.data.forEach((val, key) => {
        if (val < new Date()) this.data.delete(key);
      });
    }, 5000);
  }

  private readonly data = new Map<string, Date>();
  private async throwError(
    interaction: CommandInteraction,
    endsAt: Date
  ): Promise<InteractionResponse | Message> {
    return await interaction[
      interaction.replied || interaction.deferred ? "editReply" : "reply"
    ]({
      ephemeral: true,
      embeds: [
        new EmbedBuilder({
          color: Colors.Red,
          title: "``❌``  »  Не спешите!",
          description: `Подождите немного, команда снова станет доступна <t:${Math.floor(
            endsAt.getTime() / 1000
          )}:R>.`,
          timestamp: new Date(),
        }),
      ],
    });
  }

  /**
   * Returns user cooldowns state
   * @param id
   * @returns true if cooldowned, false if not
   */
  public isCooldowned(id: string): boolean {
    return !!this.data.get(id);
  }

  /**
   * Checks if user cooldowned and automatically handle it.
   * @param id
   * @param interaction
   * @returns true if cooldowned, false if not
   */
  public async checkCooldown(
    id: string,
    interaction: CommandInteraction
  ): Promise<boolean> {
    if ((this.data.get(id) ?? new Date()) > new Date()) {
      await this.throwError(interaction, this.data.get(id) ?? new Date());
      return true;
    } else {
      return false;
    }
  }

  /**
   * Cooldown user.
   * @param id
   * @param time
   * @returns Cooldown end date.
   */
  public setCooldown(id: string, time: number): Date {
    const date = new Date();
    date.setSeconds(date.getSeconds() + time);
    this.data.set(id, date);

    return date;
  }
}
