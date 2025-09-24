import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { fetchNotes, type FetchNotesResponse } from '../../services/noteService';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import css from './App.module.css';

const PER_PAGE = 12;

export default function App() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const queryKey = useMemo<(string | number)[]>(
    () => ['notes', page, debouncedSearch],
    [page, debouncedSearch]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  }: UseQueryResult<FetchNotesResponse, Error> = useQuery<FetchNotesResponse, Error>({
    queryKey,
    queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const notes = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p style={{ padding: 16 }}>Loading…</p>}

      {isError && (
        <p style={{ padding: 16, color: '#ff6b6b' }}>
          Failed to load notes: {error?.message ?? 'Unknown error'}
        </p>
      )}

      {notes.length > 0 && <NoteList notes={notes} />}

      {!isLoading && !isError && notes.length === 0 && !isFetching && (
        <p style={{ padding: 16 }}>No notes found.</p>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
            onCreated={() => {
              setIsModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['notes'] });
            }}
          />
        </Modal>
      )}
    </div>
  );
}
