import { sqliteExec, sqliteGet } from "..";
import { ISqliteBannedUser } from "../types";

export async function addEventBan(
  userId: string,
  bannedBy: string,
  reason: string,
  hours: number
): Promise<{ extended: boolean; removed: boolean; endsAt: Date }> {
  const banDocument = await sqliteGet<ISqliteBannedUser | undefined>(
    `SELECT * FROM event_bans WHERE userId=${userId}`
  );
  let endsAt = new Date();
  if (banDocument?.endsAt) endsAt.setTime(banDocument.endsAt);
  endsAt.setHours(endsAt.getHours() + hours);

  if (hours === 0 && !banDocument) {
    throw new Error("Ban data not found.");
  } else if (hours === 0) {
    await sqliteExec(`DELETE FROM event_bans WHERE userId="${userId}"`);
  } else if (!banDocument) {
    await sqliteExec(
      `INSERT INTO event_bans (userId, endsAt, reason, bannedBy) VALUES ("${userId}", ${endsAt.getTime()}, "${reason}", "${bannedBy}")`
    );
  } else {
    await sqliteExec(
      `UPDATE event_bans SET endsAt=${endsAt.getTime()} WHERE userId="${userId}"`
    );
  }

  return {
    extended: banDocument !== undefined,
    removed: hours === 0,
    endsAt,
  };
}
