import { useEffect, useState, FormEvent } from 'react';
import {
  loadTasks,
  addTask,
  toggleTask,
  deleteTask,
  clearCompleted,
  updateTask,
  Task,
} from '../lib/tasks';
import styles from './Tasks.module.css';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  function refresh() {
    setTasks(loadTasks());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, priority);
    setTitle('');
    refresh();
  }

  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.sub}>
            {open} open · {done} done
          </p>
        </div>
        {done > 0 && (
          <button className="btn btn-ghost" onClick={() => { clearCompleted(); refresh(); }}>
            Clear completed
          </button>
        )}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          className={styles.addInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          autoFocus
        />
        <select
          className={styles.prioritySelect}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <ul className={styles.list}>
        {tasks.length === 0 && (
          <li className="empty-state">
            <p>No tasks yet — add one above</p>
          </li>
        )}
        {tasks.map((t) => (
          <li key={t.id} className={`${styles.item} ${t.done ? styles.done : ''}`}>
            <button
              className={styles.check}
              onClick={() => {
                toggleTask(t.id);
                refresh();
              }}
              aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {t.done ? '✓' : ''}
            </button>
            <span className={styles.itemTitle}>{t.title}</span>
            <select
              className={`${styles.badge} ${styles[t.priority]}`}
              value={t.priority}
              onChange={(e) => {
                updateTask(t.id, { priority: e.target.value as Task['priority'] });
                refresh();
              }}
            >
              <option value="low">low</option>
              <option value="medium">med</option>
              <option value="high">high</option>
            </select>
            <button
              className={styles.deleteBtn}
              onClick={() => {
                deleteTask(t.id);
                refresh();
              }}
              title="Delete"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
