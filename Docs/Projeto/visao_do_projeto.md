# Visão e Objetivo Final: Dashboard Financeiro para Casais

Este documento consolida o entendimento completo sobre o objetivo final do projeto de dashboard financeiro, para servir de "Norte" no desenvolvimento.

## 1. O Problema a ser Resolvido
A falta de acompanhamento de metas financeiras, gastos e investimentos mensais devido ao atrito e à complexidade das ferramentas convencionais. O objetivo é criar uma solução que não apenas rastreie os dados, mas que **incentive o uso contínuo** e seja muito fácil de manter para o casal.

## 2. Foco Principal (Visão Holística)
A plataforma centralizará toda a vida financeira do casal:
- **Receitas**: Salários e entradas financeiras de ambos.
- **Despesas**: Custos fixos, variáveis e gastos diários, separados entre despesas conjuntas e individuais.
- **Investimentos**: Acompanhamento de rentabilidade e evolução do patrimônio.
- **Metas Financeiras**: Progresso de objetivos compartilhados (ex: viagem, reserva de emergência, casa própria).

## 3. Experiência de Uso e Entrada de Dados
O sistema deve ter o mínimo de atrito possível na entrada de informações:
- **Importação em Massa**: Suporte para upload de arquivos de extrato (OFX/CSV) dos bancos, lidando com o grosso das transações de forma automatizada.
- **Lançamentos Manuais Rápidos**: Uma interface extremamente ágil e intuitiva (focada em uso mobile) para inserir gastos pontuais na mesma hora em que acontecem.

## 4. Engajamento e Gamificação
Para combater a falta de hábito e manter o casal motivado no acompanhamento:
- **Reforço Positivo**: Mensagens de incentivo constantes ao atingir marcos financeiros.
- **Conquistas (Badges)**: Selos colecionáveis ao concluir objetivos como "Mês no Azul", "Primeira Reserva", "Investidor Iniciante".
- **Visualização de Progresso**: Barras de progresso claras, animadas e visualmente recompensadoras.

## 5. Arquitetura e Tecnologias
- **Plataforma**: Aplicação Web Moderna e Responsiva (Celular e PC).
- **Frontend**: React (Next.js ou Vite) com Tailwind CSS para garantir uma estética de ponta, premium e vibrante.
- **Backend / Banco de Dados**: Supabase (PostgreSQL relacional) para gerenciar sistema de login do casal, segurança e sincronização de dados em tempo real, além de facilitar cálculos financeiros robustos a longo prazo.
