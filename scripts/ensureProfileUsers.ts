/**
 * The Full jobs UI uses profile ids 1 (Jiayong) and 2 (Mohan). Jobs are stored per User.id.
 * If user 2 does not exist, adds from Mohan's panel used to fall back to user 1 silently.
 * Run once: npx tsx scripts/ensureProfileUsers.ts
 */
import { prisma } from "../lib/prisma";

async function main() {
  const u2 = await prisma.user.findUnique({ where: { id: 2 } });
  if (u2) {
    console.log("User id=2 already exists:", u2.email);
    return;
  }

  const email = "mohan-profile@jobbot.local";
  const clash = await prisma.user.findUnique({ where: { email } });
  if (clash) {
    console.error(
      `Cannot create user id=2: email ${email} is already used by user id=${clash.id}. Change email in this script or free that address.`
    );
    process.exit(1);
  }

  await prisma.user.create({
    data: {
      id: 2,
      email,
      passwordHash: "unused-profile-placeholder-not-for-login",
    },
  });
  console.log("Created User id=2 for Mohan profile:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
