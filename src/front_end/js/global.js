import { getProjetosView, insertProjectsCards } from './telas/projetos.js';
import { getAgendaView, initAgenda } from './telas/agenda.js';
import { getComunidadeView, initComunidade } from './telas/comunidade.js';
import { getConfigView, initConfig } from './telas/config.js';
import { getKanbanView, initKanbanBoard } from './telas/kanban.js';
import { getInsightsView, initInsights } from './telas/insights.js';

const appContent = document.getElementById('app-content');
const navButtons = document.querySelectorAll('.nav-btn');

let currentProject = null;

document.addEventListener('project-selected', async (event) => {
    const { projectId, projectName } = event.detail;
    currentProject = { projectId, projectName };

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
            initConfig();
            break;

        case 'kanban': {
            const projectData = options.projectId ? options : currentProject;

            if (!projectData?.projectId) {
                appContent.innerHTML = `
                    <div class="scroll-container">
                        <header class="page-header">
                            <h1>Kanban</h1>
                            <p>Selecione um projeto primeiro para visualizar o quadro.</p>
                        </header>
                    </div>
                `;
                return;
            }

            appContent.innerHTML = getKanbanView(projectData.projectName);
            await initKanbanBoard(projectData.projectId);
            break;
        }

        case 'insights': {
            const projectData = options.projectId ? options : currentProject;

            if (!projectData?.projectId) {
                appContent.innerHTML = `
                    <div class="scroll-container">
                        <header class="page-header">
                            <h1>Insights</h1>
                            <p>Selecione um projeto primeiro para visualizar os indicadores.</p>
                        </header>
                    </div>
                `;
                return;
            }

            appContent.innerHTML = getInsightsView(projectData.projectName);
            await initInsights(projectData.projectId, projectData.projectName);
            break;
        }

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

const sidebar = document.getElementById('sidebar');
const btnCollapse = document.getElementById('btn-collapse');

if (btnCollapse && sidebar) {
    btnCollapse.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

renderView('projetos');