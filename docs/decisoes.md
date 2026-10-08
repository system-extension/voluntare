# Decisões e dúvidas

Tudo o que está marcado como "Proposta" foi sugerido pela equipe e ainda precisa de confirmação. Itens de negócio dependem do Prof. Sestito (Cliente/PO). Itens técnicos podem ser questionados pelo Tech Lead.

## 1. Organização da sprint

| Foco | Integrante |
|---|---|
| Coordenação técnica e integração | Marcus |
| Frontend / UX (fluxo de telas e mockups) | Marcus |
| Backend (stack e arquitetura) | Italo |
| Dados / modelagem (DER) | Rafael |
| Qualidade e documentação (checklist, `/docs`, texto do PR) | Gabriel |

Cada trilha é revisada por outra pessoa do grupo antes de entrar na `develop`.

## 2. Decisões técnicas

| ID | Decisão | Alternativa | Motivo | Status |
|---|---|---|---|---|
| D-01 | PostgreSQL | MySQL | CHECK, índices únicos e lock de linha para o controle de vagas | Definida |
| D-02 | Maven | Gradle | Mais simples para o grupo | Definida |
| D-03 | React + Vite | JavaScript puro | Componentes reaproveitáveis. O grupo precisa entender o código | Definida |
| D-04 | JWT (Bearer) | Sessão | Frontend e backend separados | Definida |
| D-05 | Flyway para migrações e carga inicial | `ddl-auto` do Hibernate | Schema versionado e massa de demonstração sem edição manual | Definida |
| D-06 | Figma para os mockups | Excalidraw | Exportação em PNG e link para revisão | Definida |
| D-07 | Vaga controlada por transação com lock da oportunidade | Trigger no banco | Regra fica no service, como pede o briefing | Definida |
| D-08 | PR com pelo menos uma revisão de outro integrante, `main` protegida | Commit direto | Exigência do briefing | Definida |
| D-09 | Spring Boot 3.5.x | Spring Boot 4.x | Exigido pelo briefing (seção 8). A 3.5 é a última linha do 3.x | Definida (briefing) |

## 3. Perguntas de descoberta do briefing

| Pergunta | Proposta da equipe | Status |
|---|---|---|
| Quais dados são necessários no perfil do voluntário? | Nome, e-mail, telefone, cidade, disponibilidade em texto e habilidades/interesses. Sem CPF, endereço ou foto | Validar com PO |
| Quando a candidatura consome uma vaga? | Só quando é aceita. Candidatura pendente não ocupa vaga | Validar com PO |
| Como tratar desistência de voluntário confirmado? | Ele pode cancelar. Se houver tempo para substituição, a vaga volta. Se for tarde, a participação fica como cancelada tardia e a vaga não volta | Validar com PO |
| Quais indicadores o coordenador precisa? | Oportunidades abertas, preenchidas e encerradas, mais candidaturas pendentes | Validar com PO |

## 4. Perguntas próprias da equipe

| ID | Pergunta | Proposta | Status |
|---|---|---|---|
| Q-01 | Qual o prazo mínimo para a vaga ser devolvida? | Parâmetro do sistema, sugestão de 48 horas antes do início | Validar com PO |
| Q-02 | Existe o conceito de organização? | Fora do MVP. O coordenador fica ligado direto às oportunidades | Validar com PO |
| Q-03 | Quem foi rejeitado ou cancelou pode se candidatar de novo? | Não. Uma candidatura por voluntário e oportunidade | Validar com PO |
| Q-04 | O voluntário pode retirar uma candidatura pendente? | Sim, com status cancelada | Validar com PO |
| Q-05 | Quem encerra a oportunidade? | O coordenador, manualmente. Horas só podem ser registradas depois do fim da ação | Validar com PO |
| Q-06 | Quem cria os coordenadores? | O administrador. O voluntário se cadastra sozinho | Validar com PO |
| Q-07 | Uma oportunidade tem mais de uma data? | Não. Uma única ocorrência, com início e fim | Validar com PO |
| Q-08 | O que acontece com os confirmados se a oportunidade for cancelada? | Continuam no histórico e o cancelamento fica registrado | Validar com PO |
| Q-09 | As horas registradas podem passar da duração planejada da ação? | Não. O limite é a duração (fim menos início) | Validar com PO |

## 5. Dúvidas para o professor

- Confirmar as propostas marcadas como "Validar com PO".

