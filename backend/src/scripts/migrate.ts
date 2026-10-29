import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function runMigration() {
  console.log('🌸 Starting database migration...');
  console.log(`Connecting to ${env.db.host}:${env.db.port}/${env.db.database} as ${env.db.user}...`);

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: true,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    let sql = fs.readFileSync(schemaPath, 'utf8');

    // If we're using a specified database (like defaultdb on Aiven),
    // remove the hardcoded CREATE DATABASE / USE flower_shop directives
    if (env.db.database !== 'flower_shop') {
      sql = sql.replace(/CREATE DATABASE IF NOT EXISTS flower_shop[^;]*;/i, '');
      sql = sql.replace(/USE flower_shop;/i, '');
    }

    console.log('Executing schema.sql...');
    await connection.query(sql);
    console.log('✅ Schema executed successfully!');

    // Verify created tables
    const [rows] = await connection.query('SHOW TABLES');
    const tableNames = (rows as any[]).map((r) => Object.values(r)[0]);
    console.log(`📊 Successfully initialized ${tableNames.length} tables/views:`);
    console.log(tableNames.join(', '));

    // Verify admin user
    const [users] = await connection.query('SELECT id, ten_dang_nhap, ho_ten FROM nguoi_dung');
    console.log('👤 Seeded users:', users);
  } catch (error: any) {
    console.error('❌ Migration failed!');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
