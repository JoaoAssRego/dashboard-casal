# Diretrizes de Frontend para IAs (Padrões de Qualidade)

Este documento dita o comportamento esperado de qualquer Agente de IA ao escrever ou modificar o código da interface (Frontend) deste projeto. O objetivo é garantir consistência absoluta, evitar códigos "frankenstein" e prevenir quebras na arquitetura ao longo dos meses.

## 1. Think Before You Code (Pesquisa Obrigatória)
A IA nunca deve ser ansiosa ou programar baseada em "instinto" inicial.
Antes de planejar ou programar qualquer funcionalidade nova, a IA é **expressamente obrigada** a usar ferramentas de busca para investigar como a base de código resolveu problemas similares.
- Como as subpastas em `features/` estão organizadas?
- Qual é o padrão de nomenclatura (kebab-case, camelCase)?
- Como os hooks e estados estão sendo exportados?

**Regra Ouro**: A IA deve replicar fielmente a arquitetura e os padrões vigentes antes de inventar novas formas de programar.

## 2. Shadcn First (Busca Obrigatória de UI)
O projeto usa Shadcn UI. A IA é **proibida de criar componentes visuais complexos do absoluto zero** (como botões customizados com dezenas de classes do Tailwind perdidas no arquivo da tela) se já existir um correspondente na pasta global `components/ui`.
- Se um componente precisar ser criado, ele deve obrigatoriamente respeitar a **Paleta de Cores Oficial** (Roxo, Rosa e Azul Marinho), sem introduzir cores genéricas ou fugir da estética premium acordada em `ui_ux_premium.md`.

## 3. Defesa Extrema e Reuso (Zod + Fallbacks)
A IA não pode programar focando apenas no "Caminho Feliz" (onde a internet não falha e o usuário digita tudo certo).
- **Formulários**: Todos os inputs devem ter seus dados validados rigorosamente e fortemente tipados com a biblioteca `zod` antes de serem enviados ao banco Supabase.
- **Carregamentos e Erros**: O aplicativo terá estados de carregamento ou erro. A IA não pode "inventar" uma tela branca de falha nova para cada página; ela deve procurar e utilizar os **Loading Skeletons** e componentes de *Error Boundary* globais já definidos pelo projeto, garantindo que o usuário não se assuste com erros técnicos na tela.
