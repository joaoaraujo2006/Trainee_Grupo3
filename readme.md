# Trainee Área de Projetos - Inteli Júnior

# Membros do Grupo

- Laís Victoria Lopes de Araújo
- João Pedro Gonçalves Corrêa Araujo
- Gabrie
- Lucas
- Luis Felipe
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

## Decisões Técnicas

Optamos por utilizar HTML, CSS e JavaScript puro para o desenvolvimento do frontend, visando simplicidade, controle total sobre o código e facilidade de integração entre os membros da equipe.

A separação entre HTML, CSS e JavaScript foi adotada para garantir organização e clareza no desenvolvimento, permitindo que diferentes integrantes trabalhem em partes específicas do sistema sem conflitos.

A estrutura de pastas foi definida para separar claramente:
- Componentes individuais (`docs/`)
- Aplicação integrada (`src/front_end/`)
- API (`src/api/`)

Essa organização facilita manutenção, escalabilidade e entendimento do projeto.

## Uso de IA

A equipe utilizou ferramentas de Inteligência Artificial, como o ChatGPT, para:

- Esclarecimento de dúvidas técnicas
- Auxílio na estruturação de componentes
- Sugestões de organização de código e layout
- Apoio no entendimento do fluxo de integração com API

O uso da IA foi feito como suporte, garantindo que todos os membros compreendessem as soluções implementadas.

## Divisão de Responsabilidades

- Laís: Desenvolvimento de componente individual e apoio na estruturação da interface
- João Pedro: Implementação de funcionalidades e integração
- Gabriel: Estilização e layout
- Lucas: Estrutura HTML e organização de componentes
- Luis Felipe: Integração com API
- Pablo: Suporte geral e testes

A divisão foi feita de forma a equilibrar as responsabilidades e permitir colaboração entre os membros.

## Scrum Master

O Scrum Master da equipe foi [NOME].

Sua atuação incluiu:
- Organização das tarefas entre os membros
- Acompanhamento do progresso
- Facilitação da comunicação entre a equipe
- Garantia de alinhamento entre as partes do projeto

Apesar do papel definido, todos os membros contribuíram ativamente no desenvolvimento técnico.

## Dúvidas e Observações

Durante o desenvolvimento, a equipe identificou alguns desafios:

- Entendimento inicial da estrutura da API
- Organização do trabalho em equipe
- Integração dos componentes individuais em uma aplicação única

Esses desafios foram sendo resolvidos ao longo do processo, com comunicação entre os membros e apoio de ferramentas externas.

A equipe optou por uma solução funcional e organizada, priorizando clareza na interface e usabilidade.

## Conclusão

O projeto foi desenvolvido com foco em organização, clareza e colaboração em equipe, simulando um ambiente real de desenvolvimento.

A solução proposta atende aos requisitos mínimos e demonstra a capacidade da equipe de estruturar e integrar um sistema funcional a partir de uma API real.
