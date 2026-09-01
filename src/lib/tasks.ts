const KEY = 'nexus-tasks';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
}

function read(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  return read().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const p = { high: 0, medium: 1, low: 2 };
    if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
    return b.createdAt - a.createdAt;
  });
}

export function addTask(title: string, priority: Task['priority'] = 'medium'): Task {
  const now = Date.now();
  const task: Task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    done: false,
    priority,
    createdAt: now,
    updatedAt: now,
  };
  const tasks = read();
  tasks.unshift(task);
  write(tasks);
  return task;
}

export function toggleTask(id: string): void {
  const tasks = read();
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.updatedAt = Date.now();
  write(tasks);
}

export function updateTask(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'priority' | 'done'>>
): void {
  const tasks = read();
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  Object.assign(t, patch, { updatedAt: Date.now() });
  write(tasks);
}

export function deleteTask(id: string): void {
  write(read().filter((t) => t.id !== id));
}

export function clearCompleted(): void {
  write(read().filter((t) => !t.done));
}

export function clearTasks(): void {
  localStorage.removeItem(KEY);
}
