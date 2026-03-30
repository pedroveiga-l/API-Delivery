# Delivery API

API REST para gestão de entregas, com autenticação JWT, autorização por perfil de usuário e persistência em PostgreSQL com Prisma.

## Sumário

1. Visão Geral
2. Tecnologias
3. Arquitetura
4. Perfis de Usuário
5. Autenticação
6. Endpoints HTTP
7. Modelo de Dados
8. Como Rodar o Projeto
9. Testes
10. Observações

## 1. Visão Geral

A RocketLog API permite:

- Cadastro de usuários
- Login com geração de token JWT
- Criação e listagem de entregas
- Atualização de status de entrega
- Registro e consulta de logs de entrega

## 2. Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- Zod
- Jest
- Supertest
- Docker Compose

## 3. Arquitetura

Estrutura principal:

- src/routes: definição de rotas
- src/controllers: regras de negócio e respostas HTTP
- src/middlewares: autenticação, autorização e tratamento de erros
- src/database: cliente Prisma
- src/configs: configuração JWT
- prisma/schema.prisma: modelos e enums do banco
- src/tests: testes automatizados

Fluxo típico de rota protegida:

1. Requisição chega na rota
2. Middleware de autenticação valida token
3. Middleware de autorização valida role
4. Controller executa regra de negócio
5. Middleware global trata erros

## 4. Perfis de Usuário

- customer
Permissões:
- Criar e listar entregas
- Atualizar status de entrega
- Criar logs de entrega
- Visualizar somente suas entregas no endpoint de logs

- sale
Permissões:
- Visualizar logs de qualquer entrega no endpoint de consulta de logs

- público
Permissões:
- Criar conta
- Fazer login

## 5. Autenticação

Para endpoints protegidos, enviar no header Authorization:

Bearer TOKEN_JWT

Erros comuns de autenticação:

- 401 Token not found.
- 401 Invalid token.
- 401 Unauthorized

## 6. Endpoints HTTP

### 6.1 Usuários

POST /users

Descrição:
Cria um novo usuário.

Body:
- name: string
- email: string válido
- password: string, mínimo 6 caracteres

Sucesso:
- 201 Created
- Retorna usuário sem senha

Possíveis erros:
- 400 User with this email already exists
- 400 Validation failed

---

### 6.2 Sessões

POST /sessions

Descrição:
Autentica usuário e retorna token JWT.

Body:
- email: string válido
- password: string

Sucesso:
- 200 OK
- Retorna token e dados do usuário

Possíveis erros:
- 401 Invalid email or password
- 400 Validation failed

---

### 6.3 Entregas

POST /deliveries

Descrição:
Cria uma entrega.

Proteção:
- Requer autenticação
- Role permitida: customer

Body:
- user_id: uuid
- description: string

Sucesso:
- 201 Created
- Corpo vazio

Possíveis erros:
- 401 (auth/role)
- 400 Validation failed

GET /deliveries

Descrição:
Lista entregas com informações básicas do usuário.

Proteção:
- Requer autenticação
- Role permitida: customer

Sucesso:
- 200 OK
- Lista de entregas

Possíveis erros:
- 401 (auth/role)

PATCH /deliveries/:id/status

Descrição:
Atualiza status da entrega e cria log automático com o novo status.

Proteção:
- Requer autenticação
- Role permitida: customer

Parâmetro:
- id: uuid da entrega

Body:
- status: processing | shipped | delivered

Sucesso:
- 200 OK
- Corpo vazio

Possíveis erros:
- 400 Validation failed
- 401 (auth/role)

---

### 6.4 Logs de Entrega

POST /delivery-logs

Descrição:
Cria um log manual para uma entrega.

Proteção:
- Requer autenticação
- Role permitida: customer

Body:
- delivery_id: uuid
- description: string

Regras de negócio:
- Se a entrega estiver delivered, bloqueia
- Se a entrega estiver processing, bloqueia e orienta mudar para shipped

Sucesso:
- 201 Created
- Corpo vazio

Possíveis erros:
- 404 Delivery not found
- 400 The delivery is already delivered
- 400 Change status to shipped
- 401 (auth/role)

GET /delivery-logs/:delivery_id/show

Descrição:
Retorna entrega com usuário e histórico de logs.

Proteção:
- Requer autenticação
- Roles permitidas: customer, sale

Parâmetro:
- delivery_id: uuid

Regra de acesso:
- customer só pode ver entregas próprias
- sale pode ver qualquer entrega

Sucesso:
- 200 OK
- Objeto da entrega com logs e usuário

Possíveis erros:
- 401 The user can only view their own deliveries
- 401 (auth/role)

## 7. Modelo de Dados

Enums:

- UserRole: customer, sale
- DeliveryStatus: processing, shipped, delivered

Modelos:

- User
Campos principais:
- id
- name
- email
- password
- role
- createdAt
- updatedAt

- Delivery
Campos principais:
- id
- userId
- description
- status
- createdAt
- updatedAt

- DeliveryLog
Campos principais:
- id
- description
- deliveryId
- createdAt
- updatedAt

Relações:

- User 1:N Delivery
- Delivery 1:N DeliveryLog

## 8. Como Rodar o Projeto

Pré-requisitos:

- Node.js
- Docker e Docker Compose

Passos:

1. Subir banco PostgreSQL com Docker Compose
2. Configurar variáveis de ambiente
3. Rodar migrations do Prisma
4. Iniciar servidor em modo dev

Scripts disponíveis:

- npm run dev
- npm run test:dev

Variáveis esperadas:

- DATABASE_URL
- JWT_SECRET

## 9. Testes

Cobertura atual:

- users-controller.test.ts
- sessions-controller.test.ts

Lacunas atuais:

- testes para entregas
- testes para atualização de status
- testes para logs de entrega
- testes de autorização por role nos endpoints protegidos

## 10. Observações

- Há validação de payload com Zod nos controllers
- Há tratamento global de erro para AppError e ZodError
- A autorização por role está centralizada em middleware
- O token JWT inclui role e subject do usuário
