export function getConfigView() {
    return `
    <div class="scroll-container">
        <header class="page-header">
            <div>
                <h1>Configurações</h1>
                <p>Gerencie suas preferências, integrações e dados da conta.</p>
            </div>
        </header>

        <main class="config-content">
            
            <section class="config-panel">
                <div class="panel-header">
                    <h2><i class="ph ph-user"></i> Meu Perfil</h2>
                </div>
                <div class="config-form">
                    <div class="avatar-section">
                        <img src="https://ui-avatars.com/api/?name=Fulano+Da+Silva&background=ff6045&color=fff&size=128" alt="Avatar" class="profile-avatar">
                        <button class="btn-outline">Alterar Foto</button>
                    </div>
                    <div class="input-group">
                        <label>Nome Completo</label>
                        <input type="text" value="Fulano Da Silva" disabled>
                    </div>
                    <div class="input-group">
                        <label>Cargo / Instituição</label>
                        <input type="text" value="Desenvolvedor Frontend - Inteli" disabled>
                    </div>
                </div>
            </section>

            <section class="config-panel">
                <div class="panel-header">
                    <h2><i class="ph ph-bell"></i> Notificações</h2>
                </div>
                <div class="toggle-list">
                    <div class="toggle-item">
                        <div>
                            <strong>Novas Tarefas no Kanban</strong>
                            <p>Receber alertas quando uma tarefa for atribuída a você.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="toggle-item">
                        <div>
                            <strong>Mensagens na Comunidade</strong>
                            <p>Notificações de novos chats nos projetos ativos.</p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </section>

            <section class="config-panel">
                <div class="panel-header">
                    <h2><i class="ph ph-plug"></i> Conexão com API</h2>
                </div>
                <div class="config-form">
                    <div class="input-group">
                        <label>Token da Equipe (x-team-token)</label>
                        <div class="input-with-button">
                            <input type="text" id="api-token-input" placeholder="Ex: equipe-beta-2026">
                            <button class="btn-primary" id="btn-save-token">Salvar Token</button>
                        </div>
                        <p class="help-text">Este token é usado para buscar os projetos e tarefas do servidor.</p>
                    </div>
                </div>
            </section>

            <section class="config-panel danger-zone">
                <div class="panel-header">
                    <h2 class="danger-text"><i class="ph ph-warning"></i> Zona de Perigo</h2>
                </div>
                <div class="danger-content">
                    <div>
                        <strong>Limpar Dados Locais</strong>
                        <p>Isso apagará todo o histórico de chats da Comunidade e eventos da Agenda salvos no seu navegador.</p>
                    </div>
                    <button class="btn-danger" id="btn-clear-data">Apagar Tudo</button>
                </div>
            </section>

        </main>
    </div>
    `;
}

export function initConfig() {
    const btnSaveToken = document.getElementById('btn-save-token');
    const tokenInput = document.getElementById('api-token-input');
    const btnClearData = document.getElementById('btn-clear-data');

    const savedToken = localStorage.getItem('inteliJr_api_token') || 'equipe-beta-2026';
    if (tokenInput) {
        tokenInput.value = savedToken;
    }

    if (btnSaveToken) {
        btnSaveToken.addEventListener('click', () => {
            const newToken = tokenInput.value.trim();
            if (newToken) {
                localStorage.setItem('inteliJr_api_token', newToken);
                btnSaveToken.textContent = "Salvo!";
                btnSaveToken.style.backgroundColor = "#10b981";
                setTimeout(() => {
                    btnSaveToken.textContent = "Salvar Token";
                    btnSaveToken.style.backgroundColor = "";
                }, 2000);
            }
        });
    }

    if (btnClearData) {
        btnClearData.addEventListener('click', () => {
            const confirmacao = confirm("Tem certeza? Isso vai apagar todas as mensagens do chat e compromissos da agenda.");
            if (confirmacao) {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('chat_') || key === 'inteliJr_agenda') {
                        localStorage.removeItem(key);
                    }
                });
                alert("Dados locais limpos com sucesso!");
            }
        });
    }
}