import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Note, NoteTag } from '../types/note';

const API_BASE = 'https://notehub-public.goit.study/api';
const NOTES_URL = `${API_BASE}/notes`;

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

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}
export type CreateNoteResponse = Note;
export type DeleteNoteResponse = Note;

export async function fetchNotes(
  params: FetchNotesParams
): Promise<FetchNotesResponse> {
  const { page = 1, perPage = 12, search } = params;
  const qs = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    ...(search ? { search } : {}),
  }).toString();

  const res = await http.get<FetchNotesResponse>(`${NOTES_URL}?${qs}`);
  return res.data;
}

export async function createNote(
  body: CreateNoteParams
): Promise<CreateNoteResponse> {
  const res: AxiosResponse<CreateNoteResponse> = await http.post(NOTES_URL, body);
  return res.data;
}

export async function deleteNote(id: string): Promise<DeleteNoteResponse> {
  const res: AxiosResponse<DeleteNoteResponse> = await http.delete(`${NOTES_URL}/${id}`);
  return res.data;
}
