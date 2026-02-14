// db/connect.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;

export async function checkApiLimitAndInsert() {
  const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    options: process.env.PGOPTIONS,
    ssl: { rejectUnauthorized: false } // ← Vercel環境ではこれが必要！
  });

  try {
    await client.connect();

    // 今日の回数を確認
    const res = await client.query(`
      SELECT COUNT(*) AS count
      FROM sample1.api_call_log
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const count = parseInt(res.rows[0].count, 10);

    console.log(`今日のAPI呼び出し回数: ${count}`);

    if (count >= 10) {
      console.log("❌ 今日のAPI上限（10回）に達しました。");
      return false;
    }

    // ログを追加
    await client.query(`INSERT INTO api_call_log DEFAULT VALUES`);
    console.log(`✅ API実行OK（本日 ${count + 1} 回目）`);
    return true;

  } catch (err) {
    console.error('❌ DB接続エラー:', err);
    return false;
  } finally {
    await client.end();
  }
}
