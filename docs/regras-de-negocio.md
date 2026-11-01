# Regras de negócio

O que o sistema precisa garantir, em linguagem de negócio. Consultar junto com:

- [decisoes.md](decisoes.md): **por que** cada escolha foi feita (D-xx técnicas, Q-xx de negócio).
- [der/der.md](der/der.md): **como** o banco guarda os dados e quais restrições ele próprio garante.

Toda regra nova ou alterada entra aqui antes (ou junto) do código. Se a regra veio de uma decisão, a coluna *Origem* aponta para ela.

**Origem:** `B1`…`B7` = regras obrigatórias do briefing; `RNF` = requisito não funcional do briefing; `Q-xx`/`D-xx` = [decisoes.md](decisoes.md).
**Onde:** `banco` = restrição no PostgreSQL; `service` = regra no backend; `front` = só na interface.
**Situação:** ✅ implementada e coberta por teste · ⏳ a implementar · ❓ aguarda o PO.

## 1. Papéis e acesso

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-01 | Existem três papéis: voluntário, coordenador e gestor. Não há administrador da plataforma | Q-02 | banco | ✅ ❓ |
| RN-02 | Gestor e coordenador pertencem a uma organização; o voluntário não pertence a nenhuma | Q-02 | banco | ✅ |
| RN-03 | O gestor opera todas as vagas da sua organização; o coordenador só as vagas pelas quais responde | Q-06 | service | ✅ |
| RN-04 | Vaga ou candidatura de outra organização é tratada como inexistente (não revela que existe) | D-20 | service | ✅ |
| RN-05 | Tudo exige login, menos: busca e detalhe de vagas, entrar, cadastrar-se e a documentação da API | D-19 | service | ✅ |
| RN-06 | Conta desativada, ou de organização desativada, não entra. Quem é desativado depois de entrar perde o acesso na próxima ação | — | service | ✅ |

## 2. Contas

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-07 | O voluntário se cadastra sozinho; o perfil nasce junto com a conta | — | service | ✅ |
| RN-08 | A ONG se cadastra sozinha, junto com o seu primeiro gestor. Se um dos dois falhar, nenhum fica gravado | Q-02 | service | ✅ |
| RN-09 | Um e-mail por conta, sem diferenciar maiúsculas | — | banco + service | ✅ |
| RN-10 | Um nome por organização, sem diferenciar maiúsculas | — | banco + service | ✅ |
| RN-11 | Senha de 8 a 72 caracteres, guardada só como hash (BCrypt) | RNF | service | ✅ |
| RN-12 | Login errado tem sempre a mesma resposta, exista o e-mail ou não | — | service | ✅ |
| RN-13 | A sessão vale 8 horas; depois, a pessoa entra de novo | D-19 | service | ✅ |
| RN-14 | O gestor cadastra e desativa coordenadores da sua organização | Q-06 | service | ⏳ |
| RN-15 | Antes de desativar alguém, o gestor passa as vagas abertas dessa pessoa para outro responsável | — | service | ⏳ |

## 3. Oportunidade

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-16 | Só o gestor cria vagas. O responsável é um gestor ou coordenador ativo da mesma organização; se não for escolhido, é quem criou | Q-06 | banco + service | ✅ |
| RN-17 | Só o gestor troca o responsável de uma vaga | Q-06 | service | ✅ |
| RN-18 | Toda vaga é presencial: endereço, cidade e UF obrigatórios | Q-10 | banco + service | ✅ |
| RN-19 | A vaga tem uma única causa entre as cinco da interface. Retirar uma causa é só tirar do formulário; vagas antigas continuam com ela | Q-11, D-18 | banco + front | ✅ ❓ |
| RN-20 | A vaga pode ser salva como rascunho só com o título. Para ficar aberta precisa de descrição, causa, endereço, cidade, UF, início, fim e vagas | Q-12 | banco + service | ✅ |
| RN-21 | A vaga acontece uma vez: um início e um fim, com o fim depois do início | Q-07 | banco + service | ✅ |
| RN-22 | Ao abrir uma vaga, o início precisa estar no futuro. Na edição, só se o início for alterado | D-20 | service | ✅ |
| RN-23 | Vagas: de 1 a 999 | — | banco | ✅ |
| RN-24 | Fluxo de status: rascunho → aberta ou cancelada; aberta → encerrada ou cancelada. Encerrada e cancelada são finais | — | service | ✅ |
| RN-25 | Só rascunho e vaga aberta podem ser editados | — | service | ✅ |
| RN-26 | O número de vagas não pode ficar abaixo dos voluntários já confirmados | — | service | ✅ |
| RN-27 | O responsável (ou o gestor) encerra a vaga manualmente | Q-05 | service | ✅ |
| RN-28 | Cancelar uma vaga aberta não apaga candidaturas nem participações; o motivo, se houver, fica no histórico | Q-08 | service | ✅ |
| RN-29 | A busca pública mostra só vagas abertas, das mais recentes para as mais antigas, sem diferenciar acentos | D-17 | service | ✅ |
| RN-30 | O detalhe público mostra vagas abertas, encerradas e canceladas (vagas salvas pelo voluntário). Rascunho não aparece | — | service | ✅ |
| RN-31 | Vagas disponíveis = vagas − participações que ocupam lugar. Só a participação `CANCELADA` libera o lugar | B3, B6 | service | ✅ |
| RN-32 | A vaga pede habilidades desejadas | Briefing 3.1 | — | ❓ hoje a vaga não tem habilidades (Q-11) |

