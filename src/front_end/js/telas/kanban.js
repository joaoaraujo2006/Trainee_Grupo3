import { showConfirmationModal, showNotification } from '../global.js';

const API_BASE_URL = 'https://trainee-projetos-api-lime.vercel.app';
const TEAM_TOKEN = 'equipe-beta-2026';
let currentProjectId = null;

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
    currentProjectId = projectId;
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
                openCreateTaskModal();
            });
        }

        attachDragStartListener();
        attachTaskClickListener();
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
            showNotification('Erro ao mover tarefa. Tente novamente.', 'error');
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

function attachTaskClickListener() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.kanban-card');
        if (!card) return;
        
        const taskId = parseInt(card.dataset.taskId);
        const taskStatus = card.dataset.taskStatus;
        
        openEditTaskModal(taskId, taskStatus);
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

function openCreateTaskModal() {
    createTaskModalIfNotExists();
    const backdrop = document.querySelector('#create-task-modal-backdrop');
    if (backdrop) {
        backdrop.style.display = 'flex';
    }
}

function createTaskModalIfNotExists() {
    if (document.querySelector('#create-task-modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'create-task-modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" id="create-task-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Criar Nova Tarefa</h2>
                    <button class="close-btn" aria-label="Fechar modal">&times;</button>
                </div>
                <form id="create-task-form" class="modal-body">
                    <div class="form-group">
                        <label for="task-title">Título *</label>
                        <input type="text" id="task-title" name="title" required placeholder="Digite o título da tarefa">
                    </div>

                    <div class="form-group">
                        <label for="task-description">Descrição *</label>
                        <textarea id="task-description" name="description" required placeholder="Digite a descrição da tarefa" rows="3"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="task-priority">Prioridade *</label>
                            <select id="task-priority" name="priority" required>
                                <option value="">Selecione uma prioridade</option>
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="task-status">Status *</label>
                            <select id="task-status" name="status" required>
                                <option value="">Selecione um status</option>
                                <option value="A fazer">A fazer</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Em revisão">Em revisão</option>
                                <option value="Concluída">Concluída</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="task-assignee">Responsável *</label>
                            <input type="text" id="task-assignee" name="assignee" required placeholder="Nome do responsável">
                        </div>

                        <div class="form-group">
                            <label for="task-estimated-hours">Horas Estimadas *</label>
                            <input type="number" id="task-estimated-hours" name="estimatedHours" min="1" step="0.5" required placeholder="Ex: 8">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="task-due-date">Data de Vencimento *</label>
                        <input type="date" id="task-due-date" name="dueDate" required>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancel-btn">Cancelar</button>
                        <button type="submit" class="btn-primary">Criar Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    setupCreateTaskModalListeners();
}

function setupCreateTaskModalListeners() {
    const backdrop = document.querySelector('#create-task-modal-backdrop');
    const form = document.querySelector('#create-task-form');
    const closeBtn = document.querySelector('#create-task-modal .close-btn');
    const cancelBtn = document.querySelector('#cancel-btn');

    closeBtn.addEventListener('click', closeCreateTaskModal);
    cancelBtn.addEventListener('click', closeCreateTaskModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeCreateTaskModal();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitCreateTaskForm();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.style.display === 'flex') {
            closeCreateTaskModal();
        }
    });
}

function closeCreateTaskModal() {
    const backdrop = document.querySelector('#create-task-modal-backdrop');
    if (backdrop) {
        backdrop.style.display = 'none';
    }
}

async function openEditTaskModal(taskId, taskStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'x-team-token': TEAM_TOKEN,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const task = await response.json();
        createEditTaskModalIfNotExists(task);
        
        const backdrop = document.querySelector('#edit-task-modal-backdrop');
        if (backdrop) {
            backdrop.style.display = 'flex';
        }
    } catch (error) {
        console.error('Erro ao carregar tarefa:', error);
        showNotification('Erro ao carregar tarefa. Tente novamente.', 'error');
    }
}

