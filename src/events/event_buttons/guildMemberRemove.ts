// import Close from "@modules/mongodb/models/Event";
// import Discord, { InteractionCollector } from "discord.js";

// export default {
//     eventName: "guildMemberRemove",
//     execute: async(member: Discord.GuildMember) => {
//         if(member.user.bot) return
        
//         console.log(`${member.user.username} left the server.`)
//         await Close.updateMany({"teams.members" : member.id}, {
//             $pull: {
//                 "teams.$.members" : member.id
//             }
//         })
//     }
// }