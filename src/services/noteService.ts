import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

const API = 'https://notehub-public.goit.study/api';

const raw = import.meta.env.VITE_NOTEHUB_TOKEN as string | undefined;
const token = raw ? raw.replace(/^['"]|['"]$/g, '').trim() : '';

if (!token) {
  console.error(
    'VITE_NOTEHUB_TOKEN is missing. Add it to .env (root) and restart dev server.'
  );
}

const http: AxiosInstance = axios.create({
  baseURL: API,
  headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  },
});

export interface FetchNotesParams {
  page?: number; // 1-based
  perPage?: number;
  search?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export type FetchNotesResponse = Paginated<Note>;

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}
export type CreateNoteResponse = Note;

export interface DeleteNoteResponse {
  id: string;
}

export async function fetchNotes(
  params: FetchNotesParams
): Promise<FetchNotesResponse> {
  const { page = 1, perPage = 12, search } = params;
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    ...(search ? { search } : {}),
  });

  const res: AxiosResponse<any> = await http.get(`/notes?${query.toString()}`);
  const payload = res.data ?? {};

  const items: Note[] = payload.items ?? payload.data ?? payload.notes ?? [];
  const currentPage: number = payload.page ?? payload.currentPage ?? page ?? 1;
  const limit: number = payload.perPage ?? payload.limit ?? perPage ?? 12;
  const totalItems: number =
    payload.totalItems ?? payload.total ?? (Array.isArray(items) ? items.length : 0);
  const totalPages: number =
    payload.totalPages ?? (limit ? Math.max(1, Math.ceil(totalItems / limit)) : 1);

  return {
    items,
    page: currentPage,
    perPage: limit,
    totalItems,
    totalPages,
  };
}

export async function createNote(
  body: CreateNoteParams
): Promise<CreateNoteResponse> {
  const res: AxiosResponse<CreateNoteResponse> = await http.post('/notes', body);
  return res.data;
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  const res: AxiosResponse<DeleteNoteResponse> = await http.delete(`/notes/${id}`);
  return res.data;
}
