# Arquitetura — Voluntare

## Visão geral

O Voluntare segue uma arquitetura em camadas (frontend SPA + backend REST), com separação clara entre client e server.

```
┌──────────────┐       HTTP/JSON        ┌──────────────────┐
│   Frontend   │  ◄──────────────────►  │     Backend      │
│  React/Vite  │                        │  Spring Boot 3.x │
└──────────────┘                        └────────┬─────────┘
                                                 │ JPA
                                            ┌────▼────┐
                                            │ Postgres│
                                            └─────────┘
```

## Stack

| Camada    | Tecnologia                              | Justificativa                                                        |
|-----------|-----------------------------------------|----------------------------------------------------------------------|
| Frontend  | React 18 + Vite                         | Componentização, ecossistema amplo, build rápido                     |
| Backend   | Java 21, Spring Boot 3.x, Spring Data   | Padrão da disciplina, maturidade, facilidade de mapeamento OR        |
| Banco     | PostgreSQL                              | Open-source, robusto, boa integração com JPA                         |
| API       | REST/JSON, documentada com OpenAPI      | Desacoplamento front/back, fácil teste e documentação                |
| Testes    | JUnit 5 + Mockito                       | Padrão Spring, bom suporte a mocks e integração                     |

## Decisões importantes

Ver [decisoes.md](decisoes.md).
