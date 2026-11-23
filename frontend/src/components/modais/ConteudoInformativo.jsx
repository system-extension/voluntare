/** Textos do rodapé. Descrevem o sistema como ele funciona de verdade, sem nada de demonstração. */
export default function ConteudoInformativo({ titulo, aoNavegar }) {
  switch (titulo) {
    case 'Ajuda':
      return (
        <>
          <h3 className="modal-subtitulo">Para voluntários</h3>
          <p>
            Busque por atividade, causa ou organização e filtre por cidade ou estado. Ao escolher
            uma vaga, veja as atividades, a data, o horário e as habilidades desejadas. Para se
            candidatar, entre ou crie a sua conta. Em “Minhas vagas” você acompanha as candidaturas,
            pode desistir e vê o histórico de horas.
          </p>
          <h3 className="modal-subtitulo">Para organizações</h3>
          <p>
            Cadastre a ONG e publique as vagas. Na área da organização você vê os candidatos, aceita
            ou recusa dentro do número de vagas e, depois da atividade, registra a presença e as
            horas de cada voluntário.
          </p>
          <button className="primary-button full-width" onClick={() => aoNavegar('/oportunidades')}>
            Pesquisar vagas
          </button>
          <button
            className="text-button full-width"
            onClick={() => aoNavegar('/para-organizacoes')}
          >
            Sou uma organização
          </button>
        </>
      );
    case 'Privacidade':
      return (
        <>
          <p>
            O Voluntare guarda os dados que você informa no cadastro e no perfil, como nome, e-mail,
            telefone, cidade, disponibilidade, habilidades e interesses. Eles servem para as
            organizações avaliarem as candidaturas.
          </p>
          <p>
            Quando você se candidata, a organização da vaga vê o seu nome, o seu contato e as suas
            habilidades. A senha é guardada criptografada e ninguém tem acesso a ela.
          </p>
          <p>
            Ao entrar, uma chave de acesso fica salva neste navegador por até 8 horas; “Sair” apaga
            essa chave. As vagas que você marca como salvas ficam só neste navegador.
          </p>
        </>
      );
    case 'Termos de uso':
      return (
        <>
          <p>
            O Voluntare é um projeto acadêmico da Fábrica de Software do curso de Engenharia de
            Software da UNIVILLE. Não há cobrança nem pagamento em nenhuma etapa.
          </p>
          <p>
            Cada organização é responsável pelas vagas que publica e pelo registro de presença e
            horas dos voluntários. Ao se candidatar, o voluntário se compromete a avisar pela
            plataforma se desistir, para que a vaga possa ser repassada.
          </p>
        </>
      );
    case 'Acessibilidade':
      return (
        <p>
          Você pode navegar usando o teclado, acessar os campos pelos seus rótulos e ampliar a
          página. No celular, selecione uma vaga para abrir os detalhes e use “Voltar às vagas” para
          retornar à lista.
        </p>
      );
    default:
      return null;
  }
}
