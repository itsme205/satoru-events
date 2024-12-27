import { type SlashCommandSubcommandBuilder } from 'discord.js'
import { type TExecuteFunction } from './SlashCommand'

export class SlashSubCommand {
  constructor() { }

  public execute: TExecuteFunction | undefined

  public slashSubCommandBuilder: SlashCommandSubcommandBuilder | undefined

  /**
     * Set subcommand execute function.
     * @param execute Execute function that runs when someone uses subcommand
     * @returns this
     */
  setExecute = (execute?: TExecuteFunction) => {
    this.execute = execute
    return this
  }

  /**
     * Set command creation parameters in Discord.
     * @param builder SlashSubCommandBuilder
     * @returns
     */
  setSlashSubCommandBuilder = (builder?: SlashCommandSubcommandBuilder) => {
    this.slashSubCommandBuilder = builder
    return this
  }
}
