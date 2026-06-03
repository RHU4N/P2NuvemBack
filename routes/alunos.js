const express = require('express');
const { cadastrarAluno } = require('../controllers/alunoController');

const router = express.Router();

router.post('/alunos', cadastrarAluno);

module.exports = router;