import Discord from "discord.js";
import { BotConfig } from "@config/config";
import Event from "@modules/mongodb/models/Event";

async function eventTimeTick() {
  const events = await Event.find();
  if (events.length === 0) return;
  const guild = global.client.guilds.cache.get(BotConfig.guildId);
  if (!guild) return console.log("Guild not found.");

  for (let i in events) {
    let channels = guild.channels.cache.filter(
      (ch) =>
        ch.parentId === events[i].parentId &&
        (ch.type === Discord.ChannelType.GuildVoice ||
          ch.type === Discord.ChannelType.GuildStageVoice) &&
        ch.members.size > 0
    );
    let members = events[i].members ?? {};
    channels.forEach((ch) => {
      if (
        !(
          ch.type === Discord.ChannelType.GuildVoice ||
          ch.type === Discord.ChannelType.GuildStageVoice
        )
      )
        return console.log("Channel type collision!");
      ch.members.forEach((member) => {
        if (members[member.id]) {
          members[member.id].progress += 1;
        } else {
          members[member.id] = {
            progress: 1,
          };
        }
      });
    });
    console.log(members);
    await Event.findOneAndUpdate(
      { _id: events[i]._id },
      {
        $set: {
          members: members,
        },
      }
    );
  }
}

export default {
  eventName: "ready",
  execute: () => {
    setInterval(() => {
      eventTimeTick();
    }, 60_000);
  },
};
