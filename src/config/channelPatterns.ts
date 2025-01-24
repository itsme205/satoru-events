import { ChannelType, GuildChannelCreateOptions } from "discord.js";

export const eventChannelPatterns = {
  voice: [
    {
      name: "Голосовой",
      type: ChannelType.GuildVoice,
    },
  ],
  voice_with_chat: [
    {
      name: "чат",
      type: ChannelType.GuildText,
    },
    {
      name: "Голосовой",
      type: ChannelType.GuildVoice,
    },
  ],
  tribune: [
    {
      name: "Трибуна",
      type: ChannelType.GuildStageVoice,
    },
  ],
} as { [key: string]: GuildChannelCreateOptions[] };
