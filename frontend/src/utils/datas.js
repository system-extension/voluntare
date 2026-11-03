const DIA_MS = 24 * 60 * 60 * 1000;

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** 9h, 14h30 */
function hora(data) {
  const minutos = data.getMinutes();
  return `${data.getHours()}h${minutos ? String(minutos).padStart(2, '0') : ''}`;
}

/** "sáb., 15 de nov. · 9h às 12h" */
export function formatarPeriodo(inicio, fim) {
  const i = new Date(inicio);
  const f = new Date(fim);
  return `${formatoData.format(i)} · ${hora(i)} às ${hora(f)}`;
}

/** "Anunciada hoje", "Anunciada há 1 dia", "Anunciada há 3 dias" */
export function textoPublicacao(criadoEm, agora = new Date()) {
  const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(new Date(criadoEm))) / DIA_MS);
  if (dias <= 0) return 'Anunciada hoje';
  return dias === 1 ? 'Anunciada há 1 dia' : `Anunciada há ${dias} dias`;
}

/** "1 vaga disponível", "3 vagas disponíveis", "Vagas preenchidas" */
export function textoVagas(disponiveis) {
  if (disponiveis <= 0) return 'Vagas preenchidas';
  return disponiveis === 1 ? '1 vaga disponível' : `${disponiveis} vagas disponíveis`;
}

/** Para os campos do formulário: data (aaaa-mm-dd) e hora (hh:mm) no fuso local. */
export function separarDataHora(iso) {
  if (!iso) return { data: '', hora: '' };
  const d = new Date(iso);
  const dois = (n) => String(n).padStart(2, '0');
  return {
    data: `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`,
    hora: `${dois(d.getHours())}:${dois(d.getMinutes())}`,
  };
}

/** Caminho inverso: data + hora locais → ISO (UTC), como a API guarda (timestamptz). */
export const juntarDataHora = (data, hora) => new Date(`${data}T${hora}`).toISOString();
