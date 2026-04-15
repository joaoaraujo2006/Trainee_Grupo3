import { getProjetosView } from './telas/projetos.js';
import { getAgendaView } from './telas/agenda.js';
import { getComunidadeView } from './telas/comunidade.js';
import { getConfigView } from './telas/config.js';

const appContent = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.nav-btn');

function renderView(viewName) {
    switch (viewName) {
        case 'projetos':
            appContent.innerHTML = getProjetosView();
            break;
        case 'agenda':
            appContent.innerHTML = getAgendaView();
            break;
        case 'comunidade':
            appContent.innerHTML = getComunidadeView();
            break;
        case 'config':
            appContent.innerHTML = getConfigView();
            break;
        default:
            appContent.innerHTML = '<h1 style="padding: 40px;">Erro: Tela não encontrada</h1>';
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', (evento) => {
        navButtons.forEach(btn => btn.classList.remove('active'));

        const clickedBtn = evento.currentTarget;
        clickedBtn.classList.add('active');

        const targetView = clickedBtn.getAttribute('data-target');
        renderView(targetView);
    });
});

renderView('projetos');