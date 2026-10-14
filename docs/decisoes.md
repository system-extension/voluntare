# Decisões e Dúvidas — Voluntare

Registro das decisões técnicas e de design tomadas ao longo do projeto.

## Decisões

| #   | Data       | Decisão                                                     | Motivo                                       |
|-----|------------|-------------------------------------------------------------|----------------------------------------------|
| D01 | 2026-10    | Frontend com React + Vite (sem Next.js)                     | SPA simples, sem necessidade de SSR           |
| D02 | 2026-10    | Mockups feitos externamente (PDF)                           | Rapidez na prototipação inicial               |
| D03 | 2026-10    | Monorepo com `/frontend`, `/backend` e `/docs`              | Facilita revisão e CI num projeto acadêmico   |

## Dúvidas em aberto

- Definir estratégia de autenticação (JWT vs sessão)
- Hospedagem de produção (Render, Railway, etc.)
