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

## Deploy (Render backend / Vercel frontend)

Resumo rápido:
- O backend pode ser implantado no Render como um `Web Service` usando o comando de start `npm start`.
- O frontend pode ser implantado no Vercel apontando para a pasta `front` (projeto Vite). Configure a variável `VITE_API_URL` para apontar para a URL do backend (ex: `https://seu-backend.onrender.com/api`).

Ambiente necessário para o backend (defina em Render > Environment):
- `HOST` - hostname do MySQL (ex: dbrhuan.mysql.database.azure.com)
- `DB_PORT` - porta do MySQL (3306). **Não** use a variável `PORT` para a porta do banco — `PORT` é reservada pelo Render para o porto HTTP do serviço.
- `USER` - usuário do MySQL
- `PASSWORD` - senha do MySQL
- `DATABASE` - nome do database (será criado automaticamente pelo bootstrap)
- `SSL` - `require` para ativar SSL com Azure MySQL
- `FRONTEND_URL` - URL pública do frontend (ex: https://seu-frontend.vercel.app) — usado para CORS
- `APP_PORT` (opcional) - porta alternativa para o app. Render fornece `PORT` automaticamente e o serviço deve bindar àquela porta.

Passos para publicar o backend no Render:
1. Crie um novo `Web Service` no Render.
2. Aponte o repositório e a branch.
3. Build & Start commands: não é necessário build; use `npm install` como build e `npm start` como start command (Render permite configurar).
4. Defina as variáveis de ambiente acima.
5. Se necessário, permita o IP do Render no firewall do Azure MySQL ou configure SSL e acesso público.

Passos para publicar o frontend no Vercel:
1. Crie um novo projeto apontando para a pasta `front` do repositório.
2. Variáveis de ambiente no Vercel: `VITE_API_URL` = `https://<seu-backend>.onrender.com/api`.
3. Build command: `npm run build`. Output dir: `dist` (padrão do Vite).

Observações importantes:
- A aplicação já aceita upload de imagem e grava o `Buffer` no campo `foto` como `MEDIUMBLOB` (via Sequelize `BLOB('medium')`).
- Se o banco estiver protegido por firewall, garanta que o Render tenha permissão de conexão (use allowlist ou VNet/peering, dependendo da sua infra). Azure MySQL geralmente requer SSL; o projeto já envia a opção `ssl` quando `SSL=require`.
- Defina `FRONTEND_URL` no Render com a URL do Vercel para evitar problemas de CORS.

```