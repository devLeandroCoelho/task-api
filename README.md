<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-black.svg)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-yellow.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

<p align="center">
  <a href="#português">Português</a> | <a href="#english">English</a>
</p>

---

# <a id="português"></a>Português

API RESTful para gerenciamento de tarefas desenvolvida com Vercel Serverless Functions, Supabase e TypeScript. Oferece autenticação JWT segura, validação robusta e suite de testes completa.

## ✨ Funcionalidades

- **🔐 Autenticação JWT** — Cadastro e login com autenticação baseada em tokens via Supabase Auth.
- **📝 CRUD de Tarefas** — Criar, ler, atualizar e excluir tarefas com filtros e paginação.
- **✅ Validação com Zod** — Validação de corpo de requisição e query params com mensagens de erro descritivas.
- **🔒 Políticas RLS** — Row Level Security garante que usuários só acessem seus próprios dados.
- **⚡ Serverless** — Zero preocupação com cold start, auto-scaling no Vercel.
- **🔷 TypeScript** — Modo estrito para total segurança de tipos.
- **🧪 Testes** — 25 testes unitários com Vitest + mocking do Supabase.

## 🛠️ Stack Tecnológica

| Camada    | Tecnologia                   |
| --------- | ---------------------------- |
| Runtime   | Vercel Serverless Functions  |
| Linguagem | TypeScript (strict)          |
| Banco     | Supabase (PostgreSQL + RLS)  |
| Auth      | JWT (jsonwebtoken)           |
| Validação | Zod                          |
| Testes    | Vitest                       |

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase (tier free funciona)

### Instalação

```bash
git clone https://github.com/devLeandroCoelho/task-api.git
cd task-api
cp .env.example .env
# Preencha SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET
npm install
```

### Configuração do Banco

Execute a migração SQL no SQL Editor do Supabase:

```bash
# Copie o conteúdo de sql/001_initial.sql e execute no Dashboard > SQL Editor do Supabase
```

### Desenvolvimento

```bash
npm run dev
# Servidor: http://localhost:3000
```

### Produção

```bash
vercel --prod
```

## 🌐 Endpoints da API

### Autenticação

| Método | Endpoint             | Descrição         | Corpo                                    |
| ------ | -------------------- | ----------------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Cadastrar usuário | `{ name, email, password }`              |
| POST   | `/api/auth/login`    | Login             | `{ email, password }`                    |
| GET    | `/api/auth/me`       | Usuário atual     | — (requer Bearer token)                  |

### Tarefas

| Método | Endpoint         | Descrição     | Query Params                              |
| ------ | ---------------- | ------------- | ----------------------------------------- |
| GET    | `/api/tasks`     | Listar tarefas| `status`, `priority`, `page`, `limit`     |
| POST   | `/api/tasks`     | Criar tarefa  | `{ title, description, priority, status, due_date }` |
| PUT    | `/api/tasks/:id` | Atualizar     | `{ title, description, priority, status, due_date }` |
| DELETE | `/api/tasks/:id` | Excluir       | —                                         |

## 🧪 Testes

```bash
npm test              # Rodar todos os testes
npm run test:watch    # Modo observador
npm run test:coverage # Relatório de cobertura
```

## 📁 Estrutura do Projeto

```
api/
├── _lib/
│   ├── supabase.ts      # Cliente Supabase (service_role)
│   ├── auth.ts          # Verificação JWT e geração de token
│   └── zod.ts           # Helpers de validação Zod e resposta
├── auth/
│   ├── register.ts      # POST /api/auth/register
│   ├── login.ts         # POST /api/auth/login
│   └── me.ts            # GET /api/auth/me
└── tasks/
    ├── index.ts         # GET + POST /api/tasks
    └── [id].ts          # PUT + DELETE /api/tasks/:id

sql/
└── 001_initial.sql      # Migração do banco + políticas RLS

tests/
├── setup.ts             # Variáveis de ambiente de teste
├── auth.test.ts         # Testes dos endpoints de auth (mocked)
└── tasks.test.ts        # Testes dos endpoints de tasks (mocked)
```

