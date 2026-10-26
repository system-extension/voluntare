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
- [DER e dicionário de dados](docs/der/der.md)
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

### Frontend

```
cd frontend
npm ci
npm run dev
```
