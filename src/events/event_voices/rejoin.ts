// import Close from "@modules/mongodb/models/Event";
// import Discord from "discord.js";

// export default {
//   eventName: "voiceStateUpdate",
//   execute: async (o: Discord.VoiceState, n: Discord.VoiceState) => {
//     if (o.channelId !== n.channelId || !n.channelId) return;

//     const closeData = await Close.findOne({ "channelIds.queue": n.channelId });
//     const memberData = (closeData?.members ?? {})[n.id];
//     const teamChannelId = (closeData?.channelIds?.teams ?? {})[
//       memberData.team.toString()
//     ];
//     if (
//       closeData?.started !== true ||
//       !teamChannelId ||
//       !memberData ||
//       n.channelId !== closeData?.channelIds?.queue
//     )
//       return;

//     n.setChannel(teamChannelId).catch((err) => console.log(err));
//   },
// };
