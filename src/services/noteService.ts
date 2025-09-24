import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

const API_NOTES = 'https://notehub-public.goit.study/api/notes';

const http = axios.create();

http.interceptors.request.use((config) => {
  const raw = import.meta.env.VITE_NOTEHUB_TOKEN as string | undefined;
  const token = raw ? raw.replace(/^['"]|['"]$/g, '').trim() : '';

  const h = (config.headers ?? {}) as any;
  if (typeof h.set === 'function') {
    h.set('Authorization', `Bearer ${token}`);
    h.set('Content-Type', 'application/json');
  } else {
    (config as any).headers = {
      ...h,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return config;
});

export interface FetchNotesParams {
  page?: number;
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
  const q = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    ...(search ? { search } : {}),
  }).toString();

  const url = `${API_NOTES}?${q}`;

  const res = await http.get<any>(url);
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
  const res: AxiosResponse<CreateNoteResponse> = await http.post(API_NOTES, body);
  return res.data;
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  const res: AxiosResponse<DeleteNoteResponse> = await http.delete(`${API_NOTES}/${id}`);
  return res.data;
}
