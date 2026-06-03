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
    "UPDATE alunos SET dt_cadastro = CURRENT_TIMESTAMP WHERE dt_cadastro IS NULL OR CAST(dt_cadastro AS CHAR) IN ('0000-00-00 00:00:00', '0000-00-00')"
  );
}

module.exports = {
  ensureAlunoTableSchema,
};