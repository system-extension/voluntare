import { Heart } from 'lucide-react';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">
          <Heart size={28} />
          <span>Voluntare</span>
        </div>
        <nav className="header__nav">
          <a href="#vagas">Vagas</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <main className="hero">
        <h1>Encontre sua próxima oportunidade de voluntariado</h1>
        <p>Conectamos voluntários a ONGs e projetos sociais que precisam de você.</p>
        <button className="btn btn--primary">Explorar vagas</button>
      </main>
    </div>
  );
}

export default App;
