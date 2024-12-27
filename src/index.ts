import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

import Discord from 'discord.js'
import HandlerClient from './classes/default/HandlerClient'

import colors from 'colors'
import { SlashCommand } from '@classes/default/SlashCommand'
import { SlashSubCommand } from '@classes/default/SlashSubCommand'
dotenv.config({
  path: path.join(require.main?.path ?? '', '.env'),
  debug: true
})

global.client = new HandlerClient({
  intents: [
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.GuildPresences,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.GuildInvites,
    Discord.IntentsBitField.Flags.GuildVoiceStates,
    Discord.IntentsBitField.Flags.MessageContent
  ]
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection with reason', reason)
  promise.catch((err) => { console.log(err) })
})

async function scanDir(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) return []
  let dirFiles = await fs.promises.readdir(dir)

  await new Promise((resolve) => {
    async function checkDir(): Promise<any> {
      if (!dirFiles.find(val => val.split('.').length === 1)) { resolve(true); return }
      const dirName = dirFiles.find(val => val.split('.').length === 1) ?? ''
      dirFiles = [
        ...dirFiles.filter(val => val !== dirName),
        ...(
          (await fs.promises.readdir(path.join(dir, dirName))).map((val) => path.join(dirName, val))
        )
      ]

      await checkDir()
    }
    checkDir()
      .then(() => { })
      .catch((err) => { console.log(err) })
  })

  return dirFiles
}

client.on('ready', async () => {
  console.log(colors.bold(`Logged in as ${colors.green(client.user?.username ?? 'unnamed')}. Connection time: ${colors.green(process.uptime().toFixed(2).toString())} sec.`))

  // Application preparation
  // MODULES (will be added soon)
  const modulesDir: string[] = await scanDir(path.join(require.main?.path ?? '', '/modules')) ?? []
  if (modulesDir.length === 0) {
    console.log(
      colors.bold(`${colors.red("\n[X] There're no modules in your app!")}
            \r${colors.blue('[i]')} You can add it through creating file in "modules" directory.\n\n`)
    )
  } else {
    for (const dir of modulesDir) {
      if (dir.split('.')[1] !== 'ts' && dir.split('.')[1] !== 'js') continue
      const module_file = require(path.join(require.main?.path ?? '', 'modules', dir))?.default ?? {}
      if (!module_file?.id) continue

      // client.modules[module_file?.id as keyof Object] = module_file
      if (module_file.init) {
        module_file.init((text: string) => {
          console.log(colors.bold(`[${colors.blue(module_file?.name ?? module_file?.id)}] ${text}`))
        })
      }
    }
  }

  // COMMANDS
  const commandsDir: string[] = await scanDir(path.join(require.main?.path ?? '', '/commands')) ?? []
  if (commandsDir.length === 0) {
    console.log(
      colors.bold(`${colors.red("\n[X] There're no commands in your app!")}
            \r${colors.blue('[i]')} You can add it through creating file in \"commands\" directory.\n\n`)
    )
  } else {
    console.log(colors.bold(`\nFound ${colors.green(commandsDir.length.toString() ?? '0')} commands.`))

    for (const i in commandsDir) {
      const commandFile = require(path.join(require.main?.path ?? '', 'commands', commandsDir[i]))?.default ?? {}
      if (!(commandFile instanceof SlashCommand)) continue
      const commandName = commandsDir[i].replaceAll("\\", "/").split("/").at(-1)?.split(".")[0] ?? "unnamed"
      console.log(commandName)

      commandFile.slashSubCommands.forEach((subCommand) => {
        if (!(subCommand instanceof SlashSubCommand) || !subCommand.slashSubCommandBuilder || !subCommand.execute) return
        global.client.commands.set(`${commandName}#${subCommand.slashSubCommandBuilder.name}`, subCommand.execute)
        console.log(colors.bold(`[${colors.blue('CMD')} - ${commandName}] Subcommand ${colors.green(subCommand.slashSubCommandBuilder.name)} is loaded.`))
      })

      try {
        await commandFile.deploy(global.client)
      } catch (err) {
        console.log(err)
        console.log(colors.bold(`[${colors.red('CMD')}] Cannot deploy ${colors.green(commandName || 'unnamed')}.`))
        continue
      }

      if (commandFile.execute) global.client.commands.set(commandName, commandFile.execute)
      console.log(colors.bold(`[${colors.blue('CMD')}] Command ${(colors.green(commandName))} is prepared.`))
    }
  }

  // EVENTS
  const events_dir: string[] = await scanDir(path.join(require.main?.path ?? '', '/events')) ?? []
  if (events_dir.length === 0) {
    console.log(
      colors.bold(`${colors.red("\n[X] There're no events in your app!")}
            \r${colors.blue('[i]')} You can add it through creating file in \"events\" directory.\n\n`)
    )
  } else {
    console.log('\n')
    for (const i in events_dir) {
      const event_file = require(path.join(require.main?.path ?? '', 'events', events_dir[i]))?.default ?? {}
      if (!event_file?.eventName || !event_file?.execute)
      // console.log(colors.bold(`${colors.red("[X]")} Cannot initialize event ${colors.red(events_dir[i])}, check your file.`))
      { continue } else if (event_file.eventName === 'ready') {
        try {
          event_file.execute()
          continue
        } catch (err) {
          console.log(colors.bold(`${colors.red('[X]')} Event execute error (${colors.red(events_dir[i])}).\n`), err)
        }
      }

      client.events.set(event_file.eventName, [
        ...(client.events.get(event_file.eventName) ?? []),
        ...[event_file.execute]
      ])
    }

    const event_names = Array.from(client.events.keys())
    for (const i in event_names) {
      client.on(event_names[i], (...args) => {
        const execute_functions = client.events.get(event_names[i])
        if (!execute_functions) return

        for (const k in execute_functions) { execute_functions[k](...args) }
      })
    }
  }
})

client.on('interactionCreate', (interaction: Discord.Interaction) => {
  if (!interaction.isCommand()) { console.log("Received interaction, but it's not command."); return }
  console.log(`> Received command ${interaction.commandName} [${interaction.id}] by ${interaction.user.username} [${interaction.user.id}]`)

  const subCommandName = interaction.options.data.find(obj => obj.type === Discord.ApplicationCommandOptionType.Subcommand)?.name
  const executeCmd = global.client.commands.get((interaction.command?.name ?? '') + (subCommandName ? `#${subCommandName}` : ''))

  if (!executeCmd) {
    interaction.reply({
      ephemeral: true,
      content: 'Не удалось обработать эту команду. Повторите попытку чуть позже, если проблема сохранится - сообщите об этом разработчикам.'
    }).catch(() => { })
    return
  }
  try {
    executeCmd(interaction, async (title: string, description?: string): Promise<Discord.Message<boolean> | Discord.InteractionResponse<boolean>> => await new Promise(async (resolve) => {
      try {
        resolve(await interaction[(interaction.replied || interaction.deferred) ? 'editReply' : 'reply']({
          ephemeral: true,
          embeds: [
            new Discord.EmbedBuilder({
              color: Discord.Colors.Red,
              title: `\`\`❌\`\`  »  ${title}`,
              description,
              timestamp: new Date()
            })
          ]
        }))
      } catch (err) {
        console.log('throwError() returned error.', err)
      }
    }))
  } catch (err) {
    console.log('There are an error!')
    console.log(err)
  }
})

client.login(process.env.BOT_TOKEN).catch((err) => {
  console.log(err)
})
