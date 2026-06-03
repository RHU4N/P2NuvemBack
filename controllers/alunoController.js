const bcrypt = require('bcrypt');
const Aluno = require('../models/Aluno');
const { uploadSingleFoto, handleUploadError } = require('../middlewares/uploadAluno');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCurrentSaoPauloDateTime() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const valueByType = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return `${valueByType.year}-${valueByType.month}-${valueByType.day} ${valueByType.hour}:${valueByType.minute}:${valueByType.second}`;
}

function formatBrasiliaDateTime(value) {
  if (!value) {
    return null;
  }

  let date;

  if (value instanceof Date) {
    date = value;
  } else {
    const normalizedValue = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T');
    date = new Date(normalizedValue.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(normalizedValue) ? normalizedValue : `${normalizedValue}-03:00`);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}

function sanitizarAluno(aluno) {
  return {
    nome_completo: aluno.nome_completo,
    email_aluno: aluno.email_aluno,
    observacao: aluno.observacao,
    foto: aluno.foto,
    dt_cadastro: aluno.dt_cadastro ? formatBrasiliaDateTime(aluno.dt_cadastro) : null,
  };
}

async function listarAlunos(req, res) {
  try {
    const alunos = await Aluno.findAll({
      order: [['dt_cadastro', 'DESC']],
      attributes: ['nome_completo', 'email_aluno', 'observacao', 'foto', 'dt_cadastro'],
    });

    return res.json({
      success: true,
      alunos: alunos.map((aluno) => sanitizarAluno(aluno)),
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno ao listar alunos',
    });
  }
}

async function loginAluno(req, res) {
  try {
    const { usuario_acesso, senha } = req.body;

    if (!usuario_acesso || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e senha são obrigatórios',
      });
    }

    const aluno = await Aluno.findOne({
      where: { usuario_acesso },
    });

    if (!aluno) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos',
      });
    }

    const senhaValida = await bcrypt.compare(senha, aluno.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos',
      });
    }

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      aluno: sanitizarAluno(aluno),
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno ao fazer login',
    });
  }
}

function cadastrarAluno(req, res) {
  uploadSingleFoto(req, res, async (uploadError) => {
    if (uploadError) {
      const handled = handleUploadError(uploadError, res);

      if (handled) {
        return;
      }

      return res.status(400).json({
        success: false,
        message: uploadError.message || 'Arquivo inválido'
      });
    }

    try {
      const { nome_completo, usuario_acesso, senha, email_aluno, observacao } = req.body;
      const foto = req.file ? req.file.buffer : null;

      if (!nome_completo || !usuario_acesso || !senha || !email_aluno) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos obrigatórios devem ser informados'
        });
      }

      if (!emailRegex.test(email_aluno)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de e-mail inválido'
        });
      }

      const usuarioExistente = await Aluno.findOne({
        where: { usuario_acesso },
        attributes: ['id_aluno'],
      });

      if (usuarioExistente) {
        return res.status(409).json({
          success: false,
          message: 'Usuário de acesso já existe'
        });
      }

      const emailExistente = await Aluno.findOne({
        where: { email_aluno },
        attributes: ['id_aluno'],
      });

      if (emailExistente) {
        return res.status(409).json({
          success: false,
          message: 'E-mail já cadastrado'
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const alunoCriado = await Aluno.create({
        nome_completo,
        usuario_acesso,
        senha_hash: senhaHash,
        email_aluno,
        observacao: observacao || null,
        foto,
        dt_cadastro: getCurrentSaoPauloDateTime(),
      });

      return res.status(201).json({
        success: true,
        message: 'Aluno cadastrado com sucesso',
        aluno: {
          id_aluno: alunoCriado.id_aluno,
          nome_completo: alunoCriado.nome_completo,
          usuario_acesso: alunoCriado.usuario_acesso,
          email_aluno: alunoCriado.email_aluno,
          observacao: alunoCriado.observacao,
          dt_cadastro: formatBrasiliaDateTime(alunoCriado.dt_cadastro),
        }
      });
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);

      return res.status(500).json({
        success: false,
        message: 'Erro interno ao cadastrar aluno'
      });
    }
  });
}

module.exports = {
  listarAlunos,
  loginAluno,
  cadastrarAluno
};