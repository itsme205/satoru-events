import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, type Client, type CommandInteraction, type InteractionResponse, type Message } from 'discord.js'
import { type SlashSubCommand } from './SlashSubCommand'

export type TSendError = (title: string, description?: string) => Promise<Message<boolean> | InteractionResponse<boolean>> // throwError function type
export type TExecuteFunction = (interaction: CommandInteraction, throwError: TSendError) => any

export class SlashCommand {
  constructor() { }

  protected slashCommandBuilder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | undefined
  public slashSubCommands = new Set<SlashSubCommand>()
  public execute: TExecuteFunction | undefined

  /**
     * Set execute function.
     * @param execute Function that runs when someone uses the commnad.
     * @returns this
     */
  setExecute = (execute?: TExecuteFunction) => {
    this.execute = execute
    return this
  }

  /**
     * Set slash command options in Discord.
     * @param builder SlashCommandBuilder
     * @returns this
     */
  setSlashCommandBuilder = (builder?: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder) => {
    this.slashCommandBuilder = builder
    return this
  }

  /**
     * Add subcommand.
     * @param subCommand
     * @returns this
     */
  addSubCommand = (subCommand: SlashSubCommand) => {
    this.slashSubCommands.add(subCommand)
    return this
  }

  /**
     * Set subcommands array.
     * @param subCommands
     * @returns
     */
  setSubCommands = (subCommands: SlashSubCommand[]) => {
    this.slashSubCommands = new Set(subCommands)
    return this
  }

  /**
     * Deploy bot commands.
     * @param client Discord client
     * @returns
     */
  deploy = async (client: Client) => {
    if (!this.slashCommandBuilder) return

    this.slashSubCommands.forEach((subCmd) => {
      if (!subCmd.slashSubCommandBuilder || !this.slashCommandBuilder) return
      if (this.slashCommandBuilder instanceof SlashCommandBuilder) this.slashCommandBuilder.addSubcommand(subCmd.slashSubCommandBuilder)
    })

    return await client.application?.commands.create(this.slashCommandBuilder)
  }
}
