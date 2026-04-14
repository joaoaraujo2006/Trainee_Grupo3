# Trainee Área de Projetos - Inteli Júnior

# Membros do Grupo

- XXXXXXXXXXXXXXX
- João Pedro Gonçalves Corrêa Araujo
- XXXXXXXXXXXXXXX
- XXXXXXXXXXXXXXX
- XXXXXXXXXXXXXXX
- Pablo Oliveira Garcia

## Proposta do Projeto

Este projeto propõe o desenvolvimento de uma aplicação web para gestão de projetos e acompanhamento de tarefas, focada em equipes que precisam organizar atividades, status e entregas.

A ideia é criar uma interface simples, clara e funcional que consuma diretamente a API fornecida, permitindo visualizar projetos, tarefas e métricas de progresso em pelo menos duas telas.

Principais funcionalidades previstas:

- Dashboard inicial com visão geral de projetos, status e indicadores de conclusão.
- Tela de detalhe do projeto com lista de tarefas, responsável, prazo e status.
- Navegação entre telas de forma clara e intuitiva.
- Consumo de dados reais da API (`/projects`, `/tasks`, `/dashboard` ou rotas equivalentes).
- Organização do frontend em HTML, CSS e JavaScript, com separação lógica entre a estrutura, estilo e comportamento.

Telas / componentes planejados:

1. **Dashboard de Projetos** – resumo geral com cards ou tabelas de projetos ativos e KPI de tarefas.
2. **Projeto Detalhado** – visão de um projeto específico com tarefas associadas e informações de progresso.

Esta proposta busca entregar um produto que não só exiba dados, mas que ajude o time a entender o andamento do trabalho e a planejar ações dentro de um contexto real de gestão de projetos.

## Requisitos Mínimos da Entrega

Para ser considerada válida, a solução deve:

- consumir a API fornecida, sem uso de dados mockados;
- ter no mínimo **duas telas** com navegação entre elas;
- exibir dados reais da API;
- ser funcional com interação básica (navegação, visualização de informação);
- apresentar organização mínima de código e separação lógica entre componentes, telas ou responsabilidades.

A escolha de tecnologias é livre: HTML/CSS puro, frameworks ou bibliotecas podem ser usados.

## Estrutura de Pastas

```
docs/
  nome_integrante/
    docs.md          # documentação da entrega individual
    index.html       # código HTML individual
    ...              # arquivos .css e .js do componente individual

src/
    front_end/       # código da entrega em grupo
    api/             # api para puxar os dados            
README.md            # documentação da entrega em grupo
```

## Links Úteis

- API: https://trainee-projetos-api.vercel.app/
- Repositório da API: https://github.com/m4rcusml/trainee-projetos-api
- A rota `/docs` na API lista endpoints, respostas e tokens necessários.

> Para acessar a documentação `/docs`, é necessário clonar o repositório da API e executar `npm run dev`.

## Estado Atual do Projeto

- A pasta `docs/` contém subpastas para cada integrante (`gabi`, `joao_araujo`, `lais`, `lucas`, `luis_felipe`, `pablo_garcia`).
- A pasta `src/front_end/` tem a estrutura básica de frontend com `html/index.html`, `css/style.css` e `js/script.js`
- O projeto inclui a API clonada em `src/api/trainee-projetos-api/`, o que já permite rodar e testar os endpoints fornecidos.

