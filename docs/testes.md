# Plano e evidências de testes

Os testes rodam com `./mvnw verify` (JDK 21) (Windows: `.\mvnw.cmd verify`) e no CI a cada PR (`.github/workflows/backend.yml`). Precisam do Docker: cada execução sobe um PostgreSQL 16 de verdade (Testcontainers), aplica todas as migrações do Flyway e usa a massa de demonstração da V8 e da V10.

## Pirâmide de testes

Três camadas, cada uma no lugar em que faz sentido:

| Camada | Ferramentas | O que testa | Por que nesta camada |
|---|---|---|---|
| **Unitário** | JUnit 5 + AssertJ, sem Spring e sem banco | Regras que dependem só do próprio objeto: fluxo de status, campos para publicar, prazo de devolução, troca de habilidades, normalização da busca, UUID v7 | Roda em milissegundos e aponta exatamente a regra que quebrou |
| **Service com Mockito** | JUnit 5 + Mockito | Decisões do service que dependem de datas e números, não do banco: limite de horas pela duração, presença antes do fim, leitura do prazo | O repositório, o acesso e o histórico são simulados; o teste confere a decisão e o que o service mandou gravar |
| **Integração** | `@SpringBootTest` + MockMvc + Testcontainers (PostgreSQL 16) | Fluxos completos pela API: segurança, validação, regras, banco e histórico | As regras críticas dependem do banco (`SELECT ... FOR UPDATE`, índices únicos, CHECK, `unaccent`); só um PostgreSQL de verdade prova que funcionam |

O Mockito não é usado onde a regra depende do banco: um repositório simulado diria que o service chamou o método certo, mas não provaria, por exemplo, que dois aceites simultâneos não passam do limite.

## Cobertura

O `mvnw verify` gera o relatório do JaCoCo em `backend/target/site/jacoco/index.html` (abra no navegador). Ficam de fora só a classe de entrada (`VoluntareApplication`) e a configuração do Swagger.

## Como os testes de integração são escritos

- **Integração de ponta a ponta.** `@SpringBootTest` sobe a aplicação inteira; o `MockMvc` faz as requisições HTTP passando pelo filtro de segurança, pela validação e pelo tratador de erros. O login é feito de verdade em cada teste.
- **Banco real.** CHECK, índices únicos, `unaccent` e `SELECT ... FOR UPDATE` só existem no PostgreSQL; um banco em memória deixaria passar erros.
- **Cada teste desfaz o que gravou** (`@Transactional`). A exceção é o teste de concorrência, que precisa de transações reais e descarta o banco no fim (`@DirtiesContext`).
- **Personagens da massa de demonstração.** Ana (gestora), Bruno e Carla (coordenadores), Diego (gestor de outra ONG), Fernanda, Gustavo e Helena (voluntários). A classe `Demo` guarda os ids legíveis (`vaga(1)`, `usuario(2)`).

## Regras obrigatórias do briefing

| Regra | Testes que a garantem |
|---|---|
| 1. Sem candidatura duplicada | `CandidaturaControllerTest.naoSeCandidataDuasVezes`; `RestricoesBancoTest` ("candidatura duplicada") |
| 2. Encerrada ou cancelada não recebe candidatura | `CandidaturaControllerTest.soSeCandidataAVagaAberta`; `OportunidadeControllerTest.vagaQueJaComecouSaiDaBusca` |
| 3. Confirmados não passam das vagas | `CandidaturaControllerTest.naoAceitaQuandoAsVagasAcabaram`; `CorridaPelaUltimaVagaTest.doisAceitesAoMesmoTempoNaoPassamDaUltimaVaga` (dois aceites simultâneos numa vaga de 1 lugar) |
| 4. Presença e horas só para aceitos | `ParticipacaoControllerTest.registroEhDefinitivoESoParaConfirmada`; `CandidaturaControllerTest.aceitarCriaAParticipacaoEOcupaUmaVaga` |
| 5. Horas > 0 e depois da data | `ParticipacaoControllerTest.naoRegistraAntesDoFimDaAtividade`, `horasPrecisamSerMaioresQueZero`, `horasNaoPassamDaDuracao`; `ParticipacaoServiceTest.horasAcimaDaDuracaoNaoGravamNada`, `antesDoFimDaAtividadeEhConflito`; `RestricoesBancoTest` ("horas zero", "PRESENTE sem horas") |
| 6. Desistência a tempo devolve a vaga | `CandidaturaControllerTest.desistirATempoDevolveAVaga`, `desistirEmCimaDaHoraNaoDevolveAVaga`; `ParticipacaoTest` (antes, no e depois do limite); `ParametroServiceTest` |
| 7. Histórico permanece | `ParticipacaoControllerTest.voluntarioVeOHistoricoComOTotalDeHoras` (inclui vaga encerrada); `RestricoesBancoTest` ("excluir oportunidade com histórico"); `GestaoOportunidadeControllerTest.cancelarGuardaOMotivoNoHistorico` |

