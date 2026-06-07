# Documentação Completa: Fase 9 (Família) e Refatoração Estilo Banco Inter

Esta documentação resume todo o escopo de trabalho, as decisões de design e os próximos passos arquitetados durante esta rodada de desenvolvimento.

## 1. O Que Foi Realizado (Resumo da Conversa)

Durante esta sessão, focamos em transformar o aplicativo de um "MVP Funcional" para uma **plataforma financeira Premium**, melhorando a Experiência do Usuário (UX) e adicionando o recurso mais vital para casais:

### 1.1. Refatoração Visual (Estilo Banco Inter)
- **Minimalismo na Home:** A tela inicial (`DashboardView`) foi drasticamente limpa. Gráficos, lista de extrato e métricas secundárias foram removidos.
- **Foco no Saldo:** O elemento central agora é um grande cartão de Saldo. Ele se tornou clicável, funcionando como um portal (`/balance`) para a nova tela `BalanceDetailsView`, onde a "inteligência financeira" (Gráficos de Receita x Despesa) reside.
- **Cabeçalho com Perfil:** Adicionado um avatar no canto superior que abre o `ProfileDrawer`, centralizando as informações do usuário logado e o botão de "Sair" (Logout).

### 1.2. Menu de Serviços (Todos)
- A antiga aba "Ajustes" foi renomeada e redesenhada para "Todos" (`SettingsView`), funcionando como um verdadeiro HUB de serviços do aplicativo.
- O botão de Deslogar foi transferido para o Perfil, deixando essa área dedicada exclusivamente a funcionalidades do App (Categorias, Família, etc).

### 1.3. Ajustes de Build e Pipeline (Vercel)
- O pipeline de produção da Vercel foi bloqueado diversas vezes pelas verificações estritas do TypeScript (`tsc -b`).
- **Resoluções:** Foram removidas diversas importações ociosas, o aviso de obsolescência (`baseUrl`) no `tsconfig` foi resolvido de forma definitiva removendo a propriedade depreciada, e tipagens do `useAuthStore` foram consolidadas.

### 1.4. Módulo de Família e Convites (Fase 9)
- **Desafio:** Anteriormente, casais só podiam unir seus saldos se um administrador alterasse o `household_id` manualmente no Banco de Dados.
- **Solução Desenvolvida:**
  - **Banco de Dados:** Criação da tabela `household_invites` no Supabase e da Função Segura (RPC) `accept_household_invite`. Implementação de políticas RLS para garantir que as pessoas só vejam convites endereçados a elas.
  - **Quem Convida (Sender):** Criação do componente `FamilyDrawer`, acessível pelo Menu "Todos". Mostra os membros atuais da Família e permite enviar um convite inserindo um E-mail.
  - **Quem Recebe (Invitee):** Criação de um rastreador passivo (`InviteAlert` usando `Drawer`) na estrutura base do App (`AppLayout`). Se houver um convite, um pop-up elegante surge na tela do convidado perguntando se ele quer "Aceitar e Unir Contas". Ao aceitar, os dados são unidos instantaneamente.

---

## 2. Próximos Passos (Roadmap de Evolução)

Com o núcleo do sistema (Auth, CRUD, Compartilhamento de Casal) 100% finalizado, o aplicativo está pronto para receber Módulos Avançados de Finanças. Abaixo estão as opções mapeadas e planejadas para as próximas sessões de desenvolvimento:

### 🚀 Opção 1: Gestão de Cartões de Crédito
- **Objetivo:** Separar as despesas "À vista" (dinheiro/PIX) das despesas "No Crédito".
- **O que precisa ser feito:**
  - Tabela `credit_cards` (nome do cartão, limite, data de fechamento, data de vencimento).
  - Adicionar o campo `card_id` na tabela de transações.
  - Criar uma aba dedicada no Menu "Todos" para acompanhar a barra de progresso do limite de cada cartão e o valor parcial da Fatura do mês atual.

### 📊 Opção 2: Controle de Orçamento (Budgeting / Limites Mensais)
- **Objetivo:** Estabelecer metas agressivas de contenção de gastos por Categoria.
- **O que precisa ser feito:**
  - Tabela `budgets` com os campos `category_id` e `max_amount`.
  - Na tela de "Inteligência do Saldo", exibir barras horizontais de consumo (Ex: "Supermercado: Gastou R$ 400 de R$ 1.000").
  - Alertas visuais (amarelo, vermelho) quando o casal estiver perto de estourar o teto estabelecido.

### 🔁 Opção 3: Assinaturas e Recorrências
- **Objetivo:** Prever os gastos fixos mensais para o dinheiro não sumir de surpresa.
- **O que precisa ser feito:**
  - Tela para cadastrar "Assinaturas" (Netflix, Academia, Aluguel) com seus dias de cobrança.
  - Todo início de mês (via Supabase Edge Functions ou no carregamento inicial do App), o sistema auto-insere essas transações no extrato com o status de "A Pagar".

### 🏆 Opção 4: Gamificação e Conquistas Financeiras
- **Objetivo:** Manter o engajamento do casal no controle financeiro de forma divertida.
- **O que precisa ser feito:**
  - Sistema de badges (Selos) virtuais.
  - Ex: "Bateu a Meta de Economia", "Mês no Azul", "Mestre Poupador". Exibir essas medalhas no Perfil do usuário.

---

**Nota:** Qualquer um dos 4 caminhos acima pode ser iniciado imediatamente, pois a arquitetura atual (Vite, Tailwind, React Query e Supabase) foi projetada para receber novos blocos de código com facilidade.
