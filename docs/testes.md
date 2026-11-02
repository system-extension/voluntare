# Plano e evidências de testes

Os testes rodam com `./mvnw verify` (Windows: `.\mvnw.cmd verify`) e no CI a cada PR (`.github/workflows/backend.yml`). Precisam do Docker: cada execução sobe um PostgreSQL 16 de verdade (Testcontainers), aplica todas as migrações do Flyway e usa a massa de demonstração da V8 e da V10.

## Como os testes são escritos

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
| 5. Horas > 0 e depois da data | `ParticipacaoControllerTest.naoRegistraAntesDoFimDaAtividade`, `horasPrecisamSerMaioresQueZero`, `horasNaoPassamDaDuracao`; `RestricoesBancoTest` ("horas zero", "PRESENTE sem horas") |
| 6. Desistência a tempo devolve a vaga | `CandidaturaControllerTest.desistirATempoDevolveAVaga`, `desistirEmCimaDaHoraNaoDevolveAVaga` |
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

| Classe | O que cobre |
|---|---|
| `banco/RestricoesBancoTest` | O banco recusa sozinho os dados que quebram o DER: papéis, FK composta do responsável, vaga incompleta, causa, vagas, período, candidatura duplicada, decisão, horas, histórico, exclusão física, habilidades |
| `banco/CargaDemonstracaoTest` | A massa de demonstração respeita as regras que ficam no service (vagas, histórico coerente, horas dentro da duração) |
| `auth/AuthControllerTest` | Cadastro do voluntário e da ONG, login, e-mail sem diferenciar maiúsculas, conta desativada, 401 |
| `oportunidade/OportunidadeControllerTest` | Busca pública: só abertas e futuras, ordem, vagas disponíveis, filtros sem acento, paginação, detalhe, habilidades, CORS, Swagger |
| `oportunidade/GestaoOportunidadeControllerTest` | Criar, rascunho, publicar, editar, encerrar, cancelar, responsável, habilidades desejadas, histórico, acesso |
| `candidatura/CandidaturaControllerTest` | Candidatar, aceitar, rejeitar, desistir (com o prazo), listas do voluntário e da ONG |
| `candidatura/CorridaPelaUltimaVagaTest` | Concorrência no aceite (regra 3) |
| `participacao/ParticipacaoControllerTest` | Presença, ausência, horas, histórico do voluntário |
| `voluntario/VoluntarioControllerTest` | Perfil, habilidades e interesses, catálogo |

## Ainda sem teste automatizado

- Telas do frontend (a integração com a API começa na Sprint 03).
- Painel da ONG e equipe (endpoints ainda não implementados).
