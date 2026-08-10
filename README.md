<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-yellow.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

<p align="center">
  <a href="#english">English</a> | <a href="#português">Português</a>
</p>

---

# <a id="english"></a>English

RESTful API for task management built with Node.js, Express, and TypeScript. Features secure JWT authentication, robust validation, and a comprehensive test suite.

## ✨ Features

- **🔐 JWT Authentication** — Register/login with secure token-based auth.
- **📝 Task CRUD** — Create, read, update, and delete tasks with filtering and pagination.
- **✅ Zod Validation** — Request body/query validation with descriptive error messages.
- **🛡️ Security** — Helmet headers, CORS, and rate limiting (100 req/15min).
- **💾 SQLite** — Zero-config database (better-sqlite3) for simplicity and speed.
- **🔷 TypeScript** — Strict mode for full type safety.
- **🐳 Docker** — Multi-stage build, production-ready containerization.
- **🧪 Testing** — 22 unit/integration tests with Vitest + Supertest.

## 🛠️ Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Runtime    | Node.js 20              |
| Language   | TypeScript (strict)     |
| Framework  | Express 5               |
| Validation | Zod                     |
| Auth       | JWT (jsonwebtoken)      |
| Database   | SQLite (better-sqlite3) |
| Testing    | Vitest + Supertest      |
| Security   | Helmet, CORS, RateLimit |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/devleandrocoelho/task-api.git
cd task-api
cp .env.example .env
npm install
```

### Development

```bash
npm run dev
# Server: http://localhost:3000
# Health: http://localhost:3000/health
```

### Production

```bash
npm run build
npm start
```

## 🐳 Docker

```bash
docker compose up -d
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Body                                    |
| ------ | -------------------- | ----------------- | --------------------------------------- |
| POST   | `/api/auth/register` | Register new user | `{ name, email, password }`             |
| POST   | `/api/auth/login`    | Login             | `{ email, password }`                   |
| GET    | `/api/auth/me`       | Current user      | — (requires Bearer token)               |

### Tasks

| Method | Endpoint      | Description     | Query Params                     |
| ------ | ------------- | --------------- | -------------------------------- |
| GET    | `/api/tasks`  | List tasks      | `status`, `priority`, `page`, `limit` |
| POST   | `/api/tasks`  | Create task     | `{ title, description, priority, status, due_date }` |
| PUT    | `/api/tasks/:id` | Update task  | `{ title, description, priority, status, due_date }` |
| DELETE | `/api/tasks/:id` | Delete task  | —                                |

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📁 Project Structure

```
src/
├── config/
│   └── env.ts              # Environment validation with Zod
├── middleware/
│   ├── auth.ts             # JWT authentication middleware
│   ├── errorHandler.ts     # Global error handler
│   └── validate.ts         # Zod validation middleware
├── modules/
│   ├── auth/               # Auth module (controller/service/routes/schema)
│   └── tasks/              # Tasks module (controller/service/routes/schema)
├── utils/
│   └── logger.ts           # Structured logger
├── app.ts                  # Express app setup
├── db.ts                   # SQLite database setup
└── server.ts               # Entry point
```

## ⚙️ Environment Variables

| Variable                | Default                   | Description                |
| ----------------------- | ------------------------- | -------------------------- |
| `NODE_ENV`              | `development`             | Environment mode           |
| `PORT`                  | `3000`                    | Server port                |
| `API_PREFIX`            | `/api`                    | API route prefix           |
| `JWT_SECRET`            | — (required, min 16 chars)| JWT signing secret         |
| `JWT_EXPIRES_IN`        | `7d`                      | Token expiration           |
| `CORS_ORIGIN`           | `http://localhost:3000`   | Allowed CORS origin        |
| `RATE_LIMIT_WINDOW_MS`  | `900000`                  | Rate limit window (15min)  |
| `RATE_LIMIT_MAX`        | `100`                     | Max requests per window    |

## 📜 License

MIT — devLeandroCoelho

---

# <a id="português"></a>Português

API RESTful para gerenciamento de tarefas desenvolvida com Node.js, Express e TypeScript. Oferece autenticação JWT segura, validação robusta e suite de testes completa.

## ✨ Funcionalidades

