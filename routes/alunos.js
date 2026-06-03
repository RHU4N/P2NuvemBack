const express = require('express');
const { cadastrarAluno, listarAlunos, loginAluno } = require('../controllers/alunoController');

const router = express.Router();

router.post('/login', loginAluno);
router.get('/alunos', listarAlunos);
router.post('/alunos', cadastrarAluno);

module.exports = router;