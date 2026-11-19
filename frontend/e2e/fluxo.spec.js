import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';

/**
 * Fluxo de demonstração (docs/mockups/README.md), com os usuários da massa de demonstração:
 * a gestora publica a vaga, a voluntária se candidata, o coordenador aceita e, depois da
 * atividade, registra a presença, e a voluntária vê as horas no histórico.
 */
test.describe.configure({ mode: 'serial' });

const SENHA = 'Voluntare@2026';
const ANA = 'ana@novoscaminhos.example.org';
const BRUNO = 'bruno@novoscaminhos.example.org';
const FERNANDA = 'fernanda@example.com';
const TITULO = `Mutirão de leitura ${Date.now()}`;

/** Roda SQL no PostgreSQL do compose.avaliacao.yaml. Só para simular que a atividade já aconteceu. */
function sql(comando) {
  execSync(`docker compose -f compose.avaliacao.yaml exec -T postgres psql -U voluntare -d voluntare -v ON_ERROR_STOP=1`, {
    cwd: '..',
    input: comando,
  });
}

async function entrar(page, email) {
  await page.goto('/entrar');
  await page.locator('#acesso-email').fill(email);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.locator('#acesso-senha').fill(SENHA);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

function daquiA(dias) {
  const d = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  const dois = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

test('gestora publica uma vaga com habilidade e responsável', async ({ page }) => {
  await entrar(page, ANA);
  await expect(page).toHaveURL(/\/organizacao/);
  await expect(page.locator('.ong-stats')).toContainText('Vagas abertas');

  await page.getByRole('button', { name: 'Anunciar uma vaga' }).click();
  await page.getByLabel('Título da vaga').fill(TITULO);
  await page.getByLabel('Número de vagas').fill('1');
  await page.getByLabel('Endereço').fill('Rua XV de Novembro, 1200');
  await page.getByLabel('Cidade').fill('Joinville');
  await page.getByLabel('Data da ação').fill(daquiA(3));
  await page.getByLabel('Início').fill('09:00');
  await page.getByLabel('Término').fill('12:00');
  await page
    .getByLabel('Descrição da oportunidade')
    .fill('Leitura em voz alta com crianças do bairro, com rodas de conversa no final.');
  await page.locator('.ong-habilidades button').first().click();
  await page
    .getByLabel('Responsável pela vaga')
    .selectOption({ label: 'Bruno Costa (coordenador)' });
  await page.getByRole('button', { name: 'Publicar vaga' }).click();

  await expect(page.getByText('Vaga publicada na busca.')).toBeVisible();
  const linha = page.locator('.ong-job-row', { hasText: TITULO });
  await expect(linha).toContainText('Bruno Costa');
});

test('voluntária encontra a vaga e se candidata', async ({ page }) => {
  await entrar(page, FERNANDA);
  await page.goto(`/oportunidades?q=${encodeURIComponent(TITULO)}`);

  const detalhe = page.getByLabel('Detalhes da vaga');
  await expect(detalhe.getByRole('heading', { name: TITULO })).toBeVisible();
  await expect(detalhe).toContainText('Habilidades desejadas');
  await expect(detalhe).toContainText('Bruno Costa');

  await detalhe.getByRole('button', { name: 'Quero me candidatar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Enviar candidatura' }).click();
  await expect(page.getByRole('dialog')).toContainText('Candidatura enviada');
  await page.getByRole('dialog').getByRole('button', { name: 'Ver minhas candidaturas' }).click();

  const candidatura = page.locator('.saved-job', { hasText: TITULO });
  await expect(candidatura).toContainText('Aguardando a organização');
});

test('coordenador aceita a candidatura', async ({ page }) => {
  await entrar(page, BRUNO);
  await page
    .locator('.ong-job-row', { hasText: TITULO })
    .getByRole('button', { name: 'Candidatos' })
    .click();

  const fernanda = page.locator('.ong-job-row', { hasText: 'Fernanda Lima' });
  await fernanda.getByRole('button', { name: 'Aceitar' }).click();
  await expect(page.getByText('Fernanda Lima confirmado na vaga.')).toBeVisible();
  await expect(fernanda).toContainText('Confirmada');
});

test('depois da atividade, o coordenador registra a presença', async ({ page }) => {
  sql(
    `UPDATE oportunidade SET inicio = now() - interval '5 hours', fim = now() - interval '2 hours' WHERE titulo = '${TITULO}';`,
  );
  await entrar(page, BRUNO);
  await page
    .locator('.ong-job-row', { hasText: TITULO })
    .getByRole('button', { name: 'Candidatos' })
    .click();

  const fernanda = page.locator('.ong-job-row', { hasText: 'Fernanda Lima' });
  await fernanda.getByLabel('Horas').fill('2,5');
  await fernanda.getByRole('button', { name: 'Presente' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Registrar presença' }).click();
  await expect(page.getByText('Presença de Fernanda Lima registrada.')).toBeVisible();
  await expect(fernanda).toContainText('2,5 h');
});

test('voluntária vê a participação e as horas no histórico', async ({ page }) => {
  await entrar(page, FERNANDA);
  await page.goto('/conta/minhas-vagas');
  await page.getByRole('button', { name: /Histórico/ }).click();

  const participacao = page.locator('.saved-job', { hasText: TITULO });
  await expect(participacao).toContainText('Presente');
  await expect(participacao).toContainText('2,5 h');
});

test('voluntária edita o perfil', async ({ page }) => {
  await entrar(page, FERNANDA);
  await page.goto('/conta/perfil');
  await page.getByRole('button', { name: 'Editar perfil' }).click();
  await page.getByLabel('Disponibilidade').fill('Sábados de manhã');
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  await expect(page.getByText('Sábados de manhã')).toBeVisible();
});

test('gestora cadastra e desativa um coordenador', async ({ page }) => {
  const email = `paulo.${Date.now()}@novoscaminhos.example.org`;
  await entrar(page, ANA);
  await page.getByRole('button', { name: 'Equipe', exact: true }).click();

  await page.getByLabel('Nome').fill('Paulo Teste');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha inicial (8 a 72 caracteres)').fill('inicial123');
  await page.getByRole('button', { name: 'Cadastrar coordenador' }).click();
  await expect(page.getByText('Paulo Teste cadastrado.')).toBeVisible();

  const paulo = page.locator('.ong-job-row', { hasText: email });
  await paulo.getByRole('button', { name: 'Desativar' }).click();
  await paulo.getByRole('button', { name: 'Confirmar desativação' }).click();
  await expect(page.getByText('Paulo Teste desativado.')).toBeVisible();
  await expect(paulo).toContainText('Desativado');
});
