# Studio Exemplo — site de marcações (DEMO)

> **DEMO: não é um negócio real.** O Studio Exemplo é um salão fictício e este site serve apenas para demonstração.

Site estático (HTML, CSS e JavaScript simples, sem frameworks) para marcar serviços num salão:

- Escolha do serviço: **Corte 25 €**, **Corte + Brushing 40 €**, **Coloração 55 €**
- Escolha da data (não permite datas passadas)
- Horas livres das 9h às 18h (marcações de hora a hora, a última às 17:00); horas ocupadas ou já passadas aparecem desativadas
- Formulário com nome, telemóvel e email, com validação
- Confirmação da marcação e **pré-visualização do email** que seria enviado ao salão (nenhum email é enviado)
- **Painel de marcações guardadas**, com opção de cancelar uma ou apagar todas

As marcações ficam guardadas no `localStorage` do navegador (chave `studioExemplo.bookings`), por isso só existem nesse navegador e nesse computador.

## Ficheiros

| Ficheiro     | Conteúdo                                   |
|--------------|--------------------------------------------|
| `index.html` | Estrutura da página                        |
| `styles.css` | Estilos                                    |
| `app.js`     | Lógica: horas, validação, localStorage, email |

## Como abrir o site

### Opção 1 — abrir diretamente

Faça duplo clique em `index.html` (ou arraste-o para uma janela do navegador). Não é preciso instalar nada.

### Opção 2 — servidor local (opcional)

Alguns navegadores limitam o `localStorage` em páginas abertas com `file://`. Se for o caso, sirva a pasta localmente:

```bash
python3 -m http.server 8000
```

e abra <http://localhost:8000> no navegador.

## Limpar os dados

Use o botão **Apagar todas** no painel, ou nas ferramentas de programador do navegador apague a chave `studioExemplo.bookings` em *Application → Local Storage*.
