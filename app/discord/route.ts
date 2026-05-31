// app/discord/route.ts
// Vanity redirect: me.itheheda.online/discord -> current Discord server invite.
// Keeping the canonical URL on our domain means the invite link in any old
// posts/links can be rotated without breaking those.
import { NextResponse } from "next/server";

const DISCORD_INVITE = "https://discord.gg/Wms5JKsMSW";

export function GET() {
  return NextResponse.redirect(DISCORD_INVITE, 302);
}
