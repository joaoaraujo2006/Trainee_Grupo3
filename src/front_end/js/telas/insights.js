const API_BASE_URL = 'https://trainee-projetos-api-lime.vercel.app';

async function getTasksByProject(projectId) {
    const token = localStorage.getItem('inteliJr_api_token') || 'equipe-beta-2026';

    const response = await fetch(`${API_BASE_URL}/tasks?projectId=${projectId}`, {
        method: 'GET',
        headers: {
            'x-team-token': token
        }
    });

    if (!response.ok) {
        throw new Error('Não foi possível buscar as tarefas do projeto');
    }

    return await response.json();
}

export function getInsightsView(projectName = 'Projeto') {
    return `
        <div class="scroll-container">
            <header class="page-header">
                <h1>Insights</h1>
                <p>Indicadores gerais do projeto ${projectName} com base no Kanban.</p>
            </header>

            <section class="insights-container">
                <div class="insights-grid">
                    <article class="insight-card">
                        <span class="insight-label">Progresso</span>
                        <strong id="insight-progress">0%</strong>
                        <small>Percentual de tarefas concluídas</small>
                    </article>

                    <article class="insight-card">
                        <span class="insight-label">Atrasadas</span>
                        <strong id="insight-overdue">0</strong>
                        <small>Tarefas com prazo vencido</small>
                    </article>

                    <article class="insight-card">
                        <span class="insight-label">Fazendo</span>
                        <strong id="insight-active">0</strong>
                        <small>Tarefas em andamento ou em revisão</small>
                    </article>

                    <article class="insight-card">
                        <span class="insight-label">Total</span>
                        <strong id="insight-total">0</strong>
                        <small>Total de tarefas do projeto</small>
                    </article>
                </div>

                <section class="insight-panel">
                    <div class="insight-panel-header">
                        <h2>Distribuição por status</h2>
                        <p>Resumo visual das tarefas em A fazer, Fazendo e Feitas.</p>
                    </div>

                    <div class="status-chart">
                        <div class="chart-row">
                            <span>A fazer</span>
                            <div class="bar-track">
                                <div id="bar-todo" class="bar-fill todo"></div>
                            </div>
                            <strong id="count-todo">0</strong>
                        </div>

                        <div class="chart-row">
                            <span>Fazendo</span>
                            <div class="bar-track">
                                <div id="bar-doing" class="bar-fill doing"></div>
                            </div>
                            <strong id="count-doing">0</strong>
                        </div>

                        <div class="chart-row">
                            <span>Feitas</span>
                            <div class="bar-track">
                                <div id="bar-done" class="bar-fill done"></div>
                            </div>
                            <strong id="count-done">0</strong>
                        </div>
                    </div>
                </section>

                <section class="insight-panel">
                    <div class="insight-panel-header">
                        <h2>Status atuais</h2>
                        <p>Quantitativo consolidado do board.</p>
                    </div>
                    <ul id="current-status-list" class="status-list"></ul>
                </section>

                <section class="insight-panel">
                    <div class="insight-panel-header">
                        <h2>Tarefas atrasadas</h2>
                        <p>Tarefas ainda não concluídas com prazo já vencido.</p>
                    </div>
                    <ul id="overdue-list" class="status-list"></ul>
                </section>
            </section>
        </div>
    `;
}

export async function initInsights(projectId, projectName = '') {
    try {
        const tasks = await getTasksByProject(projectId);
        renderInsights(tasks, projectName);
    } catch (error) {
        const container = document.querySelector('.insights-container');
        if (container) {
            container.innerHTML = `
                <div class="insight-panel">
                    <h2>Erro ao carregar insights</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

function renderInsights(tasks, projectName) {
    const normalizedTasks = Array.isArray(tasks) ? tasks : [];

    const todoTasks = normalizedTasks.filter(task => isTodo(task));
    const doingTasks = normalizedTasks.filter(task => isDoing(task));
    const doneTasks = normalizedTasks.filter(task => isDone(task));
    const overdueTasks = normalizedTasks.filter(task => isOverdue(task));

    const total = normalizedTasks.length;
    const progress = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;
    const maxCount = Math.max(todoTasks.length, doingTasks.length, doneTasks.length, 1);

    setText('insight-progress', `${progress}%`);
    setText('insight-overdue', overdueTasks.length);
    setText('insight-active', doingTasks.length);
    setText('insight-total', total);

    setText('count-todo', todoTasks.length);
    setText('count-doing', doingTasks.length);
    setText('count-done', doneTasks.length);

    setBarWidth('bar-todo', (todoTasks.length / maxCount) * 100);
    setBarWidth('bar-doing', (doingTasks.length / maxCount) * 100);
    setBarWidth('bar-done', (doneTasks.length / maxCount) * 100);

    renderCurrentStatusList(todoTasks, doingTasks, doneTasks, total, projectName);
    renderOverdueList(overdueTasks);
}

function renderCurrentStatusList(todoTasks, doingTasks, doneTasks, total, projectName) {
    const list = document.getElementById('current-status-list');
    if (!list) return;

    const items = [
        {
            label: 'Projeto',
            value: projectName || 'Selecionado'
        },
        {
            label: 'A fazer',
            value: todoTasks.length
        },
        {
            label: 'Fazendo',
            value: doingTasks.length
        },
        {
            label: 'Feitas',
            value: doneTasks.length
        },
        {
            label: 'Total geral',
            value: total
        }
    ];

    list.innerHTML = items.map(item => `
        <li class="status-item">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
        </li>
    `).join('');
}

function renderOverdueList(overdueTasks) {
    const list = document.getElementById('overdue-list');
    if (!list) return;

    if (!overdueTasks.length) {
        list.innerHTML = `<li class="status-item empty">Nenhuma tarefa atrasada no momento.</li>`;
        return;
    }

    list.innerHTML = overdueTasks.map(task => `
        <li class="status-item">
            <div class="status-task-info">
                <span>${task.title || 'Tarefa sem título'}</span>
                <small>${task.assignee || 'Sem responsável'} • ${task.status || 'Sem status'}</small>
            </div>
            <strong>${formatDate(task.dueDate)}</strong>
        </li>
    `).join('');
}

function isTodo(task) {
    return task.status === 'A fazer';
}

function isDoing(task) {
    return task.status === 'Em andamento' || task.status === 'Em revisão';
}

function isDone(task) {
    return task.status === 'Concluída';
}

function isOverdue(task) {
    if (isDone(task)) return false;
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate);
    const today = new Date();

    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return due < today;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setBarWidth(id, value) {
    const element = document.getElementById(id);
    if (element) element.style.width = `${value}%`;
}

function formatDate(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('pt-BR');
}