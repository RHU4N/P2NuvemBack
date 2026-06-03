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
  const date = new Date(value.replace(' ', 'T') + '-03:00');

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
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
  cadastrarAluno
};