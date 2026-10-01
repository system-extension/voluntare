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
- Frontend: HTML, CSS e JavaScript (React + Vite, a confirmar)
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

A definir nas próximas sprints, quando backend e frontend estiverem criados.
