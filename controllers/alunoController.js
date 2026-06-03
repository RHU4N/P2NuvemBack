const bcrypt = require('bcrypt');
const Aluno = require('../models/Aluno');
const { uploadSingleFoto, handleUploadError } = require('../middlewares/uploadAluno');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

      await Aluno.create({
        nome_completo,
        usuario_acesso,
        senha_hash: senhaHash,
        email_aluno,
        observacao: observacao || null,
        foto,
      });

      return res.status(201).json({
        success: true,
        message: 'Aluno cadastrado com sucesso'
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