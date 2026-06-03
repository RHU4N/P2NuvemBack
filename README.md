# API de Cadastro de Alunos

API REST em Node.js com Express e MySQL para cadastro de alunos com hash de senha via bcrypt.

## Banco de Dados

O projeto agora usa Sequelize e cria o database e a tabela `alunos` automaticamente no startup.

O bootstrap cria o database definido em `.env` com `CREATE DATABASE IF NOT EXISTS` e, em seguida, o Sequelize gera a tabela.
Para armazenar fotos de até 5 MB diretamente na tabela, o campo `foto` é definido como `MEDIUMBLOB` pelo model.

Se você já tiver a tabela e quiser recriá-la do zero, rode:

```sql
DROP TABLE IF EXISTS alunos;
```

Depois inicie a API para o Sequelize recriar a tabela.

## Instalação

1. Acesse a pasta do projeto.
2. Instale as dependências:

```bash
npm install
```

## Execução

Inicie a aplicação com:

```bash
npm start
```

Por padrão, o servidor sobe na porta `3000`.

## Endpoint

### POST /api/alunos

Content-Type: `multipart/form-data`

Payload:

```json
{
  "nome_completo": "João Silva",
  "usuario_acesso": "joao",
  "senha": "123456",
  "email_aluno": "joao@email.com",
  "observacao": "Aluno teste"
}
```

Resposta de sucesso:

```json
{
  "success": true,
  "message": "Aluno cadastrado com sucesso"
}
```

Resposta de erro:

```json
{
  "success": false,
  "message": "Descrição do erro"
}
```