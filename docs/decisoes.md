# Decisões e dúvidas

Itens de negócio dependem do Prof. Sestito (Cliente/PO). Itens técnicos podem ser questionados pelo Tech Lead.

Status usados:

- **Definida**: decisão técnica da equipe, justificada.
- **Definida pela equipe**: decisão de negócio tomada pela equipe para destravar o modelo. Pode ser revista pelo PO.
- **Adotada pela equipe, implementada no V1. Aguarda validação do PO**: proposta levada ao professor, ainda sem resposta registrada. O schema (`V1__schema_inicial.sql`) já segue a proposta; se o PO pedir ajuste, ele entra por nova migração.

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
| D-10 | Monólito modular por pacotes (módulo → camadas) | Spring Modulith | Domínio pequeno e prazo acadêmico. O Modulith exigiria aprendizado da equipe sem ganho proporcional. A estrutura por módulo permite migrar depois | Definida |
| D-11 | Responsável da vaga garantido por FK composta (`organizacao_id`, `responsavel_id`) → `usuario (organizacao_id, id)` | Só no service | O briefing pede regras críticas no service e, quando pertinente, no banco. Com uma linha de SQL o banco impede responsável de outra ONG ou voluntário como responsável | Definida |
| D-12 | Sem `criado_por` na oportunidade | Coluna `criado_por` | Quem criou já fica na linha de criação do `historico_status` (`status_anterior` nulo). Uma coluna a mais teria de ser mantida em sincronia | Definida |
| D-13 | Linha de criação única no histórico, por índice único parcial | Só no service | Garante uma linha de criação por oportunidade, candidatura e participação | Definida |
| D-14 | Massa de demonstração na migração `V2`, com datas relativas ao dia da migração | Datas fixas | As vagas futuras e encerradas continuam coerentes em qualquer dia de demonstração | Definida |
| D-15 | CI do backend no GitHub Actions (`mvnw verify` com Testcontainers) | Testar só localmente | Os testes do banco precisam de Docker, que nem toda máquina da equipe tem | Definida |

## 3. Perguntas de descoberta do briefing

| Pergunta | Proposta da equipe | Status |
|---|---|---|
| Quais dados são necessários no perfil do voluntário? | Nome, e-mail, telefone, cidade, disponibilidade em texto e habilidades/interesses. Sem CPF, endereço ou foto | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Quando a candidatura consome uma vaga? | Só quando é aceita. Candidatura pendente não ocupa vaga | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Como tratar desistência de voluntário confirmado? | Ele pode cancelar. Se houver tempo para substituição, a vaga volta. Se for tarde, a participação fica como cancelada tardia e a vaga não volta | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Quais indicadores o coordenador precisa? | Oportunidades abertas, preenchidas e encerradas, mais candidaturas pendentes | Adotada pela equipe, implementada no V1. Aguarda validação do PO |

## 4. Perguntas próprias da equipe

| ID | Pergunta | Proposta | Status |
|---|---|---|---|
| Q-01 | Qual o prazo mínimo para a vaga ser devolvida? | Parâmetro do sistema, sugestão de 48 horas antes do início | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-02 | Existe o conceito de organização? | Sim. Tabela `organizacao` (DER v2). A ONG se autocadastra e é a dona das vagas. Equipe com dois papéis: `GESTOR` (administrador da ONG) e `COORDENADOR`. Sem administrador da plataforma | Definida pela equipe |
| Q-03 | Quem foi rejeitado ou cancelou pode se candidatar de novo? | Não. Uma candidatura por voluntário e oportunidade | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-04 | O voluntário pode retirar uma candidatura pendente? | Sim, com status cancelada | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-05 | Quem encerra a oportunidade? | O coordenador, manualmente. Horas só podem ser registradas depois do fim da ação | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-06 | Quem cria os coordenadores? | O gestor da ONG, que também cria as vagas e define o responsável por cada uma. O coordenador só mexe nas vagas pelas quais responde; o gestor pode operar qualquer vaga da ONG. O voluntário se cadastra sozinho | Definida pela equipe |
| Q-07 | Uma oportunidade tem mais de uma data? | Não. Uma única ocorrência, com início e fim | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-08 | O que acontece com os confirmados se a oportunidade for cancelada? | Continuam no histórico e o cancelamento fica registrado | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-09 | As horas registradas podem passar da duração planejada da ação? | Não. O limite é a duração (fim menos início) | Adotada pela equipe, implementada no V1. Aguarda validação do PO |
| Q-10 | Existe vaga remota ou híbrida? | Não. Toda vaga é presencial, com local, cidade e UF obrigatórios | Definida pela equipe |
| Q-11 | Como a vaga é classificada? | Por causa (Educação, Meio ambiente, Assistência social, Animais, Comunicação), não por habilidade. As habilidades ficam só no perfil do voluntário | Definida pela equipe |
| Q-12 | A vaga pode ser salva antes de publicar? | Sim, como rascunho, só com o título. Ao publicar, os demais campos passam a ser obrigatórios | Definida pela equipe |

## 5. Dúvidas para o professor

- Confirmar as propostas marcadas como "Aguarda validação do PO" (seções 3 e 4).
- Q-11: o briefing (3.1) pede "habilidades desejadas" na oportunidade. A equipe decidiu classificar a vaga só por causa e manter as habilidades no perfil do voluntário. Confirmar que isso atende ao briefing. Se não atender, volta a tabela `oportunidade_habilidade` por nova migração.
- Q-02 e Q-06: o briefing cita o ator "Administrador" (gerencia usuários e parâmetros). No DER v2 não há administrador da plataforma: o gestor da ONG cadastra os coordenadores e os parâmetros mudam só por migração. Confirmar que isso atende ao briefing.

