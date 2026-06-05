# Features (Arquitetura Guiada por Funcionalidade)

Nesta pasta, o código deve ser dividido pelo contexto de negócio (Feature-Driven), e não pelo tipo de arquivo.

Exemplo de pastas que nascerão aqui:
- `/transactions` (Controle financeiro)
- `/dashboard` (Resumo e gráficos)
- `/goals` (Gamificação e metas)
- `/auth` (Login e Sessão)

Cada pasta deve conter seus próprios componentes, hooks e chamadas de API (serviços) relevantes àquela funcionalidade para mantermos o código limpo (Clean Architecture) e as IAs não se perderem.
