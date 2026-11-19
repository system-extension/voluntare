# Documento de requisitos

Visão geral do que o Voluntare precisa fazer. O detalhe de cada regra está em [regras-de-negocio.md](regras-de-negocio.md), as escolhas em [decisoes.md](decisoes.md) e a prova de cada regra em [testes.md](testes.md).

## Problema

ONGs que trabalham com voluntários costumam controlar vagas, inscrições e presença por planilha e mensagem. Isso gera vaga ocupada além do limite, inscrição repetida e horas sem registro confiável. O Voluntare centraliza esse fluxo: a ONG publica a oportunidade, o voluntário se candidata, a ONG aceita até o limite de vagas e, depois da atividade, registra a presença e as horas.

## Atores

| Ator | O que faz |
|---|---|
| Voluntário | Mantém o perfil (contato, disponibilidade, habilidades e interesses), busca vagas, se candidata, desiste e acompanha o histórico de horas |
| Coordenador | Pessoa da ONG responsável por vagas: aceita ou rejeita candidaturas e registra presença e horas das vagas dele |
| Gestor | Dono da conta da ONG: cria e publica vagas, escolhe o responsável de cada uma, gerencia a equipe e vê o painel da organização inteira |

Não existe administrador da plataforma: o gestor cobre a gestão de usuários da ONG e os parâmetros mudam por migração (RN-01, validado com o PO).

## Requisitos funcionais (MVP)

| Código | Requisito | Regras |
|---|---|---|
| RF-01 | Cadastro e login com perfis de voluntário, coordenador e gestor | RN-01 a RN-12 |
| RF-02 | Cadastro da ONG junto com o primeiro gestor | RN-07 a RN-10 |
| RF-03 | Gestor cadastra e desativa coordenadores, passando as vagas em andamento para outra pessoa | RN-14, RN-15 |
| RF-04 | Perfil do voluntário com contato, disponibilidade, habilidades e interesses | RN-51 a RN-53, RN-58, RN-59 |
| RF-05 | Cadastro de oportunidade com título, descrição, causa, local, data, horário, número de vagas e habilidades desejadas, com rascunho e publicação | RN-16 a RN-24, RN-32 |
| RF-06 | Busca de vagas abertas com filtros por texto, local e causa | RN-29 a RN-31 |
| RF-07 | Candidatura do voluntário, com desistência | RN-33 a RN-36, RN-41 a RN-44 |
| RF-08 | Aceite e rejeição de candidaturas respeitando o limite de vagas | RN-37 a RN-40 |
| RF-09 | Registro de presença com horas ou de ausência depois da atividade | RN-45 a RN-48, RN-57 |
| RF-10 | Histórico do voluntário com o total de horas | RN-49, RN-50 |
| RF-11 | Painel da ONG com vagas por situação, candidaturas pendentes, participações e horas | RN-54 a RN-56 |

Fora do escopo do MVP: chat, notificações, certificados, avaliações e recomendação automática de vagas. As telas de mensagens e notificações existem só como prévia.

## Requisitos não funcionais

| Código | Requisito | Como foi atendido |
|---|---|---|
| RNF-01 | Java 21 e Spring Boot 3.x, monólito modular em camadas | [arquitetura.md](arquitetura.md) |
| RNF-02 | Banco relacional com as regras críticas garantidas também no banco | PostgreSQL com CHECK, índices únicos e lock de linha (D-01, D-07) |
| RNF-03 | Segurança: senha com hash, acesso por papel e dados de outra ONG invisíveis | Spring Security, JWT e BCrypt; outra ONG responde 404 (RN-04) |
| RNF-04 | Validação dos dados e erro padronizado | Bean Validation e resposta `{status, mensagem, campos}` |
| RNF-05 | Rastreabilidade: quem mudou o quê e quando | Tabela `historico_status`, sem exclusão física (RN-49, RN-50) |
| RNF-06 | API documentada | Swagger gerado do código |
| RNF-07 | Testes automatizados das regras | JUnit 5, Mockito, Testcontainers e Playwright, rodando no CI a cada PR |
| RNF-08 | Executar em qualquer computador | Um comando com o Docker, descrito no topo do [README](../README.md) |

## Regras obrigatórias do briefing e critérios de aceite

| Regra | Critério de aceite |
|---|---|
| 1. Sem candidatura duplicada | A segunda candidatura do mesmo voluntário na mesma vaga é recusada, mesmo depois de rejeição ou desistência |
| 2. Vaga encerrada ou cancelada não recebe candidatura | Candidatar-se a vaga que não está aberta, ou que já começou, é recusado |
| 3. Confirmados não passam do número de vagas | Com as vagas ocupadas, o aceite é recusado, inclusive com dois aceites ao mesmo tempo na última vaga |
| 4. Presença e horas só para candidatura aceita | Só existe participação para candidatura aceita, e só ela recebe presença ou ausência |
| 5. Horas maiores que zero e depois da atividade | Registro antes do fim, com zero horas ou com mais horas que a duração é recusado |
| 6. Desistência dentro do prazo devolve a vaga | Desistir até 48 horas antes do início libera a vaga; depois disso a desistência fica registrada e a vaga não volta |
| 7. Histórico permanece | Encerrar ou cancelar uma vaga não apaga candidaturas, participações nem horas do voluntário |

Os testes que provam cada critério estão em [testes.md](testes.md#regras-obrigatórias-do-briefing).
