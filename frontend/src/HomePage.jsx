import { ArrowRight, BookOpen, Heart, HeartHandshake, Leaf, PawPrint, Megaphone, MapPin, Clock3, Search, Bookmark, Sparkles } from 'lucide-react';

const causes = [
  ['Educação', BookOpen, 'Compartilhe conhecimento.'],
  ['Meio ambiente', Leaf, 'Cuide do nosso futuro.'],
  ['Assistência social', Heart, 'Acolha quem precisa.'],
  ['Animais', PawPrint, 'Dê voz a quem não tem.'],
  ['Comunicação', Megaphone, 'Faça boas causas chegarem longe.'],
];

export function HomeIntro() {
  return <section className="home-intro" aria-labelledby="home-title">
    <div className="hero-copy"><span className="eyebrow"><span /> Pequenas atitudes. Grandes mudanças.</span><h1 id="home-title">Seu tempo pode<br />mudar <em>uma história.</em></h1><p>Encontre uma causa que combina com você e transforme sua vontade de ajudar em ação.</p></div>
    <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-symbol"><HeartHandshake size={84} strokeWidth={1.3} /></div><span className="art-label label-one"><Leaf size={19} /> Um mundo mais verde</span><span className="art-label label-two"><Heart size={19} /> Mais conexões, mais impacto</span><span className="art-spark"><Sparkles size={26} /></span></div>
  </section>;
}

export default function HomePage({ jobs, onSearch, onOpenJob, onOrganization, saved, onSave }) {
  return <div className="home-sections">
    <div className="search-hints"><span>Explore também:</span>{['Educação', 'Animais', 'Meio ambiente'].map(cause => <button key={cause} onClick={() => onSearch(cause, '')}>{cause}<ArrowRight size={13} /></button>)}<button onClick={() => onSearch('', 'Remoto')}>Voluntariado remoto<ArrowRight size={13} /></button></div>
    <section className="cause-section" aria-labelledby="causes-title"><div className="section-heading"><div><span className="eyebrow">Encontre seu propósito</span><h2 id="causes-title">Qual causa move você?</h2></div><p>Há muitas formas de fazer a diferença.<br />Escolha por onde começar.</p></div><div className="cause-grid">{causes.map(([name, Icon, description]) => <button className="cause-card" key={name} onClick={() => onSearch(name, '')}><span className="cause-icon"><Icon size={25} strokeWidth={1.7} /></span><strong>{name}</strong><span>{description}</span><span className="cause-link">Explorar oportunidades <ArrowRight size={16} /></span></button>)}</div></section>
    <section className="featured-section" aria-labelledby="featured-title"><div className="section-heading"><div><span className="eyebrow">Seu próximo passo</span><h2 id="featured-title">Uma oportunidade de fazer o bem</h2></div><button className="text-button" onClick={() => onSearch('', '')}>Ver todas as vagas <ArrowRight size={18} /></button></div><div className="featured-grid">{jobs.slice(0, 3).map(job => <article className="featured-card" key={job.id}><div className="featured-top"><span className="cause-pill">{job.cause}</span><button className={`icon-button ${saved.includes(job.id) ? 'saved' : ''}`} aria-label={`${saved.includes(job.id) ? 'Remover dos salvos' : 'Salvar'}: ${job.title}`} aria-pressed={saved.includes(job.id)} onClick={() => onSave(job.id)}><Bookmark size={20} fill={saved.includes(job.id) ? 'currentColor' : 'none'} /></button></div><span className="featured-org">{job.organization}</span><h3><button onClick={() => onOpenJob(job)}>{job.title}</button></h3><p><MapPin size={16} />{job.location}</p><p><Clock3 size={16} />{job.hours}</p><div className="featured-bottom"><span>{job.mode}</span><button className="text-button" onClick={() => onOpenJob(job)}>Conhecer vaga <ArrowRight size={17} /></button></div></article>)}</div><p className="sample-caption">Explore as vagas de exemplo e conheça a experiência Voluntare.</p></section>
    <section className="how-section" aria-labelledby="how-title"><div><span className="eyebrow">Do interesse à ação</span><h2 id="how-title">O primeiro passo<br />é mais simples<br />do que parece.</h2><button className="text-button" onClick={() => onSearch('', '')}>Encontre sua oportunidade <ArrowRight size={18} /></button></div><div className="steps">{[[Search, '01', 'Encontre sua causa', 'Explore oportunidades por atividade, localização ou formato de participação.'], [Bookmark, '02', 'Escolha como contribuir', 'Conheça a organização, veja a dedicação necessária e salve suas favoritas.'], [HeartHandshake, '03', 'Prepare seu próximo passo', 'Complete seu perfil e descubra como suas habilidades podem ajudar.']].map(([Icon, number, title, text]) => <div className="step" key={number}><span className="step-icon"><Icon size={23} /></span><div><span className="step-number">PASSO {number}</span><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="organization-banner"><div><span className="eyebrow">Para organizações</span><h2>Sua causa merece<br />mais mãos para ajudar.</h2><p>Organize suas oportunidades e encontre espaço para cada talento.</p></div><button className="primary-button" onClick={onOrganization}>Anunciar uma oportunidade <ArrowRight size={20} /></button></section>
  </div>;
}
