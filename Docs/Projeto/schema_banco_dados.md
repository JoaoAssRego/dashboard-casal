# Dicionário de Dados e Padrões do Banco (Supabase)

Este documento atua como a documentação oficial do banco de dados (PostgreSQL) do projeto. É um documento VIVO. **Agentes de IA: Vocês devem ler este arquivo obrigatoriamente antes de estruturar queries, e devem atualizá-lo sempre que criarem ou alterarem tabelas no Supabase.**

## 1. Convenções de Nomenclatura (Regras Inquebráveis)
- **Padrão Nativo**: O banco de dados utilizará estritamente o `snake_case` para tabelas e colunas (ex: `user_profiles`, `target_amount`). É proibido usar camelCase no banco. A conversão de dados para uso no React ocorrerá via utilitários no Frontend.
- **Chaves Primárias (PK)**: Todas as tabelas devem possuir uma coluna `id` do tipo `UUID`, gerada automaticamente (`uuid_generate_v4()`).
- **Chaves Estrangeiras (FK)**: As referências devem seguir o padrão `nome_singular_tabela_id`. Exemplo: `user_id`, `household_id`.
- **Rastreio de Tempo**: Todas as tabelas devem ter a coluna `created_at` (`timestamptz` com default `now()`). É altamente recomendável ter `updated_at`.

## 2. A Estrutura de "Casal" (Multi-Tenant via Household)
O sistema foi modelado arquiteturalmente para agrupar usuários, não para isolá-los. 
A entidade soberana do aplicativo é o **Household** (A Conta Conjunta).
- Toda transação, categoria ou meta não pertence ao usuário "João", mas sim ao `household_id` vinculado ao João e sua namorada.
- As regras de segurança em nível de linha (RLS do Supabase) devem basear-se quase inteiramente na verificação de "O usuário solicitante pertence ao `household_id` dessa linha?".
- Para controle e gamificação individual ("Selo de quem guardou mais dinheiro no mês"), usa-se a coluna referencial `created_by` nas tabelas operacionais.

---

## 3. Blueprint do Banco de Dados (Estrutura Atual)

*(As IAs devem manter esta sessão atualizada com os campos exatos existentes na nuvem)*

### 1. `households` (Conta do Casal)
Entidade agrupadora principal.
- `id` (UUID, PK)
- `name` (Text) - Ex: "João & Namorada"
- `created_at` (Timestamp)

### 2. `user_profiles` (Extensão da Autenticação)
Conectada via trigger ao sistema de login nativo do Supabase (`auth.users`).
- `id` (UUID, PK, FK -> `auth.users.id`)
- `household_id` (UUID, FK -> `households.id`) - Define qual conta conjunta o usuário acessa.
- `display_name` (Text)
- `avatar_url` (Text, Opcional)
- `created_at` (Timestamp)

### 3. `transactions` (Receitas, Despesas e Aportes)
A tabela volumétrica principal.
- `id` (UUID, PK)
- `household_id` (UUID, FK -> `households.id`) - Define a posse dos dados.
- `created_by` (UUID, FK -> `user_profiles.id`) - Quem gerou o lançamento.
- `type` (Text/Enum: `income`, `expense`, `investment`)
- `amount` (Numeric/Decimal) - *Dinheiro nunca deve ser armazenado como Float.*
- `description` (Text)
- `transaction_date` (Date)
- `created_at` (Timestamp)

### 4. `financial_goals` (Metas e Gamificação)
O coração da motivação do usuário.
- `id` (UUID, PK)
- `household_id` (UUID, FK -> `households.id`)
- `title` (Text) - Ex: "Reserva de Emergência"
- `target_amount` (Numeric/Decimal)
- `current_amount` (Numeric/Decimal)
- `status` (Text/Enum: `active`, `achieved`, `paused`)
- `created_at` (Timestamp)

---

## 4. Segurança: Funções e Políticas (RLS / RPC)

*(Seção parcial — documenta as funções `SECURITY DEFINER` e as políticas mais sensíveis. As migrations em `supabase/migrations/` são a fonte da verdade.)*

### Funções `SECURITY DEFINER`
Todas com `SET search_path = ''`, corpo qualificado com `public.`, identidade derivada de `auth.uid()`/`auth.jwt()` (nunca de parâmetro), e `EXECUTE` concedido só a `authenticated` (revogado de `anon`/`public`).

- **`create_household_for_user(household_name TEXT) RETURNS UUID`** (phase10) — cria o household sob demanda no primeiro acesso e vincula ao perfil. Anti-sequestro: falha se o usuário já pertence a um household. O `household_name` é cosmético; a posse vem de `auth.uid()`.
- **`accept_household_invite(invite_id UUID)`** (phase10) — valida que `invitee_email = auth.jwt()->>'email'` e move o perfil para o household do convite. Única via de entrada em outro household.
- **`handle_new_user()`** (trigger em `auth.users`, phase10) — cria a linha em `user_profiles` no cadastro.
- **`current_household_id() RETURNS UUID`** (phase11) — retorna o `household_id` do usuário atual *bypassando* o RLS de `user_profiles`. Existe para ser usada DENTRO de políticas da própria `user_profiles` sem causar recursão infinita de RLS.

### Políticas de `user_profiles`
- **SELECT** — duas políticas permissivas (combinadas por OR):
  1. `id = auth.uid()` (próprio perfil; setup inicial).
  2. `household_id = public.current_household_id()` (phase11) — permite ao casal ver os perfis do **mesmo** household. É o que faz `getHouseholdMembers()` funcionar (antes só retornava o próprio usuário).
- **UPDATE** (phase10) — `USING (id = auth.uid())` + `WITH CHECK` que **congela** o `household_id` (o usuário não troca o próprio household direto na tabela; só via `accept_household_invite`).

### Demais tabelas operacionais (`transactions`, `financial_goals`, `categories`, `household_invites`)
RLS ancorado em pertencimento ao household: `household_id IN (SELECT household_id FROM public.user_profiles WHERE id = auth.uid())`, com `WITH CHECK` espelhando o `USING` em INSERT/UPDATE (phase10) para impedir mover linha para outro household. `household_invites` tem ainda uma política de destinatário (`invitee_email = auth.jwt()->>'email'`).
