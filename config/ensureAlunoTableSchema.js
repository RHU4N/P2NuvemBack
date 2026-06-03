const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

async function ensureAlunoTableSchema() {
  const queryInterface = sequelize.getQueryInterface();

  let tableDescription;

  try {
    tableDescription = await queryInterface.describeTable('alunos');
  } catch (error) {
    return;
  }

  if (!tableDescription.dt_cadastro) {
    await queryInterface.addColumn('alunos', 'dt_cadastro', {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    });
    return;
  }

  await sequelize.query(
    "UPDATE alunos SET dt_cadastro = CURRENT_TIMESTAMP WHERE dt_cadastro IS NULL OR dt_cadastro = '0000-00-00 00:00:00' OR dt_cadastro = '0000-00-00'"
  );

  await queryInterface.changeColumn('alunos', 'dt_cadastro', {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  });
}

module.exports = {
  ensureAlunoTableSchema,
};