function createEditTaskModalIfNotExists(task) {
    let backdrop = document.querySelector('#edit-task-modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }

    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'edit-task-modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal" id="edit-task-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Editar Tarefa</h2>
                    <button class="close-btn" aria-label="Fechar modal">&times;</button>
                </div>
                <form id="edit-task-form" class="modal-body">
                    <div class="form-group">
                        <label for="edit-task-title">Título *</label>
                        <input type="text" id="edit-task-title" name="title" required placeholder="Digite o título da tarefa" value="${task.title}">
                    </div>

                    <div class="form-group">
                        <label for="edit-task-description">Descrição *</label>
                        <textarea id="edit-task-description" name="description" required placeholder="Digite a descrição da tarefa" rows="3">${task.description}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-task-priority">Prioridade *</label>
                            <select id="edit-task-priority" name="priority" required>
                                <option value="">Selecione uma prioridade</option>
                                <option value="Baixa" ${task.priority === 'Baixa' ? 'selected' : ''}>Baixa</option>
                                <option value="Média" ${task.priority === 'Média' ? 'selected' : ''}>Média</option>
                                <option value="Alta" ${task.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="edit-task-status">Status *</label>
                            <select id="edit-task-status" name="status" required>
                                <option value="">Selecione um status</option>
                                <option value="A fazer" ${task.status === 'A fazer' ? 'selected' : ''}>A fazer</option>
                                <option value="Em andamento" ${task.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                                <option value="Em revisão" ${task.status === 'Em revisão' ? 'selected' : ''}>Em revisão</option>
                                <option value="Concluída" ${task.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-task-assignee">Responsável *</label>
                            <input type="text" id="edit-task-assignee" name="assignee" required placeholder="Nome do responsável" value="${task.assignee}">
                        </div>

                        <div class="form-group">
                            <label for="edit-task-estimated-hours">Horas Estimadas *</label>
                            <input type="number" id="edit-task-estimated-hours" name="estimatedHours" min="1" step="0.5" required placeholder="Ex: 8" value="${task.estimatedHours}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="edit-task-due-date">Data de Vencimento *</label>
                        <input type="date" id="edit-task-due-date" name="dueDate" required value="${task.dueDate}">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-danger" id="delete-btn">
                            <i class="ph ph-trash"></i> Deletar
                        </button>
                        <div style="display: flex; gap: 12px;">
                            <button type="button" class="btn-secondary" id="cancel-edit-btn">Cancelar</button>
                            <button type="submit" class="btn-primary">Salvar Alterações</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    setupEditTaskModalListeners(task.id);
}

function setupEditTaskModalListeners(taskId) {
    const backdrop = document.querySelector('#edit-task-modal-backdrop');
    const form = document.querySelector('#edit-task-form');
    const closeBtn = document.querySelector('#edit-task-modal .close-btn');
    const cancelBtn = document.querySelector('#cancel-edit-btn');
    const deleteBtn = document.querySelector('#delete-btn');

    closeBtn.addEventListener('click', closeEditTaskModal);
    cancelBtn.addEventListener('click', closeEditTaskModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeEditTaskModal();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEditTaskForm(taskId);
    });

    deleteBtn.addEventListener('click', async () => {
        showConfirmationModal(
            'Deletar Tarefa',
            'Tem certeza que deseja deletar essa tarefa? Esta ação não pode ser desfeita.',
            async () => {
                await deleteTask(taskId);
            },
            null,
            { confirmText: 'Deletar', cancelText: 'Cancelar', variant: 'danger' }
        );
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.style.display === 'flex') {
            closeEditTaskModal();
        }
    });
}

function closeEditTaskModal() {
    const backdrop = document.querySelector('#edit-task-modal-backdrop');
    if (backdrop) {
        backdrop.style.display = 'none';
        setTimeout(() => backdrop.remove(), 300);
    }
}

async function submitEditTaskForm(taskId) {
    const form = document.querySelector('#edit-task-form');
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const payload = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        status: formData.get('status'),
        assignee: formData.get('assignee'),
        estimatedHours: parseFloat(formData.get('estimatedHours')),
        dueDate: formData.get('dueDate')
    };

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph ph-spinner"></i>';

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-team-token': TEAM_TOKEN
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar tarefa');
        }

        const result = await response.json();
        console.log('Tarefa atualizada com sucesso:', result);

        closeEditTaskModal();
        showNotification('Tarefa atualizada com sucesso!', 'success');

        await initKanbanBoard(currentProjectId);
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        showNotification(`Erro ao atualizar tarefa: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'x-team-token': TEAM_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        closeEditTaskModal();
        showNotification('Tarefa deletada com sucesso!', 'success');

        await initKanbanBoard(currentProjectId);
    } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        showNotification('Erro ao deletar tarefa. Tente novamente.', 'error');
    }
}

async function submitCreateTaskForm() {
    const form = document.querySelector('#create-task-form');
    const formData = new FormData(form);

    if (!currentProjectId) {
        showNotification('Nenhum projeto selecionado. Por favor, selecione um projeto primeiro.', 'error');
        return;
    }

    const payload = {
        projectId: currentProjectId,
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        status: formData.get('status'),
        assignee: formData.get('assignee'),
        estimatedHours: parseFloat(formData.get('estimatedHours')),
        dueDate: formData.get('dueDate')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-team-token': TEAM_TOKEN
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar tarefa');
        }

        const result = await response.json();
        console.log('Tarefa criada com sucesso:', result);

        closeCreateTaskModal();
        form.reset();
        showNotification('Tarefa criada com sucesso!', 'success');

        // Recarregar o kanban com a nova tarefa
        await initKanbanBoard(currentProjectId);
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        showNotification(`Erro ao criar tarefa: ${error.message}`, 'error');
    }
}
