export function getProjetosView() {
    return `
        <header class="board-header">
            <div>
                <h1>Sistema de Gestão Turma do Bem</h1>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Sprint Atual: Frontend</p>
            </div>
            <button class="btn-primary">
                <i class="ph ph-plus"></i> Nova Tarefa
            </button>
        </header>

        <div class="kanban-board">
            
            <div class="kanban-column" id="col-todo">
                <div class="column-header">
                    <h3>A Fazer</h3>
                    <span class="task-count" id="count-todo">0</span>
                </div>
                <div class="column-cards" id="cards-todo">
                    <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">Carregando tarefas...</p>
                </div>
            </div>

            <div class="kanban-column" id="col-doing">
                <div class="column-header">
                    <h3>Fazendo</h3>
                    <span class="task-count" id="count-doing">0</span>
                </div>
                <div class="column-cards" id="cards-doing">
                    <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">Carregando tarefas...</p>
                </div>
            </div>

            <div class="kanban-column" id="col-done">
                <div class="column-header">
                    <h3>Feito</h3>
                    <span class="task-count" id="count-done">0</span>
                </div>
                <div class="column-cards" id="cards-done">
                    <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 20px;">Carregando tarefas...</p>
                </div>
            </div>

        </div>
    `;
}
