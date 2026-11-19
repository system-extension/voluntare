# Voluntare

Plataforma web para gestão de voluntariado. Permite publicar oportunidades, receber candidaturas, confirmar participantes e registrar a participação e as horas realizadas.

Projeto P04 da Fábrica de Software, Engenharia de Software (Univille).

---

## ▶ Como executar (avaliação)

> **Só é preciso ter o Docker Desktop instalado e aberto.** Não precisa instalar Java, Node nem PostgreSQL: o Docker baixa e compila tudo. Precisa de internet na primeira vez, uns 4 GB de RAM livres e 5 GB de disco.

**1. Instale e abra o Docker Desktop**

Baixe em https://www.docker.com/products/docker-desktop/ e instale. No Windows, se o instalador pedir o WSL 2, aceite e reinicie o computador (se ele não instalar sozinho, rode `wsl --install` no PowerShell como administrador e reinicie).

Abra o Docker Desktop, aceite os termos de uso (o login é opcional, pode pular) e espere aparecer **Engine running** no canto inferior esquerdo da janela.

**2. Baixe o projeto**

Com Git:

```
git clone https://github.com/system-extension/voluntare.git
cd voluntare
```

Sem Git: baixe o ZIP em https://github.com/system-extension/voluntare/archive/refs/heads/main.zip e extraia. Entre nas pastas até chegar na que tem o arquivo `compose.yaml` (normalmente `voluntare-main`). Nessa pasta, clique com o botão direito num espaço vazio e escolha **Abrir no Terminal** (no Windows 10: segure Shift, clique com o botão direito e escolha **Abrir janela do PowerShell aqui**).

**3. Suba o sistema** (no terminal, dentro da pasta que tem o `compose.yaml`)

```
docker compose -f compose.avaliacao.yaml up -d --build --wait
```

A primeira vez leva de 5 a 10 minutos, porque o Docker baixa e compila tudo. O comando só termina quando o sistema estiver pronto para usar. No fim aparecem as linhas `voluntare-avaliacao-postgres-1`, `-backend-1` e `-frontend-1` como `Healthy`.

**4. Acesse**

| O quê | Endereço |
|---|---|
| Sistema | http://localhost:5173 |
| Documentação da API (Swagger) | http://localhost:5173/swagger-ui.html |

**5. Entre com um usuário de teste** (senha de todos: `Voluntare@2026`)

| Perfil | E-mail | O que dá para fazer |
|---|---|---|
| Voluntária | `fernanda@example.com` | Buscar vagas, candidatar-se, ver candidaturas e histórico de horas, editar perfil |
| Gestora da ONG | `ana@novoscaminhos.example.org` | Painel, criar e publicar vagas, aceitar candidatos, registrar presença, gerenciar a equipe |
| Coordenador da ONG | `bruno@novoscaminhos.example.org` | Operar só as vagas pelas quais é responsável |

Também é possível criar uma conta nova de voluntário ou cadastrar uma ONG pela tela de entrar.

**Se algo der errado**

| Problema | Solução |
|---|---|
| `docker` não é reconhecido como comando | Feche o terminal e abra outro depois que o Docker Desktop estiver aberto. Se continuar, o Docker Desktop não está instalado. |
| Erro de conexão com o Docker (`cannot connect`, `pipe`, `daemon`) | O Docker Desktop não está aberto. Abra e espere **Engine running**. |
| `no configuration file provided` ou `no such file` | O terminal não está na pasta certa. Volte ao passo 2 e abra o terminal na pasta que tem o `compose.yaml`. |
| `port is already allocated` ou `address already in use` | A porta 5173 está ocupada por outro programa. Suba usando outra porta e acesse por ela. PowerShell: `$env:APP_PORT="8090"; docker compose -f compose.avaliacao.yaml up -d --build --wait`. Prompt de comando (cmd): `set APP_PORT=8090` e depois o comando de subir. Linux/macOS: `APP_PORT=8090 docker compose -f compose.avaliacao.yaml up -d --build --wait`. Depois abra http://localhost:8090. |
| Erro de rede ou `timeout` ao baixar | A internet oscilou durante o download. Rode o mesmo comando de novo: ele continua de onde parou. |

Só a porta do site é usada no computador, então um PostgreSQL ou outro servidor já instalado não atrapalha.

Os comandos abaixo também são rodados na pasta do projeto. Para desligar: `docker compose -f compose.avaliacao.yaml down`. Para apagar os dados e voltar ao estado inicial: `docker compose -f compose.avaliacao.yaml down -v` e subir de novo.

---

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

## Ambiente de desenvolvimento

Para só rodar o sistema, use o passo a passo do topo, em [Como executar (avaliação)](#-como-executar-avaliação). As seções abaixo são para quem vai desenvolver: o backend e o front rodam na máquina e atualizam a cada mudança.

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
winget install -e --id OpenJS.NodeJS.LTS
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
| Autenticação | `POST /api/auth/verificar-email`, `POST /api/auth/cadastro`, `POST /api/auth/cadastro-organizacao`, `POST /api/auth/login`, `GET /api/auth/eu` | Público / logado |
| Perfil do voluntário | `GET` e `PUT /api/voluntarios/eu` | Voluntário |
| Área da organização | `GET /api/organizacao`, `GET /api/organizacao/oportunidades` (+ `/{id}`, `/{id}/historico`, `/{id}/candidaturas`) | Gestor ou coordenador |
| Vagas | `POST /api/oportunidades`, `PUT /api/oportunidades/{id}`, `POST /api/oportunidades/{id}/publicar`, `/encerrar`, `/cancelar` | Gestor cria; responsável ou gestor alteram |
| Candidatura | `POST /api/oportunidades/{id}/candidaturas`, `GET /api/candidaturas/minhas`, `POST /api/candidaturas/{id}/cancelar` | Voluntário |
| Decisão | `POST /api/candidaturas/{id}/aceitar`, `/rejeitar` | Responsável ou gestor |
| Equipe | `GET` e `POST /api/organizacao/equipe`, `POST /api/organizacao/equipe/{id}/desativar` | Gestor |
| Painel | `GET /api/organizacao/painel` | Gestor (organização inteira) ou coordenador (só as vagas dele) |
| Participação | `POST /api/participacoes/{id}/presenca`, `/ausencia` | Responsável ou gestor |
| Histórico | `GET /api/participacoes/minhas` | Voluntário |

Erros sempre no formato `{ "status": 400, "mensagem": "...", "campos": [{ "campo": "...", "mensagem": "..." }] }`.

### Frontend

```
cd frontend
npm ci
npm run dev
```

### Teste de ponta a ponta

Com o projeto no ar pelo Docker (`docker compose -f compose.avaliacao.yaml up -d --build --wait`), o fluxo de demonstração roda no navegador com `npm run e2e` dentro de `frontend` (na primeira vez, `npx playwright install chromium`). Detalhes em [docs/testes.md](docs/testes.md#ponta-a-ponta-navegador).