## 4. Candidatura

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-33 | Só voluntário se candidata | — | service | ✅ |
| RN-34 | Uma candidatura por voluntário e vaga. Quem foi rejeitado ou desistiu não se candidata de novo | B1, Q-03 | banco + service | ✅ ❓ |
| RN-35 | Só se candidata a vaga aberta que ainda não começou | B2 | service | ✅ |
| RN-36 | Pode se candidatar a vaga preenchida: fica pendente, como lista de espera | D-22 | service | ✅ |
| RN-37 | O responsável (ou o gestor) aceita ou rejeita; só candidatura pendente, só em vaga aberta | Q-06 | service | ✅ |
| RN-38 | Os confirmados nunca passam das vagas, nem com dois aceites ao mesmo tempo | B3, D-07, D-22 | service | ✅ |
| RN-39 | O aceite cria a participação confirmada na mesma operação | B4 | service | ✅ |
| RN-40 | A rejeição pode ter um motivo, que fica no histórico | — | service | ✅ |
| RN-41 | O voluntário pode retirar a candidatura enquanto ela está pendente | Q-04 | service | ✅ |

## 5. Participação

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-42 | Depois do aceite, desistir cancela a participação (a candidatura continua aceita) | B6 | service | ✅ |
| RN-43 | Desistir até 48 horas antes do início devolve a vaga (`CANCELADA`); depois disso, não devolve (`CANCELADA_TARDIA`). O prazo fica na tabela `parametro` | B6, Q-01 | service | ✅ ❓ |
| RN-44 | Depois que a atividade começou, o voluntário não desiste pelo sistema | D-22 | service | ✅ |
| RN-45 | Presença, ausência e horas só para participação confirmada, registradas pelo responsável da vaga ou pelo gestor | B4 | banco + service | ✅ |
| RN-46 | Presença e horas só depois do fim da atividade, e nunca em vaga cancelada | B5, Q-05 | service | ✅ |
| RN-47 | Horas maiores que zero, com até duas casas decimais, obrigatórias para presente e no máximo a duração da atividade (fim − início) | B5, Q-09 | banco + service | ✅ |
| RN-48 | Quem registrou e quando ficam gravados | RNF | banco + service | ✅ |
| RN-57 | O registro de presença ou ausência é definitivo: não há correção pelo sistema | D-23 | service | ✅ ❓ |

## 6. Histórico

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-49 | Nada é apagado: vagas, candidaturas e participações só mudam de status | B7 | banco | ✅ |
| RN-50 | Toda mudança de status grava quem fez, quando e, se houver, o motivo, na mesma operação da mudança. A primeira linha (status anterior vazio) diz quem criou | RNF | banco + service | ✅ |
| RN-51 | O voluntário vê o seu histórico de participações, com o total de horas das presenças | B7, MVP | service | ✅ |

## 7. Perfil do voluntário

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-52 | O voluntário mantém telefone, cidade, disponibilidade em texto livre e as suas habilidades e interesses | MVP | service | ⏳ |
| RN-53 | Uma habilidade é habilidade ou interesse da pessoa, nunca os dois | — | banco | ✅ |

## 8. Painel da organização

| ID | Regra | Origem | Onde | Situação |
|---|---|---|---|---|
| RN-54 | O painel mostra vagas em rascunho, abertas, preenchidas (aberta e sem lugar) e encerradas | MVP | service | ⏳ |
| RN-55 | Mostra participações por status e a soma de horas das presentes | MVP | service | ⏳ |
| RN-56 | O gestor vê a organização inteira; o coordenador, só as vagas pelas quais responde | Q-06 | service | ⏳ |

## Pontos em aberto com o PO

Detalhes em [decisoes.md](decisoes.md), seção 5.

- **RN-32:** o briefing pede habilidades desejadas na vaga; o modelo classifica só por causa.
- **RN-01:** o briefing cita um administrador; no modelo, o gestor da ONG faz esse papel.
- **RN-34, RN-43** e as demais marcadas ❓: propostas da equipe aguardando validação.
