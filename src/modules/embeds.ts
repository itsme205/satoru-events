import Discord, { type EmbedBuilder } from 'discord.js'

export default {
  error: (title: string, description: string): EmbedBuilder => {
    if (!title) return new Discord.EmbedBuilder({ color: Discord.Colors.White, title: 'Это ошибка и она пустая.' })
    const error_embed = new Discord.EmbedBuilder()
      .setColor(Discord.Colors.Red) // bd2222
      .setTitle('``❌``  »  ' + title)
      .setTimestamp()
    if (description) error_embed.setDescription(description)
    return error_embed
  },
  success: (title: string, description: string): EmbedBuilder => {
    if (!title) return new Discord.EmbedBuilder({ color: Discord.Colors.White, title: 'Это сообщение и оно пустое.' })
    const success_embed = new Discord.EmbedBuilder()
      .setColor(Discord.resolveColor('#1ac72b'))
      .setTitle('``✅``  »  ' + title)
      .setTimestamp()
    if (description) success_embed.setDescription(description)
    return success_embed
  },
  attention: (title: string, description: string): EmbedBuilder => {
    if (!title) return new Discord.EmbedBuilder({ color: Discord.Colors.White, title: 'Это предупреждение и оно пустое.' })
    const attention_embed = new Discord.EmbedBuilder()
      .setColor(Discord.Colors.Yellow)
      .setTitle('``⚠``  »  ' + title)
      .setTimestamp()
    if (description) attention_embed.setDescription(description)
    return attention_embed
  },
  default: (description: string): EmbedBuilder => {
    if (!description) return new Discord.EmbedBuilder({ color: Discord.Colors.White, title: 'Это обычное сообщение и оно пустое.' })
    const default_embed = new Discord.EmbedBuilder()
      .setColor(Discord.resolveColor('#2b2d31'))
      .setDescription(description)
    return default_embed
  }

}