## Permissões por papel

| Situação | Resposta esperada | Testes |
|---|---|---|
| Sem login em rota protegida | 401 | `AuthControllerTest.semTokenOuComTokenInvalidoResponde401NoFormatoPadrao`, `GestaoOportunidadeControllerTest.soOGestorCria`, `VoluntarioControllerTest.perfilEhSoDoVoluntario` |
| Papel errado (voluntário na área da ONG, equipe no perfil) | 403 | `GestaoOportunidadeControllerTest.gestorVeTodasAsVagasDaOrganizacaoECoordenadorSoAsDele`, `CandidaturaControllerTest.equipeDaOrganizacaoNaoSeCandidata`, `ParticipacaoControllerTest.historicoEhSoDoVoluntario` |
| Coordenador em vaga que não é dele | 403 | `GestaoOportunidadeControllerTest.responsavelEditaASuaVagaMasNaoADosOutros`, `CandidaturaControllerTest.soOResponsavelOuOGestorDecidem`, `ParticipacaoControllerTest.soOResponsavelOuOGestorRegistram` |
| Vaga de outra ONG | 404 | os mesmos três acima |
| Conta desativada | 403 no login, 401 depois | `AuthControllerTest.contaDesativadaNaoEntra`, `contaDesativadaDepoisDoLoginPerdeOAcesso` |

## Classes de teste

| Classe | Camada | O que cobre |
|---|---|---|
| `banco/RestricoesBancoTest` | Integração | O banco recusa sozinho os dados que quebram o DER: papéis, FK composta do responsável, vaga incompleta, causa, vagas, período, candidatura duplicada, decisão, horas, histórico, exclusão física, habilidades |
| `banco/CargaDemonstracaoTest` | Integração | A massa de demonstração respeita as regras que ficam no service (vagas, histórico coerente, horas dentro da duração) |
| `auth/AuthControllerTest` | Integração | Cadastro do voluntário e da ONG, login, e-mail sem diferenciar maiúsculas, conta desativada, 401 |
| `oportunidade/OportunidadeControllerTest` | Integração | Busca pública: só abertas e futuras, ordem, vagas disponíveis, filtros sem acento, paginação, detalhe, habilidades, CORS, Swagger |
| `oportunidade/GestaoOportunidadeControllerTest` | Integração | Criar, rascunho, publicar, editar, encerrar, cancelar, responsável, habilidades desejadas, histórico, acesso |
| `candidatura/CandidaturaControllerTest` | Integração | Candidatar, aceitar, rejeitar, desistir (com o prazo), listas do voluntário e da ONG |
| `candidatura/CorridaPelaUltimaVagaTest` | Integração | Concorrência no aceite (regra 3) |
| `participacao/ParticipacaoControllerTest` | Integração | Presença, ausência, horas, histórico do voluntário |
| `voluntario/VoluntarioControllerTest` | Integração | Perfil, habilidades e interesses, catálogo |
| `oportunidade/entity/StatusOportunidadeTest` | Unitário | Fluxo de status da vaga (10 transições) |
| `oportunidade/entity/OportunidadeTest` | Unitário | Campos para publicar, início no futuro, período, texto em branco, fluxo |
| `participacao/entity/ParticipacaoTest` | Unitário | Regra 6 nos dois lados do prazo e no limite exato; presença definitiva |
| `voluntario/entity/PerfilVoluntarioTest` | Unitário | Troca de habilidades e interesses só pela diferença |
| `shared/util/TextosTest` | Unitário | Busca sem acento e escape dos curingas do LIKE |
| `shared/util/UuidV7Test` | Unitário | Versão, variante e ordem dos UUID v7 |
| `participacao/service/ParticipacaoServiceTest` | Mockito | Limite de horas pela duração, vaga cancelada, presença antes do fim |
| `parametro/service/ParametroServiceTest` | Mockito | Prazo de devolução lido da tabela `parametro` |

## Ainda sem teste automatizado

- Telas do frontend (a integração com a API começa na Sprint 03).
- Painel da ONG e equipe (endpoints ainda não implementados).
