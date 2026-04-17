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

// ========== SISTEMA GLOBAL DE NOTIFICAÇÕES E CONFIRMAÇÃO ==========

/**
 * Mostra um modal de confirmação
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem de confirmação
 * @param {Function} onConfirm - Callback ao confirmar
 * @param {Function} onCancel - Callback ao cancelar (opcional)
 * @param {object} options - Opções customizáveis { confirmText, cancelText, variant }
 */
export function showConfirmationModal(title, message, onConfirm, onCancel = null, options = {}) {
    const { confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' } = options;
    
    let existingBackdrop = document.getElementById('confirmation-modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'confirmation-modal-backdrop';
    backdrop.innerHTML = `
        <div class="confirmation-modal" data-variant="${variant}">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" aria-label="Fechar modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancel-modal-btn">${cancelText}</button>
                <button type="button" class="btn-primary btn-danger" id="confirm-modal-btn">${confirmText}</button>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    const closeBtn = backdrop.querySelector('.close-btn');
    const cancelBtn = backdrop.querySelector('#cancel-modal-btn');
    const confirmBtn = backdrop.querySelector('#confirm-modal-btn');

    const closeModal = () => {
        backdrop.style.display = 'none';
        setTimeout(() => backdrop.remove(), 300);
        if (onCancel) onCancel();
    };

    const handleConfirm = async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="ph ph-spinner"></i>';
        try {
            await onConfirm();
        } finally {
            backdrop.style.display = 'none';
            setTimeout(() => backdrop.remove(), 300);
        }
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', handleConfirm);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.parentElement) {
            closeModal();
        }
    });

    backdrop.style.display = 'flex';
}

/**
 * Mostra uma notificação toast
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Tempo em ms (padrão: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icons = {
        success: '<i class="ph ph-check-circle"></i>',
        error: '<i class="ph ph-warning-circle"></i>',
        info: '<i class="ph ph-info"></i>'
    };

    notification.innerHTML = `
        <div class="toast-content">
            ${icons[type] || icons.info}
            <span>${message}</span>
        </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('toast-exit');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}