const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Aluno = sequelize.define(
  'Aluno',
  {
    id_aluno: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome_completo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    usuario_acesso: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email_aluno: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    observacao: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    foto: {
      type: DataTypes.BLOB('medium'),
      allowNull: true,
    },
    dt_cadastro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'alunos',
    timestamps: false,
  }
);

module.exports = Aluno;