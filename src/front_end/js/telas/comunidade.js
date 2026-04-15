export function getComunidadeView() {
    return `
    <div class="scroll-container comunidade-scroll">
        <header class="page-header" id="comunidade-header">
            <div>
                <h1>Comunidades</h1>
                <p>Troque ideias, tire dúvidas e colabore com os membros dos seus projetos.</p>
            </div>
        </header>

        <main class="comunidade-container" id="view-grade">
            <h3 class="section-title">Comunidades de Projetos</h3>
            <div class="communities-grid" id="lista_comunidades_projetos">
                <p style="color: var(--text-muted);">Carregando canais da API...</p>
            </div>

            <h3 class="section-title" style="margin-top: 32px;">Comunidades Pessoais</h3>
            <div class="communities-grid" id="lista_comunidades_pessoais">
                </div>
        </main>

        <main class="chat-container hidden" id="view-chat">
            <div class="chat-header">
                <button class="back-btn" id="btn-voltar-grade">
                    <i class="ph ph-arrow-left"></i> Voltar
                </button>
                <div class="chat-info">
                    <h2 id="chat-room-name">Nome do Projeto</h2>
                    <span class="chat-status">🟢 Online</span>
                </div>
            </div>

            <div class="chat-messages" id="chat-messages-area">
                </div>

            <div class="chat-input-wrapper">
                <div class="chat-input-box">
                    <button class="attach-btn"><i class="ph ph-plus-circle"></i></button>
                    <input type="text" id="chat-input" placeholder="Digitar mensagem...">
                    <button class="send-btn" id="btn-send-msg"><i class="ph ph-paper-plane-tilt"></i></button>
                </div>
            </div>
        </main>
    </div>
    `;
}

export function initComunidade() {
    const viewGrade = document.getElementById('view-grade');
    const viewChat = document.getElementById('view-chat');
    const header = document.getElementById('comunidade-header');
    const btnVoltar = document.getElementById('btn-voltar-grade');

    const containerProjetos = document.getElementById('lista_comunidades_projetos');
    const containerPessoais = document.getElementById('lista_comunidades_pessoais');

    const chatRoomName = document.getElementById('chat-room-name');
    const chatMessagesArea = document.getElementById('chat-messages-area');
    const chatInput = document.getElementById('chat-input');
    const btnSendMsg = document.getElementById('btn-send-msg');

    let comunidadeAtivaId = null;

    const comunidadesPessoais = [
        { id: 'p1', name: 'Geral - Trainees', desc: 'Avisos gerais e bate-papo.', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=150&fit=crop' },
        { id: 'p2', name: 'Grupo 3 - Trainees', desc: 'Os goats 🐐.', img: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=500&h=150&fit=crop' }
    ];

    async function carregarProjetos() {
        try {
            const resposta = await fetch('https://trainee-projetos-api-lime.vercel.app/projects', {
                method: 'GET',
                headers: { 'x-team-token': 'equipe-beta-2026' }
            });
            const projetos = await resposta.json();

            containerProjetos.innerHTML = '';
            projetos.forEach(projeto => {
                const imagemSegura = projeto.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=150&fit=crop';
                const card = criarCardComunidade(projeto.id, projeto.name, projeto.description, imagemSegura);
                containerProjetos.appendChild(card);
            });
        } catch (erro) {
            console.error('Erro ao carregar projetos:', erro);
            containerProjetos.innerHTML = `<p style="color: var(--brand-red);">Falha ao conectar com a API.</p>`;
        }
    }

    function criarCardComunidade(id, nome, descricao, imagem) {
        const article = document.createElement('article');
        article.className = 'community-card';

        article.innerHTML = `
            <div class="card-cover">
                <img src="${imagem}" alt="Capa de ${nome}">
            </div>
            <div class="card-body">
                <h2>${nome}</h2>
                <p>${descricao || 'Sem descrição.'}</p>
                <div class="card-footer">
                    <span class="enter-link">Entrar no canal <i class="ph ph-arrow-right"></i></span>
                </div>
            </div>
        `;

        article.addEventListener('click', () => {
            abrirChat(id, nome);
        });

        return article;
    }

    function renderizarPessoais() {
        containerPessoais.innerHTML = '';
        comunidadesPessoais.forEach(com => {
            const card = criarCardComunidade(com.id, com.name, com.desc, com.img);
            containerPessoais.appendChild(card);
        });
    }

    function abrirChat(id, nome) {
        comunidadeAtivaId = id;
        chatRoomName.textContent = `${nome}`;

        viewGrade.classList.add('hidden');
        header.classList.add('hidden');
        viewChat.classList.remove('hidden');

        carregarMensagens(id);
    }

    function fecharChat() {
        comunidadeAtivaId = null;
        viewChat.classList.add('hidden');
        viewGrade.classList.remove('hidden');
        header.classList.remove('hidden');
    }

    function carregarMensagens(id) {
        chatMessagesArea.innerHTML = '';
        const mensagens = JSON.parse(localStorage.getItem(`chat_${id}`)) || [
            { autor: 'Sistema', texto: 'Bem-vindo ao canal!', isMe: false, hora: '00:00' }
        ];

        mensagens.forEach(msg => adicionarMensagemNaTela(msg));
        scrollParaBaixo();
    }

    function adicionarMensagemNaTela(msg) {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.isMe ? 'my-message' : 'other-message'}`;

        div.innerHTML = `
            <div class="msg-avatar">
                <img src="https://ui-avatars.com/api/?name=${msg.autor}&background=${msg.isMe ? 'ff6045' : '1e1e24'}&color=fff" alt="${msg.autor}">
            </div>
            <div class="msg-content">
                <div class="msg-header">
                    <span class="msg-author">${msg.autor}</span>
                    <span class="msg-time">${msg.hora}</span>
                </div>
                <div class="msg-bubble">${msg.texto}</div>
            </div>
        `;
        chatMessagesArea.appendChild(div);
    }

    function enviarMensagem() {
        const texto = chatInput.value.trim();
        if (!texto || !comunidadeAtivaId) return;

        const agora = new Date();
        const msg = {
            autor: 'Você',
            texto: texto,
            isMe: true,
            hora: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
        };

        const mensagens = JSON.parse(localStorage.getItem(`chat_${comunidadeAtivaId}`)) || [
            { autor: 'Sistema', texto: 'Bem-vindo ao canal!', isMe: false, hora: '00:00' }
        ];
        mensagens.push(msg);
        localStorage.setItem(`chat_${comunidadeAtivaId}`, JSON.stringify(mensagens));

        adicionarMensagemNaTela(msg);
        chatInput.value = '';
        scrollParaBaixo();
    }

    function scrollParaBaixo() {
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }

    btnVoltar.addEventListener('click', fecharChat);
    btnSendMsg.addEventListener('click', enviarMensagem);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            enviarMensagem();
        }
    });

    carregarProjetos();
    renderizarPessoais();
}