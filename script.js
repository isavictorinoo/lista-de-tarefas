(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Elementos da página
     ------------------------------------------------------------------------ */
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const hint = document.getElementById('form-hint');
  const list = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const counter = document.getElementById('counter');
  const clearBtn = document.getElementById('clear-all');
  const dialog = document.getElementById('confirm-dialog');
  const filterButtons = document.querySelectorAll('[data-filter]');

  /* ------------------------------------------------------------------------
     Estado
     ------------------------------------------------------------------------ */
  const STORAGE_KEY = 'lista-de-tarefas:v1';

  let tasks = loadTasks();
  let currentFilter = 'all'; // 'all' | 'pending' | 'done'
  let editingId = null;

  const EMPTY_MESSAGES = {
    all: 'Nenhuma tarefa por aqui. Escreva a primeira no campo acima.',
    pending: 'Tudo concluído. Não há tarefas pendentes.',
    done: 'Nenhuma tarefa concluída ainda.',
  };

  const ICON_EDIT =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  const ICON_DELETE =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';

  /* ------------------------------------------------------------------------
     Persistência (localStorage)
     ------------------------------------------------------------------------ */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((t) => t && typeof t.id === 'string' && typeof t.text === 'string')
        .map((t) => ({ id: t.id, text: t.text, done: Boolean(t.done) }));
    } catch {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Armazenamento indisponível (modo privado, cota cheia). O app segue funcionando em memória.
    }
  }

  /* ------------------------------------------------------------------------
     Utilitários
     ------------------------------------------------------------------------ */
  function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    const { className, text, html, attrs } = options;

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    if (html !== undefined) element.innerHTML = html; // usado apenas com os ícones fixos acima
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    }
    return element;
  }

  function showHint(message) {
    hint.textContent = message;
  }

  /* ------------------------------------------------------------------------
     Ações (CRUD)
     ------------------------------------------------------------------------ */
  function addTask(text) {
    tasks.push({ id: generateId(), text, done: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    editingId = null;
    saveTasks();
    render();
  }

  function updateTask(id, text) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.text = text;
    editingId = null;
    saveTasks();
    render();
  }

  function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    if (editingId === id) editingId = null;
    saveTasks();
    render();
  }

  function clearAll() {
    tasks = [];
    editingId = null;
    saveTasks();
    render();
  }

  function startEditing(id) {
    editingId = id;
    render();
  }

  function cancelEditing() {
    editingId = null;
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    editingId = null;
    render();
  }

  /* ------------------------------------------------------------------------
     Renderização
     ------------------------------------------------------------------------ */
  function getVisibleTasks() {
    if (currentFilter === 'pending') return tasks.filter((t) => !t.done);
    if (currentFilter === 'done') return tasks.filter((t) => t.done);
    return tasks;
  }

  function createTaskItem(task) {
    return task.id === editingId ? createEditItem(task) : createViewItem(task);
  }

  function createViewItem(task) {
    const item = createElement('li', {
      className: task.done ? 'task task--done' : 'task',
      attrs: { 'data-id': task.id },
    });

    const checkboxId = `task-${task.id}`;

    const checkbox = createElement('input', {
      className: 'task__check',
      attrs: { type: 'checkbox', id: checkboxId, 'data-action': 'toggle' },
    });
    checkbox.checked = task.done;

    const label = createElement('label', {
      className: 'task__text',
      text: task.text,
      attrs: { for: checkboxId, 'data-action': 'label' },
    });

    const actions = createElement('div', { className: 'task__actions' });

    const editBtn = createElement('button', {
      className: 'icon-btn',
      html: ICON_EDIT,
      attrs: {
        type: 'button',
        'data-action': 'edit',
        'aria-label': `Editar tarefa: ${task.text}`,
        title: 'Editar',
      },
    });

    const deleteBtn = createElement('button', {
      className: 'icon-btn icon-btn--danger',
      html: ICON_DELETE,
      attrs: {
        type: 'button',
        'data-action': 'delete',
        'aria-label': `Remover tarefa: ${task.text}`,
        title: 'Remover',
      },
    });

    actions.append(editBtn, deleteBtn);
    item.append(checkbox, label, actions);
    return item;
  }

  function createEditItem(task) {
    const item = createElement('li', {
      className: 'task task--editing',
      attrs: { 'data-id': task.id },
    });

    const editForm = createElement('form', {
      className: 'edit-form',
      attrs: { 'data-action': 'save', novalidate: '' },
    });

    const editInput = createElement('input', {
      className: 'edit-input',
      attrs: {
        type: 'text',
        value: task.text,
        maxlength: '120',
        'aria-label': 'Editar texto da tarefa',
      },
    });

    const buttons = createElement('div', { className: 'edit-form__actions' });

    const saveBtn = createElement('button', {
      className: 'btn btn--primary btn--small',
      text: 'Salvar',
      attrs: { type: 'submit' },
    });

    const cancelBtn = createElement('button', {
      className: 'btn btn--ghost btn--small',
      text: 'Cancelar',
      attrs: { type: 'button', 'data-action': 'cancel' },
    });

    buttons.append(saveBtn, cancelBtn);
    editForm.append(editInput, buttons);
    item.append(editForm);
    return item;
  }

  function updateCounter() {
    const total = tasks.length;
    const pending = tasks.filter((t) => !t.done).length;

    if (total === 0) {
      counter.textContent = 'Nenhuma tarefa';
      return;
    }

    const word = pending === 1 ? 'pendente' : 'pendentes';
    counter.textContent = `${pending} ${word} de ${total}`;
  }

  function render() {
    const visible = getVisibleTasks();

    list.replaceChildren(...visible.map(createTaskItem));

    emptyState.hidden = visible.length > 0;
    emptyState.textContent = EMPTY_MESSAGES[currentFilter];

    clearBtn.disabled = tasks.length === 0;
    updateCounter();

    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
    });

    if (editingId) {
      const editInput = list.querySelector('.edit-input');
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    }
  }

  /* ------------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------------ */

  // Adicionar tarefa
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();

    if (!text) {
      input.setAttribute('aria-invalid', 'true');
      showHint('Escreva uma tarefa antes de adicionar.');
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    showHint('');
    addTask(text);
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => {
    if (input.value.trim()) {
      input.removeAttribute('aria-invalid');
      showHint('');
    }
  });

  // Cliques dentro da lista (concluir, editar, remover, cancelar)
  list.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const item = target.closest('[data-id]');
    if (!item) return;

    const id = item.dataset.id;

    switch (target.dataset.action) {
      case 'toggle':
        toggleTask(id);
        break;
      case 'edit':
        startEditing(id);
        break;
      case 'delete':
        removeTask(id);
        break;
      case 'cancel':
        cancelEditing();
        break;
      default:
        break;
    }
  });

  // Salvar edição
  list.addEventListener('submit', (event) => {
    const editForm = event.target.closest('[data-action="save"]');
    if (!editForm) return;

    event.preventDefault();

    const item = editForm.closest('[data-id]');
    const editInput = editForm.querySelector('.edit-input');
    const text = editInput.value.trim();

    if (!text) {
      editInput.setAttribute('aria-invalid', 'true');
      editInput.focus();
      return;
    }

    updateTask(item.dataset.id, text);
  });

  // Esc cancela a edição
  list.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editingId) {
      cancelEditing();
    }
  });

  // Filtros
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  // Limpar tudo (com confirmação)
  clearBtn.addEventListener('click', () => {
    if (tasks.length === 0) return;
    dialog.returnValue = '';
    dialog.showModal();
  });

  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'confirm') {
      clearAll();
      input.focus();
    }
  });

  // Sincroniza várias abas abertas
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      tasks = loadTasks();
      editingId = null;
      render();
    }
  });

  /* ------------------------------------------------------------------------
     Início
     ------------------------------------------------------------------------ */
  render();
})();
