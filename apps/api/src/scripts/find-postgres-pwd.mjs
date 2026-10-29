import { PrismaClient } from '@prisma/client';

const candidatePasswords = [
  'kenenisa@077215',
  'kenenisa@3072215',
  'kenenisa',
  'admin',
  'root',
  '123456',
  '1234',
  '',
];

async function tryPassword(pwd) {
  const encPwd = encodeURIComponent(pwd);
  const url = `postgresql://postgres:${encPwd}@localhost:5432/kenenisa_os?schema=public`;
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const res = await p.$queryRawUnsafe('SELECT current_database(), current_user');
    console.log(`SUCCESS with password: "${pwd}"! Connected to database kenenisa_os:`, res);
    await p.$disconnect();
    return { pwd, db: 'kenenisa_os' };
  } catch (err) {
    if (err.message.includes('database "kenenisa_os" does not exist')) {
      console.log(`PASSWORD CORRECT ("${pwd}") but database "kenenisa_os" does not exist!`);
      await p.$disconnect();
      return { pwd, db: 'postgres' };
    }
    // console.log(`Failed for "${pwd}":`, err.message.slice(0, 100));
    await p.$disconnect();
    return null;
  }
}

async function testAll() {
  for (const pwd of candidatePasswords) {
    const res = await tryPassword(pwd);
    if (res) return;
  }
  // Try database 'postgres' as well
  for (const pwd of candidatePasswords) {
    const encPwd = encodeURIComponent(pwd);
    const url = `postgresql://postgres:${encPwd}@localhost:5432/postgres?schema=public`;
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      const res = await p.$queryRawUnsafe('SELECT current_database(), current_user');
      console.log(`SUCCESS on db 'postgres' with password: "${pwd}"!`, res);
      await p.$disconnect();
      return;
    } catch (e) {
      await p.$disconnect();
    }
  }
  console.log('No candidate password matched local postgres.');
}

testAll();
