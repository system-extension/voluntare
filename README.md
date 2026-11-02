# Voluntare

Plataforma web para gestão de voluntariado. Permite publicar oportunidades, receber candidaturas, confirmar participantes e registrar a participação e as horas realizadas.

Projeto P04 da Fábrica de Software, Engenharia de Software (Univille).

## Integrantes

| Integrante | Responsabilidade primária |
|---|---|
| Marcus | Coordenação + Frontend/Design |
| Italo | Backend + Integração |
| Rafael | Dados + Backend |
| Gabriel | QA + Backend/Documentação |

O papel é a responsabilidade principal, não uma divisão rígida. Todos participam de análise, revisão de PRs e testes.

## Stack

- Backend: Java 21 + Spring Boot 3.x, Spring Data JPA, Spring Security
- Banco: PostgreSQL
- Frontend: HTML, CSS e JavaScript (React + Vite)
- API: REST/JSON, documentada com OpenAPI/Swagger
- Testes: JUnit 5 e Mockito

Justificativas em [docs/arquitetura.md](docs/arquitetura.md).

## Estrutura do repositório

```
/backend
/frontend
/docs
  /mockups
  /der
  arquitetura.md
  decisoes.md
README.md
```

## Branches

| Branch | Uso |
|---|---|
| `main` | Versão estável e revisada |
| `develop` | Integração do trabalho da equipe |
| `feature/<descricao>` | Entregas específicas |

Não fazemos commit direto na `main`. Todo trabalho entra por Pull Request, revisado por pelo menos outro integrante.

## Documentação

- [Arquitetura e stack](docs/arquitetura.md)
- [Decisões e dúvidas](docs/decisoes.md)
- [Regras de negócio](docs/regras-de-negocio.md)
- [DER e dicionário de dados](docs/der/der.md)
- [Plano e evidências de testes](docs/testes.md)
- [Mockups e fluxo de telas](docs/mockups/README.md)

## Como executar

### Pré-requisitos

| Ferramenta | Versão | Para quê |
|---|---|---|
| JDK | 21 (Temurin recomendado), com `JAVA_HOME` apontando para ele | Backend |
| Docker Desktop (Windows: com WSL 2) | Atual | PostgreSQL local e testes com Testcontainers |
| Node.js | 22 | Frontend |

No Windows, pelo `winget`:

```
winget install -e --id EclipseAdoptium.Temurin.21.JDK
wsl --install --no-distribution
winget install -e --id Docker.DockerDesktop
```

Depois, reinicie o computador e abra o Docker Desktop uma vez para aceitar os termos.

### Banco de dados

Na raiz do repositório:

```
docker compose up -d
```

Sobe o PostgreSQL 16 em `localhost:5432` (banco, usuário e senha `voluntare`). Os dados ficam no volume `voluntare-dados`. Para recomeçar do zero: `docker compose down -v`.

Se a máquina já tiver um PostgreSQL instalado na porta 5432, o backend conecta nele e dá erro de senha. Nesse caso, defina a variável de ambiente `DB_PORT` com outra porta (ex.: `5433`). O `compose.yaml` e o backend leem a mesma variável. No Windows: `setx DB_PORT 5433` e abra um terminal novo.

O schema e a massa de demonstração são aplicados pelo Flyway quando o backend sobe (`backend/src/main/resources/db/migration`). Todos os usuários da demonstração usam a senha `Voluntare@2026`:

| Usuário | Papel |
|---|---|
| `ana@novoscaminhos.example.org` | Gestora do Instituto Novos Caminhos |
| `bruno@novoscaminhos.example.org` | Coordenador do Instituto Novos Caminhos |
| `diego@patasamigas.example.org` | Gestor da Associação Patas Amigas |
| `fernanda@example.com` | Voluntária |

A lista completa está em [docs/der/der.md](docs/der/der.md#migrações).

### Backend

```
cd backend
./mvnw spring-boot:run     # Windows: .\mvnw.cmd spring-boot:run
./mvnw verify              # testes; precisa do Docker aberto
```

Para usar outro banco, defina `DB_URL`, `DB_USER` e `DB_PASSWORD`.

Com o backend rodando, a documentação da API fica em http://localhost:8080/swagger-ui.html.
Para chamar as rotas protegidas pelo Swagger, faça login em `POST /api/auth/login` (ex.: `ana@novoscaminhos.example.org`, senha `Voluntare@2026`), copie o `token` e cole em **Authorize**.

Fora da máquina local, defina `JWT_SEGREDO` (no mínimo 32 caracteres aleatórios).
Se o front for servido de outro endereço que não `http://localhost:5173`, defina `CORS_ORIGENS` (separadas por vírgula).

### API

Todas as rotas estão documentadas no Swagger. Resumo:

| Área | Rotas | Acesso |
|---|---|---|
| Busca pública | `GET /api/oportunidades`, `GET /api/oportunidades/{id}`, `GET /api/habilidades` | Público |
| Autenticação | `POST /api/auth/cadastro`, `POST /api/auth/cadastro-organizacao`, `POST /api/auth/login`, `GET /api/auth/eu` | Público / logado |
| Perfil do voluntário | `GET` e `PUT /api/voluntarios/eu` | Voluntário |
| Área da organização | `GET /api/organizacao`, `GET /api/organizacao/oportunidades` (+ `/{id}`, `/{id}/historico`, `/{id}/candidaturas`) | Gestor ou coordenador |
| Vagas | `POST /api/oportunidades`, `PUT /api/oportunidades/{id}`, `POST /api/oportunidades/{id}/publicar`, `/encerrar`, `/cancelar` | Gestor cria; responsável ou gestor alteram |
| Candidatura | `POST /api/oportunidades/{id}/candidaturas`, `GET /api/candidaturas/minhas`, `POST /api/candidaturas/{id}/cancelar` | Voluntário |
| Decisão | `POST /api/candidaturas/{id}/aceitar`, `/rejeitar` | Responsável ou gestor |
| Participação | `POST /api/participacoes/{id}/presenca`, `/ausencia` | Responsável ou gestor |
| Histórico | `GET /api/participacoes/minhas` | Voluntário |

Erros sempre no formato `{ "status": 400, "mensagem": "...", "campos": [{ "campo": "...", "mensagem": "..." }] }`.

### Frontend

```
cd frontend
npm ci
npm run dev
```
