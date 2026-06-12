// ================================
// STATE
// ================================
const state = {
    tasks: [],
    currentFilter: 'all'
};

// ================================
// DOM REFERENCES
// ================================
const html = document.documentElement;
const themeToggle = document.querySelector('.js-theme-toggle');
const taskInput = document.querySelector('.js-task-input');
const prioritySel = document.querySelector('.js-priority-select');
const addBtn = document.querySelector('.js-add-btn');
const taskList = document.querySelector('.js-task-list');
const emptyState = document.querySelector('.js-empty-state');
const taskCount = document.querySelector('.js-task-count');
const filterBtns = document.querySelectorAll('.js-filter-btn');

// ================================
// HELPERS
// ================================
const generateId = () => Date.now().toString();

const saveToStorage = () => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('taskflow-theme', html.getAttribute('data-theme'));
};

const loadFromStorage = () => {
    const savedTasks = localStorage.getItem('taskflow-tasks');
    const savedTheme = localStorage.getItem('taskflow-theme');

    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    }

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }
};
// ================================
// UPDATE COUNTER
// ================================
const updateCounter = () => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    taskCount.textContent = pending;

    document.querySelector('.js-stat-total').textContent = total;
    document.querySelector('.js-stat-completed').textContent = completed;
    document.querySelector('.js-stat-pending').textContent = pending;

    document.querySelector('.js-progress-percent').textContent = `${percent}%`;
    document.querySelector('.js-progress-fill').style.width = `${percent}%`;
};

// ================================
// RENDER TASKS
// ================================
const render = () => {
    taskList.innerHTML = '';

    const filtered = state.tasks.filter(task => {
        if (state.currentFilter === 'active') return !task.completed;
        if (state.currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-card ${task.completed ? 'is-completed' : ''}`;
        li.setAttribute('data-id', task.id);

        li.innerHTML = `
            <button class="task-card__checkbox js-complete-btn" data-id="${task.id}">
                ${task.completed ? '✓' : ''}
            </button>
            <div class="task-card__content">
                <p class="task-card__title">${task.title}</p>
            </div>
            <span class="task-card__priority task-card__priority--${task.priority}">
                ${task.priority}
            </span>
            <button class="task-card__delete js-delete-btn" data-id="${task.id}">
                ✕
            </button>
        `;

        taskList.appendChild(li);
    });

    updateCounter();
    saveToStorage();
};

// ================================
// ADD TASK
// ================================
const addTask = () => {
    const title = taskInput.value.trim();

    if (!title) {
        taskInput.focus();
        taskInput.style.borderColor = 'var(--high)';
        setTimeout(() => {
            taskInput.style.borderColor = '';
        }, 1000);
        return;
    }

    const newTask = {
        id: generateId(),
        title: title,
        priority: prioritySel.value,
        completed: false
    };

    state.tasks.unshift(newTask);
    taskInput.value = '';
    prioritySel.value = 'medium';
    taskInput.focus();

    render();
};
// ================================
// COMPLETE TASK
// ================================
const completeTask = (id) => {
    const task = state.tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
        render();
    }
};

// ================================
// DELETE TASK
// ================================
const deleteTask = (id) => {
    const li = taskList.querySelector(`[data-id="${id}"]`);

    if (li) {
        li.style.animation = 'none';
        li.style.opacity = '0';
        li.style.transform = 'translateX(20px)';
        li.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            state.tasks = state.tasks.filter(task => task.id !== id);
            render();
        }, 300);
    }
};

// ================================
// FILTER TASKS
// ================================
const setFilter = (filter) => {
    state.currentFilter = filter;

    filterBtns.forEach(btn => {
        btn.classList.remove('is-active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('is-active');
        }
    });

    render();
};

// ================================
// THEME TOGGLE
// ================================
const toggleTheme = () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    saveToStorage();
};

// ================================
// EVENT LISTENERS
// ================================
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

themeToggle.addEventListener('click', toggleTheme);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.getAttribute('data-filter'));
    });
});

taskList.addEventListener('click', (e) => {
    const completeBtn = e.target.closest('.js-complete-btn');
    const deleteBtn = e.target.closest('.js-delete-btn');

    if (completeBtn) {
        completeTask(completeBtn.getAttribute('data-id'));
    }

    if (deleteBtn) {
        deleteTask(deleteBtn.getAttribute('data-id'));
    }
});

// ================================
// INITIALISE APP
// ================================
loadFromStorage();
render();