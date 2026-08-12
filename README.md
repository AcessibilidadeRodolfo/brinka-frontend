# Brinka Frontend

Frontend do projeto **Brinka**, uma plataforma de e-commerce desenvolvida com **HTML, CSS e JavaScript**, projetada para oferecer uma experiência de compra acessível, inclusiva e intuitiva.

O projeto utiliza JavaScript moderno, módulos ES, `fetch`, `localStorage`, `sessionStorage` e APIs nativas do navegador. A integração com o backend é isolada em serviços, enquanto componentes reutilizáveis concentram comportamentos como carrinho, cards de personagens, stepper e navegação por voz.

## Funcionalidades

- Catálogo de personagens.
- Busca e filtros de produtos.
- Detalhes dos personagens.
- Carrinho de compras persistido no navegador.
- Sincronização do carrinho com a API quando o usuário está autenticado.
- Login e cadastro.
- Autenticação através de JWT.
- Perfil do usuário.
- Consulta e atualização de dados do usuário.
- Consulta e atualização de cartão cadastrado.
- Consulta de histórico de compras.
- Checkout e criação de pedidos.
- Consulta de CEP através do ViaCEP.
- Avaliações locais enquanto o endpoint de criação de avaliações não está disponível.
- Navegação por teclado.
- Suporte a tecnologias assistivas.
- Navegação por voz do sistema operacional.
- Navegação por voz interna através de `SpeechRecognition`.
- Design responsivo.
- SEO básico e Open Graph.

## Stack

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilos, layout e responsividade |
| JavaScript ES Modules | Lógica da aplicação |
| Fetch API | Comunicação HTTP |
| localStorage | Carrinho, token e avaliações locais |
| sessionStorage | Dados temporários do checkout |
| SpeechRecognition | Navegação por voz interna |
| ViaCEP | Consulta de endereço por CEP |
| SVG | Ícones e elementos gráficos |

Não há framework JavaScript ou bundler obrigatório. O navegador executa os módulos diretamente.

## Estrutura

```text
brinka-frontend/
├── assets/
│   ├── icons/
│   └── images/
│
├── css/
│   ├── components/
│   ├── pages/
│   └── tokens.css
│
├── js/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
│
├── pages/
│   ├── cadastro.html
│   ├── login.html
│   ├── pagamento.html
│   ├── pagamento-concluido.html
│   └── perfil.html
│
├── index.html
├── index-logado.html
└── README.md
```

Consulte:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/COMPONENTS.md`](docs/COMPONENTS.md)
- [`docs/SERVICES.md`](docs/SERVICES.md)
- [`docs/STATE.md`](docs/STATE.md)
- [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md)
- [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md)
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)

## Páginas

### Público

```text
index.html
pages/login.html
pages/cadastro.html
```

### Autenticado

```text
index-logado.html
pages/perfil.html
pages/pagamento.html
pages/pagamento-concluido.html
```

O front-end usa páginas HTML distintas em vez de uma SPA. A navegação ocorre através de links e carregamento de documentos.

## Arquitetura

A organização segue uma separação simples:

```text
HTML
 │
 ▼
js/pages
 │
 ├──────────────┐
 ▼              ▼
js/components  js/services
 │              │
 ▼              ▼
UI / estado    API / serviços externos
 │
 ▼
