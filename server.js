const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { ensureDatabase } = require('./config/bootstrapDatabase');
const { ensureAlunoTableSchema } = require('./config/ensureAlunoTableSchema');
const sequelize = require('./config/sequelize');
require('./models/Aluno');
const alunosRoutes = require('./routes/alunos');

const app = express();
const port = Number(process.env.PORT || process.env.APP_PORT || 3000);

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = new Set(
  [frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173']
    .filter(Boolean)
    .map((origin) => origin.trim())
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim();
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
      const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(normalizedOrigin);

      if (allowedOrigins.has(normalizedOrigin) || isLocalhost || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error(`Origem bloqueada pelo CORS: ${normalizedOrigin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API em funcionamento' });
});

app.use('/api', alunosRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

async function start() {
  try {
    await ensureDatabase();
    await sequelize.sync();
    await ensureAlunoTableSchema();

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Falha ao inicializar o Sequelize:', error.message);
    process.exit(1);
  }
}

start();