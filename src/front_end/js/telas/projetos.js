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
        const resposta = await fetch('https://trainee-projetos-api-lime.vercel.app//projects', {
            method: 'GET',
            headers: {
                'x-team-token': 'equipe-beta-2026',
            }
        });

        const projetos = await resposta.json();
        console.log('Projetos carregados:', projetos);
        containerLista.innerHTML = projetos.map(createProjectCard).join('');
    } catch (erro) {
        console.error('Erro ao carregar os dados!', erro);
        containerLista.innerHTML = `<p class="error-message">Erro ao carregar projetos.</p>`;
    }
}

function createProjectCard(projeto) {
    return `
        <article class="project-card">
            <div class="card-top-bars">
                <span></span>
                <span></span>
            </div>
            <span src></span>
            <h2>${projeto.name}</h2>
            <span class="status ${projeto.status.toLowerCase().replace(/\s/g, '-')}">${projeto.status}</span>
            <p class="project-description">${projeto.description}</p>
            <div class="project-assign">
                <span class="meta-label">Assign:</span>
                <span class="assign-value">${projeto.owner}</span>
            </div>
        </article>
    `;
}