js/utils
```

As páginas coordenam o fluxo da tela, os componentes encapsulam comportamentos reutilizáveis e os serviços concentram comunicação com backend e APIs externas.

Mais detalhes em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Configuração da API

A configuração central fica em:

```text
js/utils/config.js
```

Atualmente:

```js
window.BRINKA_CONFIG = window.BRINKA_CONFIG || {
    API_BASE_URL: "https://brinka-api.onrender.com",
    PURCHASE_HISTORY_URL: "https://brinka-api.onrender.com/pedidos",
};
```

`js/services/api-config.js` também expõe:

```js
window.BRINKA_API_URL
```

para o serviço de catálogo.

Em produção, URLs de API devem ser configuradas de forma apropriada ao ambiente.

**Nenhuma credencial de banco, Redis ou segredo JWT deve ser colocada no frontend.**

## Integração com a Brinka API

Os serviços do frontend utilizam principalmente:

```text
/auth
/products
/usuarios
/usuarios/address
/usuarios/cartao
/usuarios/carrinho
/pedidos
```

O token JWT é armazenado pelo `session.js` e enviado como:

```http
Authorization: Bearer <token>
```

Detalhes em [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md).

## Carrinho

O carrinho possui uma camada própria em:

```text
js/components/cart-drawer.js
```

Ele mantém o estado local em:

```text
brinka:cart:v1
```

O estado inclui:

```js
{
  version: 1,
  currency: "BRL",
  items: [
    {
      id,
      name,
      image,
      color,
      unitPrice,
      quantity,
      lineTotal
    }
  ],
  totalQuantity,
  subtotal,
  total
}
```

A API pode ser utilizada para sincronizar o carrinho do usuário autenticado.

O componente também expõe:

```js
window.brinkaCart.getSnapshot()
```

e dispara:

```text
cart:updated
cart:checkout
```

O evento `cart:checkout` fornece o rascunho do pedido em:

```js
event.detail.order
```

O backend deve recalcular preços e totais. Dados calculados pelo navegador não são uma fonte confiável para cobrança.

## Autenticação

`js/utils/session.js` gerencia o token:

```text
brinka_token
```

Funções disponíveis:

```js
setToken(token)
getToken()
clearToken()
isAuthenticated()
authHeader()
```

O objeto também é exposto como:

```js
window.brinkaSession
```

Isso permite que scripts clássicos utilizem a sessão.

## Avaliações

O catálogo tenta consultar:

```text
GET /products/{productId}?avaliacoes=true
```

Avaliações novas ainda são armazenadas localmente porque o frontend não possui um endpoint funcional de criação de avaliações na API atual.

As chaves seguem:

```text
brinka:reviews:{productId}
```

Quando o backend disponibilizar criação de avaliações, o serviço `catalog-api.js` deve ser alterado para persistir a avaliação remotamente.

## Checkout

O fluxo principal é:

```text
Carrinho
   ↓
Pagamento
   ↓
POST /pedidos
   ↓
Pagamento concluído
```

Os métodos suportados pelo frontend são:

```text
PIX
CARTAO_CREDITO
BOLETO
```

O pedido é criado através de `orderService.js`.

Após a criação, o ID do pedido pode ser mantido temporariamente em `sessionStorage` para a página de confirmação.

## CEP

O cadastro consulta o ViaCEP:

```text
https://viacep.com.br/ws/{cep}/json/
```

O serviço retorna:

```text
uf
cidade
bairro
rua
```

A consulta é feita diretamente do navegador.

## Acessibilidade

O projeto considera:

- HTML semântico;
- labels associados a inputs;
- `aria-label`, `aria-labelledby` e `aria-describedby`;
- regiões com `aria-live`;
- navegação por teclado;
- skip links;
- foco em modais;
- `inert` em conteúdo inativo;
- textos alternativos;
- elementos decorativos com `aria-hidden`;
- comandos acessíveis para controle por voz.

Veja [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md).

## SEO

As páginas utilizam:

- `lang="pt-BR"`;
- `<title>`;
- `meta description`;
- Open Graph;
- títulos semânticos;
- favicon;
- dados estruturados no `index.html`.

Quando houver domínio definitivo, devem ser configurados:

```text
canonical
og:url
og:image
sitemap.xml
robots.txt
```

## Execução local

O projeto não exige build obrigatório.

Como os módulos JavaScript usam `import`, recomenda-se servir os arquivos por HTTP em vez de abrir `index.html` diretamente com `file://`.

Exemplo com Python:

```bash
python -m http.server 5500
```

Depois:

```text
http://localhost:5500
```

Também é possível utilizar a extensão Live Server ou outro servidor HTTP local.

## Desenvolvimento

Consulte [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) para:

- organização;
- convenções;
- adição de páginas;
- criação de serviços;
- manutenção do estado;
- integração com API;
- checklist antes de uma PR.

## Segurança

O frontend não é uma fronteira de confiança.

Nunca confie no navegador para:

- preços;
- estoque;
- permissões;
- valores de pedido;
- credenciais;
- regras de autorização.

A API deve validar e recalcular os dados importantes no servidor.

## Licença

Consulte [`LICENSE`](LICENSE).
