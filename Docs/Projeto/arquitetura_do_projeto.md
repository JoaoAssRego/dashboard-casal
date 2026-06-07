# Arquitetura do Projeto: Dashboard Financeiro

Este documento define as decisões arquiteturais e as tecnologias escolhidas para o desenvolvimento do Dashboard Financeiro. Ele serve como o guia técnico oficial ("Single Source of Truth") para você e para os agentes de IA que atuarão no código.

## 1. Stack Tecnológico Base

- **Frontend Framework**: [Next.js](https://nextjs.org/) (com App Router).
  - *Motivo*: Padrão moderno da indústria, excelente roteamento estruturado em pastas, páginas otimizadas (Server Components) e excelente compreensão por IAs.
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/).
  - *Motivo*: Autenticação "bandeja pronta", banco de dados relacional super robusto (PostgreSQL) e facilidade de manipulação de dados para usuários (casais).
- **Linguagem**: TypeScript.
  - *Motivo*: Segurança máxima com os dados, evitando erros na hora de processar números financeiros.

## 2. Interface de Usuário (UI) e Estilização

- **Framework CSS**: [Tailwind CSS](https://tailwindcss.com/).
  - *Motivo*: Estilização incrivelmente rápida, utilitária e focada na estética premium.
- **Biblioteca de Componentes**: [Shadcn UI](https://ui.shadcn.com/).
  - *Motivo*: Os componentes base não ficam escondidos numa biblioteca "mágica"; o código deles vive no nosso projeto. Agentes de IA adoram trabalhar com Shadcn para criar interfaces bonitas em pouquíssimo tempo.

## 3. Gerenciamento de Estado e Requisições

- **Data Fetching (Busca e Cache)**: [React Query / TanStack Query](https://tanstack.com/query).
  - *Motivo*: Conectado ao cliente Supabase, ele elimina dores de cabeça com telas de carregamento ("loading"), cache de dados para o sistema ficar absurdamente rápido, e retentativas em caso de falha de rede.
- **Estado Global Menor**: [Zustand](https://docs.pmnd.rs/zustand).
  - *Motivo*: Ferramenta ultra-leve para cuidar de pequenos estados globais, como se a aba lateral está aberta ou qual é o tema escolhido pelo usuário.

## 4. Estrutura de Pastas (Feature-Driven Architecture)

Para o código escalar bem e ser legível, usaremos arquitetura guiada por funcionalidade (Feature-Driven). Todo o projeto ficará focado no que ele resolve.

```text
src/
├── app/                  # Roteamento nativo do Next.js (Layouts, Páginas do sistema)
├── components/           # Componentes puramente visuais, globais e reutilizáveis (UI base, Shadcn)
├── lib/                  # Inicialização de bibliotecas (cliente do Supabase, formatadores globais)
├── features/             # "O coração do projeto" - Módulos separados por contexto
│   ├── auth/             # Componentes, hooks e regras de negócio para login
│   ├── dashboard/        # Gráficos, visão geral e cards de resumo
│   ├── transactions/     # Formulários, listas e tabelas de receitas/despesas
│   └── goals/            # Lógica das metas de economia e progresso gamificado
├── hooks/                # Custom hooks genéricos e utilitários
└── store/                # Configuração do Zustand (estado global)
```

## 5. Diretrizes de Código para IAs (Regras de Ouro)

Sempre que um agente de IA for solicitado a codificar, ele deve obrigatoriamente seguir estas regras:
1. **Priorize a pasta `features/`**: Funcionalidades específicas não devem ser espalhadas em dezenas de pastas globais. O código relacionado a transações, fica em `transactions`.
2. **Reutilize UI**: Utilize primordialmente os componentes exportados na pasta `components/ui` fornecida pelo Shadcn.
3. **Gerencie o Estado Remoto Corretamente**: Para buscar, enviar ou deletar dados do Supabase, utilize hooks customizados atrelados ao React Query.
4. **Respeite o TypeScript**: Evite usar `any`. Os dados (especialmente valores financeiros) devem ter tipagens corretas.
