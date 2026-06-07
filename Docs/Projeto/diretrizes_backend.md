# Diretrizes de Backend e Integração (Padrões de Qualidade)

Este documento dita o comportamento esperado de qualquer Agente de IA ao estruturar e executar a lógica de negócios e as conexões com o banco de dados (Supabase) neste projeto. O foco é manter um código limpo (Clean Code), totalmente previsível e nunca repetir lógicas (DRY - Don't Repeat Yourself).

## 1. Clean Architecture: Isolamento Estrito de Serviços
Uma interface visual (Frontend) jamais deve saber os detalhes de como se comunicar com o banco de dados. Isso previne que o código se torne um emaranhado impossível de atualizar futuramente.
- A IA é **estritamente proibida** de escrever comandos como `supabase.from('transacoes').select('*')` diretamente dentro de funções de botões, arquivos `.tsx` visuais ou modais.
- **Padrão Obrigatório**: Toda e qualquer comunicação de rede ou persistência de dados deve ser obrigatoriamente encapsulada em um arquivo de serviço dedicado (ex: `features/transactions/api/queries.ts`) e depois exposta para a interface visual utilizando Hooks Customizados (ex: `useTransactions()`) em conjunto com o React Query.

## 2. O Padrão DRY (Don't Repeat Yourself) para Queries e Tipos
O principal sintoma de um código de IA mal gerenciado é a criação de 5 tipagens TypeScript diferentes espalhadas pelo projeto para representar a mesma tabela de "Metas".
- **Busca Obrigatória Pré-Implementação**: Antes de construir a lógica de backend para uma nova feature, a IA tem a **obrigação** inegociável de vasculhar a base de código utilizando ferramentas de pesquisa. A missão é descobrir se consultas semelhantes ou interfaces de tipagem já existem e podem ser estendidas ou reaproveitadas.
- Os tipos do banco de dados (Types) devem emanar de um ponto centralizado e não devem ser reinventados na mão toda vez que o agente for buscar dados. O reuso é rei.

## 3. Foco no Resultado Final e na Segurança (RLS)
O projeto lida com o núcleo financeiro de um casal. Não pode haver falhas de visualização.
A IA não deve ser apenas uma "geradora de botões", mas assumir a persona de um **Arquiteto de Segurança de Dados**.
- Quando o usuário solicitar uma alteração ou criação de uma regra de negócio (ex: "apagar uma despesa antiga"), a IA deve avaliar imediatamente como isso afeta o backend no grande esquema.
- Em vez de confiar que a aplicação visual vai esconder os dados proibidos, a IA deve focar sua energia em garantir que as regras de segurança em nível de linha (RLS - Row Level Security) do Supabase suportam e previnem falhas em nível de servidor. O banco de dados é a nossa barreira de ferro.
