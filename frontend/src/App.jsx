import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import RotaProtegida from './components/rotas/RotaProtegida';
import ProvedorConta from './context/ProvedorConta';
import ProvedorModal from './context/ProvedorModal';
import ProvedorVagasSalvas from './context/ProvedorVagasSalvas';
import Inicio from './pages/inicio/Inicio';
import Oportunidades from './pages/oportunidades/Oportunidades';
import AreaOrganizacao from './pages/organizacao/AreaOrganizacao';
import FormularioOportunidade from './pages/organizacao/FormularioOportunidade';
import LayoutConta from './pages/conta/LayoutConta';
import Perfil from './pages/conta/Perfil';
import MinhasVagas from './pages/conta/MinhasVagas';
import Mensagens from './pages/conta/Mensagens';
import Notificacoes from './pages/conta/Notificacoes';
import LayoutAcesso from './pages/entrar/LayoutAcesso';
import Entrar from './pages/entrar/Entrar';
import CadastroOrganizacao from './pages/entrar/CadastroOrganizacao';
import ParaOrganizacoes from './pages/para-organizacoes/ParaOrganizacoes';
import NaoEncontrada from './pages/NaoEncontrada';
import { PAPEIS_ORGANIZACAO } from './utils/papeis';

/**
 * Rotas.
 * basename: no GitHub Pages o site fica em /voluntare/ (VITE_BASE no build).
 * Públicas: início, busca e entrar. Voluntário: /conta. Gestor e coordenador: /organizacao.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProvedorConta>
        <ProvedorVagasSalvas>
          <ProvedorModal>
            <Routes>
              <Route element={<LayoutAcesso />}>
                <Route path="entrar" element={<Entrar />} />
                <Route path="cadastro-organizacao" element={<CadastroOrganizacao />} />
              </Route>

              <Route element={<LayoutPrincipal />}>
                <Route index element={<Inicio />} />
                <Route path="oportunidades" element={<Oportunidades />} />
                <Route path="para-organizacoes" element={<ParaOrganizacoes />} />

                <Route element={<RotaProtegida papeis={PAPEIS_ORGANIZACAO} />}>
                  <Route path="organizacao" element={<AreaOrganizacao />} />
                  <Route path="organizacao/nova" element={<FormularioOportunidade />} />
                  <Route path="organizacao/:id/editar" element={<FormularioOportunidade />} />
                </Route>

                <Route element={<RotaProtegida papeis={['VOLUNTARIO']} />}>
                  <Route path="conta" element={<LayoutConta />}>
                    <Route index element={<Navigate to="perfil" replace />} />
                    <Route path="perfil" element={<Perfil key="perfil" abaInicial="resume" />} />
                    <Route
                      path="preferencias"
                      element={<Perfil key="preferencias" abaInicial="preferences" />}
                    />
                    <Route path="minhas-vagas" element={<MinhasVagas />} />
                    <Route path="mensagens" element={<Mensagens />} />
                    <Route path="notificacoes" element={<Notificacoes />} />
                  </Route>
                </Route>

                <Route path="*" element={<NaoEncontrada />} />
              </Route>
            </Routes>
          </ProvedorModal>
        </ProvedorVagasSalvas>
      </ProvedorConta>
    </BrowserRouter>
  );
}
