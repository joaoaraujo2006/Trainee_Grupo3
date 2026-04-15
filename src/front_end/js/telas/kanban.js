const API_BASE_URL = 'https://trainee-projetos-api-lime.vercel.app';
const TEAM_TOKEN = 'equipe-beta-2026';

export function getKanbanView(projectName = '') {
    const boardTitle = projectName ? `Kanban - ${projectName}` : 'Kanban de Tarefas';
    return `
    <div class="scroll-container">
        <header class="board-header">
            <div>
                <h1>${boardTitle}</h1>
                <p>Organize o fluxo de trabalho em etapas e acompanhe o status das entregas.</p>
            </div>
            <button class="btn-primary" id="new-task-button">
                <i class="ph ph-plus"></i> Nova Tarefa
            </button>
        </header>

        <div class="kanban-board">
            <div class="kanban-column" id="col-todo">
                <div class="column-header">
                    <div>
                        <h3>A Fazer</h3>
                        <p class="column-subtitle">Planejamento e backlog</p>
                    </div>
                    <span class="task-count" id="count-todo">0</span>
                </div>
                <div class="column-cards" id="cards-todo">
                    <p class="empty-message">Carregando tarefas...</p>
                </div>
            </div>

            <div class="kanban-column" id="col-doing">
                <div class="column-header">
                    <div>
                        <h3>Fazendo</h3>
                        <p class="column-subtitle">Tarefas em execução</p>
                    </div>
                    <span class="task-count" id="count-doing">0</span>
                </div>
                <div class="column-cards" id="cards-doing">
                    <p class="empty-message">Carregando tarefas...</p>
                </div>
            </div>

            <div class="kanban-column" id="col-review">
                <div class="column-header">
                    <div>
                        <h3>Em revisão</h3>
                        <p class="column-subtitle">Aguardando aprovação</p>
                    </div>
                    <span class="task-count" id="count-review">0</span>
                </div>
                <div class="column-cards" id="cards-review">
                    <p class="empty-message">Carregando tarefas...</p>
                </div>
            </div>

            <div class="kanban-column" id="col-done">
                <div class="column-header">
                    <div>
                        <h3>Feito</h3>
                        <p class="column-subtitle">Trabalhos concluídos</p>
                    </div>
                    <span class="task-count" id="count-done">0</span>
                </div>
                <div class="column-cards" id="cards-done">
                    <p class="empty-message">Carregando tarefas...</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function initKanbanBoard(projectId = null) {
    const columns = {
        'A fazer': document.getElementById('cards-todo'),
        'Em andamento': document.getElementById('cards-doing'),
        'Em revisão': document.getElementById('cards-review'),
        'Concluída': document.getElementById('cards-done')
    };

    const queryString = projectId ? `?projectId=${projectId}` : '';

    const countElements = {
        'A fazer': document.getElementById('count-todo'),
        'Em andamento': document.getElementById('count-doing'),
        'Em revisão': document.getElementById('count-review'),
        'Concluída': document.getElementById('count-done')
    };

    const emptyMessage = '<p class="empty-message">Nenhuma tarefa encontrada.</p>';

    Object.values(columns).forEach(column => {
        if (column) column.innerHTML = emptyMessage;
    });

    try {
        const response = await fetch(`${API_BASE_URL}/tasks${queryString}`, {
            method: 'GET',
            headers: {
                'x-team-token': TEAM_TOKEN,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const tasks = await response.json();

        const groupedTasks = tasks.reduce((groups, task) => {
            const status = task.status || 'A fazer';
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(task);
            return groups;
        }, {});

        Object.keys(columns).forEach(status => {
            const column = columns[status];
            if (!column) return;
            const statusTasks = groupedTasks[status] || [];
            column.innerHTML = statusTasks.length > 0 ? statusTasks.map(task => createTaskCard(task, status)).join('') : emptyMessage;
            if (countElements[status]) {
                countElements[status].textContent = statusTasks.length;
            }

            setupColumnDropZone(column, status);
        });

        const newTaskButton = document.getElementById('new-task-button');
        if (newTaskButton) {
            newTaskButton.addEventListener('click', () => {
                alert('Funcionalidade de criação de tarefa em desenvolvimento.');
            });
        }

        attachDragStartListener();
    } catch (error) {
        console.error('Erro ao carregar tarefas do kanban:', error);
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = `<p class="empty-message">Erro ao carregar tarefas. Tente novamente mais tarde.</p>`;
        });
    }
}

function createTaskCard(task, currentStatus) {
    return `
        <article class="kanban-card" draggable="true" data-task-id="${task.id}" data-task-status="${currentStatus}">
            <div class="kanban-card-header">
                <span class="task-badge ${normalizeClassName(task.priority)}">${task.priority}</span>
                <span class="task-meta">#${task.id}</span>
            </div>
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <div class="kanban-card-footer">
                <span class="assignee">${task.assignee}</span>
                <span class="due-date">${formatDate(task.dueDate)}</span>
            </div>
        </article>
    `;
}

function setupColumnDropZone(columnElement, status) {
    columnElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dropEffect = 'move';
        columnElement.classList.add('drag-over');
    });

    columnElement.addEventListener('dragleave', (e) => {
        if (e.target === columnElement) {
            columnElement.classList.remove('drag-over');
        }
    });

    columnElement.addEventListener('drop', async (e) => {
        e.preventDefault();
        columnElement.classList.remove('drag-over');

        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const draggedCard = document.querySelector(`[data-task-id="${taskId}"]`);

        if (!draggedCard) return;

        const statusMap = {
            'A fazer': 'A fazer',
            'Em andamento': 'Em andamento',
            'Em revisão': 'Em revisão',
            'Concluída': 'Concluída'
        };

        const newStatus = statusMap[status];
        if (!newStatus) return;

        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-team-token': TEAM_TOKEN,
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            draggedCard.dataset.taskStatus = newStatus;
            columnElement.appendChild(draggedCard);

            updateTaskCounts();
        } catch (error) {
            console.error('Erro ao atualizar status da tarefa:', error);
            alert('Erro ao mover tarefa. Tente novamente.');
        }
    });
}

function attachDragStartListener() {
    document.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('kanban-card')) return;

        const taskId = e.target.dataset.taskId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
        e.target.classList.add('dragging');
    });

    document.addEventListener('dragend', (e) => {
        if (!e.target.classList.contains('kanban-card')) return;
        e.target.classList.remove('dragging');
    });
}

function updateTaskCounts() {
    const countElements = {
        'A fazer': document.getElementById('count-todo'),
        'Em andamento': document.getElementById('count-doing'),
        'Em revisão': document.getElementById('count-review'),
        'Concluída': document.getElementById('count-done')
    };

    const columns = {
        'A fazer': document.getElementById('cards-todo'),
        'Em andamento': document.getElementById('cards-doing'),
        'Em revisão': document.getElementById('cards-review'),
        'Concluída': document.getElementById('cards-done')
    };

    Object.keys(columns).forEach(status => {
        const column = columns[status];
        if (column && countElements[status]) {
            const cards = column.querySelectorAll('.kanban-card').length;
            countElements[status].textContent = cards;
        }
    });
}

function normalizeClassName(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9-]+/g, '-');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
