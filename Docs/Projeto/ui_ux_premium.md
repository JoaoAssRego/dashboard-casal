# Diretrizes de UI/UX (Interface e Experiência do Usuário)

Este documento define a linguagem visual, os padrões de navegação e as escolhas de Experiência do Usuário (UX) para o PWA do Dashboard Financeiro. O objetivo máximo é entregar a sensação de um **Aplicativo Premium, Exclusivo e Absolutamente Fluido**.

## 1. Identidade Visual (A "Vibe" Premium)

- **Tema Base**: Modo Escuro (Dark Mode) Nativo "Tech/Premium".
  - *Fundos*: Pretos profundos (estilo OLED) ou cinza extremamente escuro. Isso gera imersão, modernidade e conforto visual.
  - *Cores Exclusivas (Paleta PWA)*: O aplicativo utilizará estritamente as cores **Roxo**, **Rosa** e **Azul (Marinho)** para criar sua identidade premium:
    - **Azul Marinho**: Para transmitir calma, segurança nas finanças e saldos estruturais. Fica extremamente luxuoso contra fundos escuros quando aplicado em áreas de destaque.
    - **Roxo e Rosa**: Utilizados para a identidade vibrante do casal, preenchimento de barras de progresso (metas), selos de conquistas (gamificação) e para o botão de ação principal.
  - *Tipografia e Formas*: Fontes sem serifa (limpas) e cantos de cartões bem arredondados para passar um ar amigável e não-corporativo.

## 2. Padrão de Navegação (Fricção Zero)

A navegação foi projetada para ser operada rapidamente com **apenas uma mão no celular**:

- **Barra de Navegação Inferior (Bottom Tabs)**: Onde moram as raízes do app (Ex: Home, Extrato, Metas). Sempre acessível pelo polegar.
- **Botão de Ação Flutuante Central (O grande '+')**: Posicionado no centro exato da barra inferior, em destaque usando a paleta vibrante (ex: gradiente Roxo para Rosa).
  - *A Experiência*: Este é o coração do "baixo atrito". O usuário tira o celular do bolso no supermercado, toca nesse botão no meio da tela e lança o gasto em poucos segundos, sem precisar caçar menus escondidos.

## 3. Estrutura do Dashboard (Home)

A tela inicial foge da "lista de banco chata". Ela será um **Mural Gamificado Inspirador**:

- **Topo (Hero)**: Saldo consolidado grande e orgulhoso, com a funcionalidade de ocultar valores (olhinho) para privacidade em público.
- **Blocos (Cards / Widgets)**: Inspirados nos widgets modernos do iOS, o restante da tela será empilhado em blocos que "contam uma história":
  - *Card de Progresso das Metas*: Exibe barras de carregamento muito visuais (em Rosa e Roxo) mostrando o quão perto o casal está de um objetivo.
  - *Vitrine de Conquistas*: Uma área mostrando o último selo (badge) ganho ou uma mensagem de incentivo do dia.
  - *Saúde do Orçamento*: Indicadores visuais rápidos avisando se os gastos estão dentro do planejado para a semana.

## 4. Diretrizes Técnicas (Para IAs de Desenvolvimento)
- Ao desenvolver os componentes visuais com Tailwind, priorize bordas suaves (`rounded-2xl`, `rounded-3xl`) e espaçamentos internos generosos (`p-4`, `p-6`) para que os cards "respirem".
- Animações e transições do CSS devem ser usadas ao preencher barras de meta ou abrir modais. Nada deve aparecer "do nada", tudo deve deslizar ou surgir suavemente.
- O tema não deve utilizar cores genéricas (como o verde padrão de sucesso ou o vermelho aberto padrão de erro), a não ser que estritamente necessário. A UI deve orbitar em torno do Roxo, Rosa e Azul Marinho.
