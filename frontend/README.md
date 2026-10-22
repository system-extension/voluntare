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

## Dois modos

| Modo                      | Como ligar                                                                          | De onde vêm os dados                             |
| ------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Demonstração** (padrão) | nada a fazer                                                                        | Do próprio navegador (`src/api/mock`)            |
| **API real**              | criar `frontend/.env.local` com `VITE_USAR_API=true` e subir o backend (porta 8080) | Do Spring Boot (`/api/...`, repassado pelo Vite) |

As telas não sabem em qual modo estão: elas só chamam funções de `src/api/`. Trocar de modo não exige mexer em tela.

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
│   ├── config.js           chave VITE_USAR_API (demonstração × API real)
│   ├── cliente.js          fetch com token e erros no formato padrão da API
│   ├── rotulos.js          códigos do backend → textos da tela (EDUCACAO → "Educação")
│   ├── oportunidades.js    busca, detalhe e área da organização
│   ├── organizacoes.js
│   └── mock/               "backend de mentira" do modo demonstração
├── components/
│   ├── layout/             cabeçalho, rodapé e layout das páginas
│   ├── busca/              barra de busca (início e lista)
│   ├── oportunidades/      cartão, detalhe, filtro de causa e paginação
│   ├── modais/             conteúdo das janelas (informações, candidatura, confirmação)
│   └── ui/                 logo, modal, carregando, erro
├── context/                provedores: conta de demonstração, vagas salvas e modal
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

| Rota                                           | Tela                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| `/`                                            | Início                                                    |
| `/oportunidades?q=&l=&causa=&pagina=`          | Busca: filtros na URL, lista e detalhe                    |
| `/organizacao`                                 | Área da organização: vagas por status, encerrar, cancelar |
| `/organizacao/nova`, `/organizacao/:id/editar` | Formulário da oportunidade                                |
| `/conta/perfil`, `/conta/preferencias`         | Perfil de demonstração                                    |
| `/conta/minhas-vagas`                          | Vagas salvas                                              |
| `/conta/mensagens`, `/conta/notificacoes`      | Prévias                                                   |

## Alinhamento com o DER

- **Oportunidade:** organização, causa, endereço, cidade, UF, início, fim, vagas e status `ABERTA`, `ENCERRADA` ou `CANCELADA`. Toda ação é presencial.
- **Status:** encerrar e cancelar são definitivos; só oportunidades abertas podem ser editadas.
- **Ainda não alinhado:** o perfil do voluntário e as telas do administrador serão refeitos depois.

## Observações

- As organizações e oportunidades do modo demonstração são fictícias. A área da organização age em nome da organização de id 1.
- Vagas salvas e anúncios criados ficam no `localStorage` deste navegador.
- Os endereços em `src/api/*.js` são a proposta de contrato com o backend.
