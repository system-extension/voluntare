# Voluntare · frontend

Busca de oportunidades de voluntariado, área da organização e conta do voluntário.
React 19 + Vite, JavaScript, React Router.

Publicado em https://system-extension.github.io/voluntare/ a cada push na `develop` que altere `frontend/`.

## Rodar

Requer Node.js 20.19+ ou 22.12+.

```sh
cd frontend
npm install
npm run dev
```

## Backend

O frontend fala só com o backend Spring (não há mais modo demonstração). Antes do `npm run dev`, suba o banco e a API (ver o README da raiz): o Vite repassa `/api/...` para `http://localhost:8080`, então o navegador enxerga um endereço só e não precisa de CORS.

### Configuração (`.env`)

Copie `.env.example` para `.env.local` (fica fora do Git) só se precisar mudar algo:

| Variável       | Padrão                  | Para quê                                                                                                                                            |
| -------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | vazio                   | Endereço da API visto pelo navegador. Vazio = `/api` no mesmo endereço do site (proxy). Preenchido = chama direto e exige `CORS_ORIGENS` no backend |
| `API_ALVO`     | `http://localhost:8080` | Só no `npm run dev`: para onde o proxy do Vite repassa `/api`. Não vai para o navegador                                                             |
| `VITE_BASE`    | `/`                     | Pasta do site no servidor (`/voluntare/` no GitHub Pages)                                                                                           |

Só `src/api/cliente.js` faz `fetch`; os outros arquivos de `src/api` informam apenas o caminho (`/api/auth/login`).

Para entrar, use uma das contas da carga de demonstração (V8), todas com a senha `Voluntare@2026`:

| Papel       | E-mail                            |
| ----------- | --------------------------------- |
| Voluntário  | `fernanda@example.com`            |
| Gestor      | `ana@novoscaminhos.example.org`   |
| Coordenador | `bruno@novoscaminhos.example.org` |

## Sessão

- `POST /api/auth/login` devolve `{ token, expiraEm, usuario }`; isso fica no `localStorage` (`voluntare-sessao`), vale em todas as abas e até o token vencer (8h).
- Toda chamada de `src/api/cliente.js` manda `Authorization: Bearer <token>`. Se a API responder 401 com token, a sessão é apagada e a pessoa volta a ver "Acessar".
- Ao abrir o site com sessão salva, `GET /api/auth/eu` confere se a conta ainda vale.
- `RotaProtegida` esconde as telas de quem não pode vê-las: `/conta` só para voluntário, `/organizacao` só para gestor e coordenador. A segurança de verdade continua no backend.

## Comandos

| Comando          | Para quê                                   |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Servidor de desenvolvimento                |
| `npm run lint`   | Confere o código (rodar antes de abrir PR) |
| `npm run format` | Formata com Prettier                       |
| `npm run build`  | Gera a versão de produção em `dist/`       |

## Estrutura

```
src/
├── api/                    ← ÚNICA camada que conhece o backend
│   ├── cliente.js          fetch com token e erros no formato padrão da API
│   ├── sessao.js           token e usuário logado no localStorage
│   ├── auth.js             login e usuário logado (/api/auth)
│   ├── rotulos.js          códigos do backend → textos da tela (EDUCACAO → "Educação")
│   ├── oportunidades.js    busca, detalhe e área da organização
│   └── organizacoes.js
├── components/
│   ├── layout/             cabeçalho, rodapé e layout das páginas
│   ├── busca/              barra de busca (início e lista)
│   ├── oportunidades/      cartão, detalhe, filtro de causa e paginação
│   ├── modais/             conteúdo das janelas (informações, candidatura, confirmação)
│   ├── rotas/              RotaProtegida (exige login e papel)
│   └── ui/                 logo, modal, carregando, erro
├── context/                provedores: sessão (login), vagas salvas e modal
├── hooks/                  useCarregar, useModal, useConta, useVagasSalvas, useTitulo
├── pages/                  uma pasta por área, cada uma com o seu CSS
│   ├── inicio/
│   ├── oportunidades/
│   ├── organizacao/        lista, formulário e validação da oportunidade
│   └── conta/              perfil, minhas vagas, mensagens, notificações
├── styles/tema.css         cores, base e componentes comuns (botões, modal, abas)
└── utils/                  datas, textos e rotas
```

Fluxo: `index.html → main.jsx → App.jsx (rotas) → página → componentes → src/api`.

## Rotas

| Rota                                           | Tela                                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `/`                                            | Início                                                                       |
| `/entrar`                                      | Login e cadastro do voluntário (layout próprio, sem menus)                   |
| `/cadastro-organizacao`                        | Cadastro da ONG com o primeiro gestor                                        |
| `/oportunidades?q=&l=&causa=&pagina=`          | Busca: filtros na URL, lista e detalhe com candidatura                       |
| `/organizacao`                                 | Gestor e coordenador: painel, vagas por status, publicar, encerrar, cancelar |
| `/organizacao/nova`, `/organizacao/:id/editar` | Formulário da vaga: rascunho, publicação, habilidades e responsável          |
| `/organizacao/:id/candidatos`                  | Aceitar e rejeitar candidaturas, registrar presença ou ausência              |
| `/organizacao/equipe`                          | Só gestor: cadastrar e desativar coordenadores                               |
| `/conta/perfil`                                | Voluntário: contato, disponibilidade, habilidades e interesses               |
| `/conta/minhas-vagas`                          | Vagas salvas, candidaturas (com desistência) e histórico com as horas        |
| `/conta/mensagens`, `/conta/notificacoes`      | Prévias (não há backend para elas)                                           |

## Alinhamento com o DER

- **Oportunidade:** organização, responsável, causa, endereço, cidade, UF, início, fim, vagas, habilidades desejadas e status `RASCUNHO`, `ABERTA`, `ENCERRADA` ou `CANCELADA`. Toda ação é presencial.
- **Status:** encerrar e cancelar são definitivos; só rascunhos e vagas abertas podem ser editados.
- **Papéis:** o gestor cria vagas e cuida da equipe; o coordenador só vê e opera as vagas pelas quais responde.

## Observações

- Só as vagas salvas ficam no `localStorage` deste navegador; o resto vem da API.
- Cada arquivo em `src/api/*.js` corresponde a um controller do backend.
