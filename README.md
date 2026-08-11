# Brinka Frontend

Frontend do projeto **Brinka**, uma plataforma de e-commerce desenvolvida com HTML, CSS e JavaScript, projetada para oferecer uma experiência de compra acessível, inclusiva e intuitiva para todos os usuários.

## ♿ Sobre o Projeto

O Brinka é um e-commerce que tem a acessibilidade digital como um dos seus principais pilares.

Nosso objetivo é garantir que pessoas com diferentes necessidades possam navegar, compreender e utilizar a plataforma de forma autônoma e eficiente.

O desenvolvimento seguirá boas práticas de acessibilidade, promovendo uma experiência mais inclusiva para todos os usuários.

### Princípios de Acessibilidade

- Uso correto de HTML semântico.
- Compatibilidade com leitores de tela.
- Navegação completa por teclado.
- Contraste adequado entre cores.
- Textos alternativos para imagens.
- Estrutura clara de títulos e conteúdos.
- Formulários acessíveis.
- Design responsivo e adaptável.

## ♿ Diretrizes de Desenvolvimento

Durante o desenvolvimento, toda nova funcionalidade deverá considerar requisitos de acessibilidade.

### Checklist Básico

- [ ] Utilizar tags HTML semânticas.
- [ ] Garantir navegação por teclado.
- [ ] Adicionar atributos `aria-*` quando necessário.
- [ ] Definir textos alternativos em imagens.
- [ ] Garantir contraste adequado.
- [ ] Associar labels aos campos de formulário.
- [ ] Evitar depender apenas de cores para transmitir informações.
- [ ] Testar a navegação utilizando apenas teclado.

## SEO básico

O arquivo `index.html` contém a base de SEO do site:

- título da aba (`<title>`) com o nome da marca e o assunto da página;
- descrição curta (`meta description`), que pode aparecer no Google;
- idioma definido como português do Brasil (`lang="pt-BR"`);
- dados de compartilhamento para redes sociais (Open Graph);
- dados estruturados do tipo `WebSite`, para ajudar buscadores a entenderem o projeto;
- título principal (`h1`) e títulos de seção (`h2`) em uma ordem semântica;
- ícone da aba do navegador (favicon).

Quando o site estiver hospedado, ainda será necessário informar a URL pública
para adicionar `canonical`, `og:url`, `og:image`, `sitemap.xml` e `robots.txt`.
Esses arquivos não foram criados agora porque o projeto ainda não possui um
domínio público para apontar corretamente.

## Integração futura com backend

O catálogo funciona sem backend usando os dados locais do projeto e o
`localStorage` para avaliações adicionadas pelo navegador.

Quando uma API estiver disponível, configure sua URL em
`js/services/api-config.js`:

```js
window.BRINKA_API_URL = 'https://seu-dominio.com/api';
```

A camada `js/services/catalog-api.js` espera estas rotas:

- `GET /products`
- `GET /products/:productId/reviews`
- `POST /products/:productId/reviews`, com `{ name, text, rating }`

O frontend nunca deve receber credenciais do banco de dados. Ele conversa com
a API, e somente o backend acessa o banco.

## Carrinho e preparação do pedido

O carrinho é salvo automaticamente no `localStorage` com a chave
`brinka:cart:v1`. Por isso, produtos, quantidades e total continuam disponíveis
depois de atualizar a página.

O estado salvo tem este formato:

```js
{
  version: 1,
  currency: 'BRL',
  items: [
    { id, name, image, color, unitPrice, quantity, lineTotal }
  ],
  totalQuantity,
  subtotal,
  total
}
```

O estado atual pode ser lido com `window.brinkaCart.getSnapshot()`. Sempre que
o carrinho muda, o documento dispara o evento `cart:updated`. Ao clicar em
“Finalizar compra”, ele dispara `cart:checkout` com o rascunho do pedido em
`event.detail.order`. Nenhuma compra ou requisição é realizada neste momento.

O backend futuro deverá receber principalmente o `id` e a `quantity` de cada
item e recalcular os preços no servidor. O total enviado pelo navegador serve
para exibição e conferência, mas não deve ser considerado confiável para
cobrança.

## Navegação por voz

O site usa controles HTML nativos e nomes acessíveis compatíveis com Controle
por Voz do macOS/iPhone e Voice Access do Windows/Android. Não é necessário
liberar o microfone para o próprio site.

Exemplos de comandos disponíveis nas ferramentas do sistema:

- “Clique em Carrinho”
- “Clique em Ver coleção”
- “Clique em Adicionar Mari Marrão ao carrinho”
- “Clique em Ver detalhes de Mari Marrão”
- “Clique em Fechar detalhes”
- “Clique em Finalizar compra”

Quando o modal de detalhes é aberto sobre o carrinho, apenas o modal ativo fica
disponível para as tecnologias assistivas. Ao fechá-lo, o foco retorna ao
produto selecionado no carrinho.

### Comandos de voz internos

O módulo `js/components/voice-navigation.js` adiciona um botão de microfone ao
próprio site. Ele usa `SpeechRecognition`/`webkitSpeechRecognition` em
`pt-BR`, sem bibliotecas externas. O reconhecimento só começa depois que o
usuário ativa o botão e autoriza o microfone.

O módulo reconhece comandos para:

- adicionar, aumentar, diminuir e remover personagens do carrinho;
- abrir e fechar o carrinho;
- abrir e fechar detalhes;
- navegar entre início, coleção e encomenda;
- aplicar filtros;
- limpar o carrinho ou preparar a compra mediante confirmação.

Também é possível testar o interpretador pelo console, sem falar:

```js
window.brinkaVoiceNavigation.execute('adicionar Erick no carrinho');
window.brinkaVoiceNavigation.execute('abrir carrinho');
window.brinkaVoiceNavigation.execute('ver detalhes da Mari');
```

O reconhecimento de voz interno é um recurso adicional. Todos os controles
continuam disponíveis por mouse, toque, teclado e ferramentas de acessibilidade
do sistema operacional.
