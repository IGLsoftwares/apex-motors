# Apex Motors — Sports Car Store

Site modelo de loja de carros esportivos (projeto demonstrativo). HTML, CSS e JavaScript puros, sem build e sem dependências.

## Páginas
| Página | O que faz |
|---|---|
| `index.html` | Banner, categorias, vitrines (Novidades, Mais vendidos, Em alta, Vistos recentemente), troca e financiamento, Reels do Instagram, mapa com Uber/99/Waze, dúvidas frequentes |
| `estoque.html` | Catálogo com filtros (categoria, marca, tração, 0-100, potência, câmbio, combustível, preço, ano). Os filtros ficam na URL |
| `carro.html?id=...` | Foto e vídeo, desempenho, ficha técnica, opcionais, simulador de financiamento, compartilhar |
| `comparar.html` | Comparação de até 4 carros lado a lado, com o melhor número de cada linha destacado |
| `proposta.html` | Checkout em 4 passos que abre o WhatsApp com a proposta completa |
| `privacidade.html` / `404.html` | Política de privacidade (LGPD) e página de erro |

## Onde editar
Tudo em `js/data.js`:
- `STORE`: WhatsApp, Instagram, endereço, coordenadas do mapa, horários, taxa de financiamento
- `CATEGORIES` e `CARS`: estoque. A foto de cada carro fica em `assets/img/cars/<id>.webp` (1280px) e `<id>-sm.webp` (640px)
- `REELS`: coloque os MP4 em `assets/reels/` e preencha `video: "assets/reels/1.mp4"`
- Vídeo de um carro: adicione `video: "assets/videos/arquivo.mp4"` no objeto do carro

## Rodar localmente
```bash
npx serve .
```

## Publicar no GitHub Pages
1. Crie um repositório público no GitHub (ex.: `apex-motors`) e envie os arquivos.
2. No repositório: **Settings > Pages > Source: Deploy from a branch > main / (root)**.
3. O site fica em `https://<seu-usuario>.github.io/apex-motors/`.

Fotos dos veículos: Wikimedia Commons (licenças Creative Commons), com crédito na página de cada carro.
