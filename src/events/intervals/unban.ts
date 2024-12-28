import { BotConfig } from "@config/config";
import { sqliteAll, sqliteExec } from "@modules/sqlite";
import { ISqliteBannedUser } from "@modules/sqlite/types";
import { fetchMember } from "@modules/utils";

async function unbanTick() {
  const guild = global.client.guilds.cache.get(BotConfig.guildId);
  if (!guild) return;

  const bans = await sqliteAll<ISqliteBannedUser[]>(`SELECT * FROM event_bans`);
  for (let i in bans) {
    const endsAt = new Date(bans[i].endsAt);
    if (endsAt > new Date()) continue;

    const member = await fetchMember(bans[i].userId, BotConfig.guildId);
    if (member)
      member.roles
        .remove(BotConfig.eventBanRoleId)
        .catch((err) => console.log(err));

    await sqliteExec(`DELETE FROM event_bans WHERE userId="${bans[i].userId}"`);
  }
}
export default {
  eventName: "ready",
  execute: () => {
    unbanTick();
    setInterval(unbanTick, 30_000);
  },
};
