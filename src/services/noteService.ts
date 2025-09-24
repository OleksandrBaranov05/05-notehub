import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

const API = 'https://notehub-public.goit.study/api/';

const http: AxiosInstance = axios.create({
  baseURL: API,
});

http.interceptors.request.use((config) => {
  const raw = import.meta.env.VITE_NOTEHUB_TOKEN as string | undefined;
  const token = raw ? raw.replace(/^['"]|['"]$/g, '').trim() : '';

  if (!token) {
    console.error('VITE_NOTEHUB_TOKEN is missing on this build.');
    return config;
  }

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

  const res = await http.get<FetchNotesResponse>(`notes?${query.toString()}`);
  return res.data;
}

export async function createNote(
  body: CreateNoteParams
): Promise<CreateNoteResponse> {
  const res: AxiosResponse<CreateNoteResponse> = await http.post('notes', body);
  return res.data;
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  const res: AxiosResponse<DeleteNoteResponse> = await http.delete(`notes/${id}`);
  return res.data;
}
