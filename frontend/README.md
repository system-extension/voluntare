# Voluntare — frontend

Interface em React e Vite para a busca e a divulgação de oportunidades de voluntariado. A identidade utiliza verde.

## Executar localmente

Requisitos: Node.js 20.19+ ou 22.12+ e npm.

```sh
cd frontend
npm install
npm run dev
```

Abra o endereço informado pelo servidor. Para gerar a versão de produção, execute `npm run build`. Para conferi-la localmente, execute `npm run preview`.

## Incluído

- Página inicial, busca por atividade/organização e local.
- Filtros por causa e formato, 15 oportunidades por página e painel de detalhes.
- Navegação de páginas pela URL e suporte aos botões de voltar/avançar do navegador.
- Vagas salvas no armazenamento local do navegador.
- Interface responsiva e navegação por teclado.
- Perfil de demonstração com edição em memória, preferências, vagas salvas, mensagens e notificações.
- Área **ONGs/Anunciar vagas** com formulário validado, prévia, rascunhos, edição, encerramento e reabertura. Anúncios ativos aparecem na busca e podem ser salvos pelo voluntário.

Os anúncios da organização são guardados em `localStorage` sob a chave `voluntare-organization-jobs-v1`. Não são publicados na internet nem compartilhados entre dispositivos. A rota direta é `/?screen=organization`.

Para conhecer as telas da área de conta, clique em **Acessar → Entrar na demonstração**. Perfil e preferências usam exemplos fictícios; ainda não há autenticação. A seleção de currículo não transmite nem armazena o arquivo.

As 30 oportunidades e organizações em `src/data.js` são fictícias. Login, publicação e envio de candidaturas ainda não estão integrados ao backend; a interface informa essa limitação e não coleta credenciais.

Nenhuma publicação ou configuração de serviço externo é necessária para executar este frontend.
