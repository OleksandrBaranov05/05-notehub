import css from './NoteList.module.css';
import type { Note } from '../../types/note';

export interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function NoteList({ notes, onDelete, isDeleting }: NoteListProps) {
  if (!notes.length) return null;

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <button
              className={css.button}
              onClick={() => onDelete(n.id)}
              disabled={isDeleting}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
