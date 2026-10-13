# Lista de tarefas

Aplicação web simples para organizar tarefas do dia a dia, feita com HTML, CSS e JavaScript puros, sem frameworks e sem dependências. As tarefas ficam salvas no navegador, então continuam lá quando você fecha e abre a página de novo.

## Funcionalidades

- Adicionar novas tarefas
- Marcar e desmarcar tarefas como concluídas
- Editar o texto de uma tarefa (Enter salva, Esc cancela)
- Remover uma tarefa individual
- Limpar todas as tarefas, com confirmação antes de apagar
- Filtrar por todas, pendentes ou concluídas
- Contador de tarefas pendentes
- Dados salvos automaticamente no `localStorage`
- Tema claro e escuro, de acordo com a preferência do sistema
- Layout responsivo, que funciona bem no celular
- Acessível: navegação por teclado, foco visível e leitores de tela

## Tecnologias

- HTML5
- CSS3 (variáveis CSS, flexbox, `prefers-color-scheme`)
- JavaScript (ES6+)

## Estrutura do projeto

```
lista-de-tarefas/
├── index.html    # estrutura da página
├── style.css     # estilos e temas
├── script.js     # lógica da aplicação
├── README.md
└── .gitignore
```

## Como executar

Não precisa instalar nada.

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU-USUARIO/lista-de-tarefas.git
   ```

2. Entre na pasta:

   ```bash
   cd lista-de-tarefas
   ```

3. Abra o arquivo `index.html` no navegador (clique duas vezes nele ou arraste para a janela do navegador).

Se preferir usar um servidor local, qualquer um serve. Por exemplo, com Python:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Como usar

| Ação | Como fazer |
| --- | --- |
| Adicionar | Digite no campo e clique em **Adicionar** ou pressione Enter |
| Concluir | Clique na caixa ao lado da tarefa ou no texto dela |
| Editar | Clique no ícone de lápis, altere o texto e clique em **Salvar** (ou Enter). Esc cancela |
| Remover | Clique no ícone de lixeira |
| Limpar tudo | Clique em **Limpar tudo** e confirme na janela que abrir |
| Filtrar | Use os botões **Todas**, **Pendentes** e **Concluídas** |

## Como os dados são salvos

As tarefas são guardadas no `localStorage` do navegador, na chave `lista-de-tarefas:v1`. Isso significa que:

- os dados ficam apenas no seu navegador e no seu computador;
- limpar os dados do site no navegador apaga as tarefas;
- abrir a página em outro navegador ou dispositivo mostra uma lista vazia;
- em abas abertas ao mesmo tempo, as alterações são sincronizadas.

