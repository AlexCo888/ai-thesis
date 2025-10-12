import { db } from '@vercel/postgres';
import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const ddl = await fs.readFile(path.join(process.cwd(), 'src', 'lib', 'schema.sql'), 'utf8');
  const client = await db.connect();
  try {
    await client.query(ddl);
    console.log('✅ Migration complete');
  } finally {
    client.release();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
