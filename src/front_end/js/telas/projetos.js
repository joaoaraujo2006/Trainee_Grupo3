export function getProjetosView() {
    return `
    <div class="scroll-container">
        <header class="page-header">
            <div>
                <h1>Projetos</h1>
                <p>Escolha projetos para visualizar detalhes e participar do gerenciamento de tarefas.</p>
            </div>
        </header>
        <main class="projects-container" id="lista_projetos">
            <!-- Cards serão inseridos aqui -->
        </main>
    </div>
    `;

}

export async function insertProjectsCards() {
    const containerLista = document.getElementById('lista_projetos');
    if (!containerLista) return;

    try {
        const resposta = await fetch('https://trainee-projetos-api-lime.vercel.app/projects', {
            method: 'GET',
            headers: {
                'x-team-token': 'equipe-beta-2026',
            }
        });

        const projetos = await resposta.json();
        console.log('Projetos carregados:', projetos);
        containerLista.innerHTML = projetos.map(createProjectCard).join('');
        attachProjectClickHandler(containerLista);
    } catch (erro) {
        console.error('Erro ao carregar os dados!', erro);
        containerLista.innerHTML = `<p class="error-message">Erro ao carregar projetos.</p>`;
    }
}

function createProjectCard(projeto) {
    return `
        <article class="project-card" data-project-id="${projeto.id}" data-project-name="${projeto.name}">
            <div class="card-top-bars">
                <span></span>
                <span></span>
            </div>
            <div class="card-body-wrapper">
                <div class="card-content">
                    <h2>${projeto.name}</h2>
                    <p class="project-description">${projeto.description}</p>
                    <div class="project-status-wrapper">
                        <span class="status ${projeto.status.toLowerCase().replace(/\s/g, '-')}">${projeto.status}</span>
                    </div>
                    <div class="project-assign">
                        <span class="meta-label">Responsável</span>
                        <span class="assign-value">${projeto.owner}</span>
                    </div>
                </div>
                <button class="menu-btn" data-project-id="${projeto.id}" aria-label="Menu do projeto">
                    <i class="ph ph-dots-three-vertical"></i>
                </button>
            </div>
        </article>
    `;
}

function attachProjectClickHandler(container) {
    container.addEventListener('click', (event) => {
        const menuBtn = event.target.closest('.menu-btn');
        if (menuBtn) {
            event.stopPropagation();
            const projectId = Number(menuBtn.dataset.projectId);
            const projectCard = menuBtn.closest('.project-card');
            const projectName = projectCard.dataset.projectName;
            showProjectModal(projectId, projectName);
            return;
        }

        const projectCard = event.target.closest('.project-card');
        if (!projectCard) return;

        const projectId = Number(projectCard.dataset.projectId);
        const projectName = projectCard.dataset.projectName || 'Kanban';

        document.dispatchEvent(new CustomEvent('project-selected', {
            detail: { projectId, projectName }
        }));
    });
}

async function showProjectModal(projectId, projectName) {
    try {
        const resposta = await fetch(`https://trainee-projetos-api-lime.vercel.app/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'x-team-token': 'equipe-beta-2026',
            }
        });

        const projeto = await resposta.json();
        openModalWithData(projeto);
    } catch (erro) {
        console.error('Erro ao carregar detalhes do projeto:', erro);
    }
}

function openModalWithData(projeto) {
    let backdrop = document.getElementById('project-modal-backdrop');
    if (!backdrop) {
        createProjectModal();
        backdrop = document.getElementById('project-modal-backdrop');
    }

    const modalContent = backdrop.querySelector('#project-modal .modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${projeto.name}</h2>
            <button class="close-btn" aria-label="Fechar modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="info-group">
                <label>ID:</label>
                <p>${projeto.id}</p>
            </div>
            <div class="info-group">
                <label>Descrição:</label>
                <p>${projeto.description}</p>
            </div>
            <div class="info-group">
                <label>Status:</label>
                <p><span class="status ${projeto.status.toLowerCase().replace(/\s/g, '-')}">${projeto.status}</span></p>
            </div>
            <div class="info-group">
                <label>Responsável:</label>
                <p>${projeto.owner}</p>
            </div>
            ${projeto.startDate ? `
                <div class="info-group">
                    <label>Data de Início:</label>
                    <p>${new Date(projeto.startDate).toLocaleDateString('pt-BR')}</p>
                </div>
            ` : ''}
            ${projeto.endDate ? `
                <div class="info-group">
                    <label>Data de Término:</label>
                    <p>${new Date(projeto.endDate).toLocaleDateString('pt-BR')}</p>
                </div>
            ` : ''}
            ${projeto.team ? `
                <div class="info-group">
                    <label>Equipe:</label>
                    <p>${projeto.team}</p>
                </div>
            ` : ''}
        </div>
    `;

    backdrop.style.display = 'flex';
    
    // Remove listeners antigos
    backdrop.removeEventListener('click', closeProjectModalHandler);
    backdrop.addEventListener('click', closeProjectModalHandler);

    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.removeEventListener('click', closeProjectModalHandler);
    closeBtn.addEventListener('click', closeProjectModalHandler);
}

function closeProjectModalHandler(e) {
    if (e.type === 'click' && e.target.id === 'project-modal-backdrop') {
        closeProjectModal();
    } else if (e.target.classList.contains('close-btn')) {
        closeProjectModal();
    }
}

function createProjectModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'project-modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" id="project-modal">
            <div class="modal-content"></div>
        </div>
    `;
    document.body.appendChild(backdrop);
}

function closeProjectModal() {
    const backdrop = document.getElementById('project-modal-backdrop');
    if (backdrop) {
        backdrop.style.display = 'none';
    }
}

// Event listener global para ESC no modal do projeto
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const backdrop = document.getElementById('project-modal-backdrop');
        if (backdrop && backdrop.style.display === 'flex') {
            closeProjectModal();
        }
    }
}, true);
