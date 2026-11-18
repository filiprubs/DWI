# Chat com IA (LLM)

Aplicação web de chat com um modelo de linguagem, feita com HTML, CSS e JavaScript puro
(sem backend). Projeto do Desafio Prático – Chat com LLM.

## Integrantes

- Filipe Rubson de Almeida Santos

## API utilizada

- **Provedor:** [Groq](https://console.groq.com) (API compatível com Chat Completions)
- **Modelo:** `openai/gpt-oss-20b`
- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`

## Funcionalidades

- Interface de chat com balões distintos para usuário e IA
- Histórico enviado a cada requisição (a IA mantém o contexto)
- Indicador de carregamento enquanto a resposta não chega
- Tratamento de erros (chave inválida, limite de uso, falha de rede, erro do servidor)
- Botão "Nova conversa" que limpa o histórico
- Enter envia a mensagem; Shift+Enter quebra a linha

## Como executar

### Pré-requisitos

- Um navegador atualizado (Chrome, Edge ou Firefox)
- Conexão com a internet
- Uma conta gratuita na Groq (https://console.groq.com)
- Não é necessário instalar nada: o projeto não usa backend, npm nem servidor

### Passo a passo

1. **Baixe o projeto** e mantenha os cinco arquivos na mesma pasta:
   `index.html`, `style.css`, `script.js`, `config.js` e `README.md`.

2. **Gere uma chave de API de teste** em https://console.groq.com/keys
   (botão *Create API Key*). Copie a chave na hora, pois ela só aparece completa uma vez.
   Ela começa com `gsk_`.

3. **Configure o `config.js`.** Abra o arquivo e deixe-o assim, trocando apenas a chave:

   ```js
   const API_URL = "https://api.groq.com/openai/v1/chat/completions";
   const API_KEY = "gsk_sua_chave_aqui";
   const MODEL = "openai/gpt-oss-20b";
   ```

   Se o arquivo `config.js` não existir (por exemplo, ao clonar o repositório do GitHub),
   crie um com esse conteúdo. A chave deve ficar entre aspas, sem espaços sobrando.

4. **Abra o `index.html`** no navegador com duplo clique, ou clique com o botão direito
   no arquivo no VS Code e escolha *Open with Live Server*.

5. **Converse:** digite a mensagem e envie com o botão **Enviar** ou com **Enter**
   (**Shift + Enter** quebra a linha). Use **Nova conversa** para limpar o histórico.

> Se alterar o `config.js` com a página aberta, atualize o navegador com **Ctrl + Shift + R**.

### Problemas comuns

A própria aplicação mostra o erro em um balão vermelho, junto com o detalhe enviado pela API:

| Mensagem exibida | Causa provável | Como resolver |
|------------------|----------------|---------------|
| "Você ainda não colocou sua chave de API..." | O `config.js` ainda está com `COLE_SUA_CHAVE_AQUI` | Cole sua chave entre as aspas |
| "Essa chave não parece ser da Groq..." | A chave é de outro serviço ou foi copiada incompleta | Gere uma nova em console.groq.com/keys (deve começar com `gsk_`) |
| "Chave de API inválida..." | Chave errada, revogada ou com caracteres a mais | Gere outra chave e atualize o `config.js` |
| "Modelo ou endereço da API não encontrado..." | O nome em `MODEL` não está mais disponível | Troque por outro modelo da lista em https://console.groq.com/docs/models |
| "Limite de requisições atingido..." | Limite do plano gratuito | Aguarde alguns instantes e tente de novo |
| "Não foi possível conectar..." | Sem internet ou bloqueio de rede | Verifique a conexão e tente novamente |

### Ao publicar no GitHub

Como a chave fica visível em qualquer código JavaScript executado no navegador,
**não envie o `config.js` com a chave real**. Crie um arquivo `.gitignore` com o conteúdo
`config.js` antes do primeiro commit. Para a entrega ao professor, envie o `config.js` com
`COLE_SUA_CHAVE_AQUI` no lugar da chave, para que cada pessoa use a sua.

## Estrutura

| Arquivo      | Função                                           |
|--------------|--------------------------------------------------|
| `index.html` | Estrutura da página                              |
| `style.css`  | Aparência (balões, layout, animação de carregamento) |
| `script.js`  | Lógica do chat e integração com a API            |
| `config.js`  | URL, chave e modelo da API (não versionado)      |

## Aviso de segurança

Como a chamada é feita direto no navegador, a chave de API fica visível para quem
abrir o código. Use apenas chaves de teste e **não publique `config.js`** em repositórios
públicos (ele está no `.gitignore`).