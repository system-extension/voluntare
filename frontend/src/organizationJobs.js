export const ORGANIZATION_JOBS_KEY = 'voluntare-organization-jobs-v1';
export const jobCauses = ['Educação', 'Meio ambiente', 'Assistência social', 'Animais', 'Comunicação'];
export const jobModes = ['Presencial', 'Remoto', 'Híbrido'];
export const emptyJob = { title: '', organization: '', cause: 'Educação', mode: 'Presencial', location: '', hours: '', slots: '1', description: '', activities: '', requirements: '' };

export function validateJob(job, status) {
  const errors = {};
  if (!job.title.trim()) errors.title = 'Informe o título da oportunidade.';
  if (!job.organization.trim()) errors.organization = 'Informe o nome da ONG ou do projeto.';
  if (status === 'active') {
    if (!jobCauses.includes(job.cause)) errors.cause = 'Selecione uma causa.';
    if (!jobModes.includes(job.mode)) errors.mode = 'Selecione um formato.';
    if (job.mode !== 'Remoto' && !job.location.trim()) errors.location = 'Informe a cidade e o estado.';
    if (!job.hours.trim()) errors.hours = 'Informe o tempo de dedicação.';
    if (!Number.isInteger(Number(job.slots)) || Number(job.slots) < 1 || Number(job.slots) > 999) errors.slots = 'Informe de 1 a 999 participantes.';
    if (job.description.trim().length < 40) errors.description = 'Descreva a oportunidade em pelo menos 40 caracteres.';
  }
  return errors;
}

export function prepareJob(form, status, existing, now = Date.now()) {
  const fields = Object.fromEntries(Object.keys(emptyJob).map(key => [key, String(form[key] ?? '').trim()]));
  return { ...fields, location: form.mode === 'Remoto' ? 'Remoto' : fields.location, id: existing?.id ?? now, status, createdAt: existing?.createdAt ?? now, updatedAt: now, local: true, published: 'Anúncio local' };
}

export function parseOrganizationJobs(raw) {
  const data = JSON.parse(raw || '[]');
  if (!Array.isArray(data)) throw new Error('Formato inválido');
  return data.filter(job => job && Number.isSafeInteger(job.id) && job.id > 30 && ['draft', 'active', 'closed'].includes(job.status) && Object.keys(emptyJob).every(key => typeof job[key] === 'string') && Object.keys(validateJob(job, job.status)).length === 0).map(job => ({ ...job, local: true, published: 'Anúncio local' }));
}
