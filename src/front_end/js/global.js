
import { getProjetosView, insertProjectsCards } from './telas/projetos.js';
import { getAgendaView, initAgenda } from './telas/agenda.js'; 
import { getComunidadeView, initComunidade } from './telas/comunidade.js';
import { getConfigView } from './telas/config.js';
import { getKanbanView, initKanbanBoard } from './telas/kanban.js';

const appContent = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.nav-btn');

document.addEventListener('project-selected', async (event) => {
    const { projectId, projectName } = event.detail;
    const projetosButton = document.querySelector('.nav-btn[data-target="projetos"]');

    if (projetosButton) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        projetosButton.classList.add('active');
    }

    await renderView('kanban', { projectId, projectName });
});

async function renderView(viewName, options = {}) {
    switch (viewName) {
        case 'projetos':
            appContent.innerHTML = getProjetosView();
            await insertProjectsCards();
            break;
        case 'agenda':
            appContent.innerHTML = getAgendaView();
            initAgenda();
            break;
        case 'comunidade':
            appContent.innerHTML = getComunidadeView();
            initComunidade();
            break;
        case 'config':
            appContent.innerHTML = getConfigView();
            break;
        case 'kanban':
            appContent.innerHTML = getKanbanView(options.projectName);
            await initKanbanBoard(options.projectId);
            break;
        default:
            appContent.innerHTML = '<h1 style="padding: 40px;">Erro: Tela não encontrada</h1>';
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', async (evento) => {
        navButtons.forEach(btn => btn.classList.remove('active'));

        const clickedBtn = evento.currentTarget;
        clickedBtn.classList.add('active');

        const targetView = clickedBtn.getAttribute('data-target');
        await renderView(targetView);
    });
});

renderView('projetos');