## ⚙️ Variáveis de Ambiente

| Variável              | Descrição                                    |
| --------------------- | -------------------------------------------- |
| `SUPABASE_URL`        | URL do projeto Supabase                      |
| `SUPABASE_SERVICE_KEY`| Chave service_role do Supabase (bypassa RLS) |
| `JWT_SECRET`          | Segredo de assinatura JWT (min 16 chars)     |

## 📜 Licença

MIT — devLeandroCoelho

---

# <a id="english"></a>English

# <a id="english"></a>English

RESTful API for task management built with Vercel Serverless Functions, Supabase, and TypeScript. Features secure JWT authentication, robust validation, and a comprehensive test suite.

## ✨ Features

- **🔐 JWT Authentication** — Register/login with secure token-based auth via Supabase Auth.
- **📝 Task CRUD** — Create, read, update, and delete tasks with filtering and pagination.
- **✅ Zod Validation** — Request body/query validation with descriptive error messages.
- **🔒 RLS Policies** — Row Level Security ensures users only access their own data.
- **⚡ Serverless** — Zero cold-start concerns, auto-scaling on Vercel.
- **🔷 TypeScript** — Strict mode for full type safety.
- **🧪 Testing** — 25 unit tests with Vitest + Supabase mocking.

## 🛠️ Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Runtime    | Vercel Serverless Functions |
| Language   | TypeScript (strict)         |
| Database   | Supabase (PostgreSQL + RLS) |
| Auth       | JWT (jsonwebtoken)          |
| Validation | Zod                         |
| Testing    | Vitest                      |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (free tier works)

### Installation

```bash
git clone https://github.com/devLeandroCoelho/task-api.git
cd task-api
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET
npm install
```

### Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# Copy the contents of sql/001_initial.sql and run in Supabase Dashboard > SQL Editor
```

### Development

```bash
npm run dev
# Server: http://localhost:3000
```

### Production

```bash
vercel --prod
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Body                                    |
| ------ | -------------------- | ----------------- | --------------------------------------- |
| POST   | `/api/auth/register` | Register new user | `{ name, email, password }`             |
| POST   | `/api/auth/login`    | Login             | `{ email, password }`                   |
| GET    | `/api/auth/me`       | Current user      | — (requires Bearer token)               |

### Tasks

| Method | Endpoint         | Description   | Query Params                              |
| ------ | ---------------- | ------------- | ----------------------------------------- |
| GET    | `/api/tasks`     | List tasks    | `status`, `priority`, `page`, `limit`     |
| POST   | `/api/tasks`     | Create task   | `{ title, description, priority, status, due_date }` |
| PUT    | `/api/tasks/:id` | Update task   | `{ title, description, priority, status, due_date }` |
| DELETE | `/api/tasks/:id` | Delete task   | —                                         |

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📁 Project Structure

```
api/
├── _lib/
│   ├── supabase.ts      # Supabase client (service_role)
│   ├── auth.ts          # JWT verification & token signing
│   └── zod.ts           # Zod validation & response helpers
├── auth/
│   ├── register.ts      # POST /api/auth/register
│   ├── login.ts         # POST /api/auth/login
│   └── me.ts            # GET /api/auth/me
└── tasks/
    ├── index.ts         # GET + POST /api/tasks
    └── [id].ts          # PUT + DELETE /api/tasks/:id

sql/
└── 001_initial.sql      # Database migration + RLS policies

tests/
├── setup.ts             # Test environment variables
├── auth.test.ts         # Auth endpoint tests (mocked)
└── tasks.test.ts        # Task endpoint tests (mocked)
```

## ⚙️ Environment Variables

| Variable              | Description                              |
| --------------------- | ---------------------------------------- |
| `SUPABASE_URL`        | Your Supabase project URL                |
| `SUPABASE_SERVICE_KEY`| Supabase service_role key (bypasses RLS) |
| `JWT_SECRET`          | JWT signing secret (min 16 chars)        |

## 📜 License

MIT — devLeandroCoelho
