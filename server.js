const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { ensureDatabase } = require('./config/bootstrapDatabase');
const sequelize = require('./config/sequelize');
require('./models/Aluno');
const alunosRoutes = require('./routes/alunos');

const app = express();
const port = Number(process.env.APP_PORT || 3000);

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
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

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('Falha ao inicializar o Sequelize:', error.message);
    process.exit(1);
  }
}

start();