- **🔐 Autenticação JWT** — Cadastro e login com autenticação baseada em tokens seguros.
- **📝 CRUD de Tarefas** — Criar, ler, atualizar e excluir tarefas com filtros e paginação.
- **✅ Validação com Zod** — Validação de corpo de requisição e query params com mensagens de erro descritivas.
- **🛡️ Segurança** — Headers com Helmet, CORS e limitação de taxa (100 req/15min).
- **💾 SQLite** — Banco de dados zero-config (better-sqlite3) para simplicidade e velocidade.
- **🔷 TypeScript** — Modo estrito para total segurança de tipos.
- **🐳 Docker** — Build multi-stage e containerização pronta para produção.
- **🧪 Testes** — 22 testes unitários/integração com Vitest + Supertest.

## 🛠️ Stack Tecnológica

| Camada    | Tecnologia              |
| --------- | ----------------------- |
| Runtime   | Node.js 20              |
| Linguagem | TypeScript (strict)     |
| Framework | Express 5               |
| Validação | Zod                     |
| Auth      | JWT (jsonwebtoken)      |
| Banco     | SQLite (better-sqlite3) |
| Testes    | Vitest + Supertest      |
| Segurança | Helmet, CORS, RateLimit |

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+
- npm 10+

### Instalação

```bash
git clone https://github.com/devleandrocoelho/task-api.git
cd task-api
cp .env.example .env
npm install
```

### Desenvolvimento

```bash
npm run dev
# Servidor: http://localhost:3000
# Health: http://localhost:3000/health
```

### Produção

```bash
npm run build
npm start
```

## 🐳 Docker

```bash
docker compose up -d
```

## 🌐 Endpoints da API

### Autenticação

| Método | Endpoint             | Descrição         | Corpo                                    |
| ------ | -------------------- | ----------------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Cadastrar usuário | `{ name, email, password }`              |
| POST   | `/api/auth/login`    | Login             | `{ email, password }`                    |
| GET    | `/api/auth/me`       | Usuário atual     | — (requer Bearer token)                  |

### Tarefas

| Método | Endpoint      | Descrição       | Query Params                     |
| ------ | ------------- | --------------- | -------------------------------- |
| GET    | `/api/tasks`  | Listar tarefas  | `status`, `priority`, `page`, `limit` |
| POST   | `/api/tasks`  | Criar tarefa    | `{ title, description, priority, status, due_date }` |
| PUT    | `/api/tasks/:id` | Atualizar tarefa | `{ title, description, priority, status, due_date }` |
| DELETE | `/api/tasks/:id` | Excluir tarefa | —                                |

## 🧪 Testes

```bash
npm test              # Rodar todos os testes
npm run test:watch    # Modo observador
npm run test:coverage # Relatório de cobertura
```

## 📁 Estrutura do Projeto

```
src/
├── config/
│   └── env.ts              # Validação de ambiente com Zod
├── middleware/
│   ├── auth.ts             # Middleware de autenticação JWT
│   ├── errorHandler.ts     # Handler global de erros
│   └── validate.ts         # Middleware de validação Zod
├── modules/
│   ├── auth/               # Módulo de auth (controller/service/routes/schema)
│   └── tasks/              # Módulo de tasks (controller/service/routes/schema)
├── utils/
│   └── logger.ts           # Logger estruturado
├── app.ts                  # Setup do app Express
├── db.ts                   # Setup do banco SQLite
└── server.ts               # Entry point
```

## ⚙️ Variáveis de Ambiente

| Variável                | Padrão                   | Descrição                  |
| ----------------------- | ------------------------ | -------------------------- |
| `NODE_ENV`              | `development`            | Modo do ambiente           |
| `PORT`                  | `3000`                   | Porta do servidor          |
| `API_PREFIX`            | `/api`                   | Prefixo das rotas da API   |
| `JWT_SECRET`            | — (obrigatório, min 16)  | Segredo de assinatura JWT  |
| `JWT_EXPIRES_IN`        | `7d`                     | Expiração do token         |
| `CORS_ORIGIN`           | `http://localhost:3000`  | Origem permitida CORS      |
| `RATE_LIMIT_WINDOW_MS`  | `900000`                 | Janela de limite (15min)   |
| `RATE_LIMIT_MAX`        | `100`                    | Máx. requisições/janela    |

## 📜 Licença

MIT — devLeandroCoelho
