export interface ISqliteBannedUser {
  userId: string;
  reason: string;
  endsAt: number;
  bannedBy: string;
}
