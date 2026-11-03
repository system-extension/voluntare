import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Campo com rótulo, erro ligado por aria-describedby e dica opcional. */
export function Campo({ id, rotulo, erro, dica, children }) {
  const descricao = [erro && `${id}-erro`, dica && `${id}-dica`].filter(Boolean).join(' ');
  return (
    <div className="acesso-campo">
      <label htmlFor={id}>
        {rotulo} <span aria-hidden="true">*</span>
      </label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descricao || undefined })}
      {dica && !erro && (
        <span id={`${id}-dica`} className="acesso-campo-dica">
          {dica}
        </span>
      )}
      {erro && (
        <span id={`${id}-erro`} className="acesso-campo-erro">
          {erro}
        </span>
      )}
    </div>
  );
}

/** Senha com botão de mostrar/esconder. `novaSenha` muda o autocomplete (gerenciador de senhas). */
export function CampoSenha({ id, rotulo = 'Senha', valor, aoAlterar, erro, dica, novaSenha }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <Campo id={id} rotulo={rotulo} erro={erro} dica={dica}>
      {(attrs) => (
        <div className="acesso-senha">
          <input
            {...attrs}
            type={visivel ? 'text' : 'password'}
            autoComplete={novaSenha ? 'new-password' : 'current-password'}
            autoFocus
            value={valor}
            onChange={aoAlterar}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={visivel ? 'Esconder a senha' : 'Mostrar a senha'}
            aria-pressed={visivel}
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      )}
    </Campo>
  );
}

/** E-mail já informado no 1º passo, com a opção de trocar. */
export function EmailEscolhido({ email, aoTrocar }) {
  return (
    <div className="acesso-email-escolhido">
      <span>{email}</span>
      <button type="button" className="text-button" onClick={aoTrocar}>
        Alterar
      </button>
    </div>
  );
}
