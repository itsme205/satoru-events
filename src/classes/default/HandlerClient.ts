import { Client, type ClientOptions } from 'discord.js'
import { type TExecuteFunction } from './SlashCommand'

class HandlerClient extends Client {
  commands: Map<string, TExecuteFunction>
  events: Map<string, [...any]>
  modules: {}
  constructor (options: ClientOptions) {
    super(options)

    this.commands = new Map()
    this.events = new Map()
    this.modules = {}
  }
}

export default HandlerClient
