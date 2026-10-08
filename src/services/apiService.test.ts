import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithAuth } from './apiClient';
import {
  fetchEntities,
  fetchOne,
  saveEntity,
  deleteEntity,
} from './apiService';
import { Category } from '../types/entities';

vi.mock('./apiClient', () => ({
  fetchWithAuth: vi.fn(),
}));

const mockFetchWithAuth = vi.mocked(fetchWithAuth);

/**
 * Construye un `Response` mockeado con solo lo que apiService consume
 * (`ok` y `json()`). Evita depender de `new Response()` de happy-dom.
 */
function mockResponse(ok: boolean, body: unknown): Response {
  return {
    ok,
    status: ok ? 200 : 400,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

/** `Response` cuyo `json()` rechaza (body vacío / no parseable). */
function mockUnparseableResponse(): Response {
  return {
    ok: false,
    status: 500,
    json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
  } as unknown as Response;
}

describe('apiService', () => {
  beforeEach(() => {
    mockFetchWithAuth.mockReset();
  });

  describe('fetchEntities', () => {
    it('éxito: devuelve json.data y llama al endpoint de la entidad', async () => {
      const categories = [
        { id: 1, denomination: 'GT3', abbreviation: 'GT3', description: '' },
        { id: 2, denomination: 'GT4', abbreviation: 'GT4', description: '' },
      ] as Category[];
      mockFetchWithAuth.mockResolvedValue(mockResponse(true, { data: categories }));

      await expect(fetchEntities(Category)).resolves.toEqual(categories);
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/categories');
    });

    it('error HTTP: lanza el mensaje del servidor (res.ok=false)', async () => {
      mockFetchWithAuth.mockResolvedValue(
        mockResponse(false, { message: 'X' })
      );

      await expect(fetchEntities(Category)).rejects.toThrow('X');
    });

    it('error HTTP sin body parseable: lanza el fallback por defecto', async () => {
      mockFetchWithAuth.mockResolvedValue(mockUnparseableResponse());

      await expect(fetchEntities(Category)).rejects.toThrow(
        'Error al obtener la lista'
      );
    });

    it('error HTTP sin message: lanza el fallback por defecto', async () => {
      mockFetchWithAuth.mockResolvedValue(mockResponse(false, {}));

      await expect(fetchEntities(Category)).rejects.toThrow(
        'Error al obtener la lista'
      );
    });
  });

  describe('fetchOne', () => {
    it('éxito: devuelve json.data y llama al endpoint con el id', async () => {
      const category = {
        id: 5,
        denomination: 'GT3',
        abbreviation: 'GT3',
        description: '',
      } as Category;
      mockFetchWithAuth.mockResolvedValue(mockResponse(true, { data: category }));

      await expect(fetchOne(Category, category)).resolves.toEqual(category);
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/categories/5');
    });

    it('error HTTP: lanza el mensaje del servidor (res.ok=false)', async () => {
      mockFetchWithAuth.mockResolvedValue(
        mockResponse(false, { message: 'No encontrada' })
      );

      await expect(
        fetchOne(Category, { id: 404 } as Category)
      ).rejects.toThrow('No encontrada');
    });

    it('error HTTP sin message: lanza el fallback por defecto', async () => {
      mockFetchWithAuth.mockResolvedValue(mockResponse(false, {}));

      await expect(
        fetchOne(Category, { id: 1 } as Category)
      ).rejects.toThrow('Error al obtener la entidad');
    });
  });

  describe('saveEntity', () => {
    it('POST (sin id): devuelve json.data, método/url correctos y body normalizado', async () => {
      const category = {
        denomination: 'GT3',
        abbreviation: 'GT3',
        description: 'categoría nueva',
      } as Category;
      const created = { id: 10, ...category } as Category;
      mockFetchWithAuth.mockResolvedValue(mockResponse(true, { data: created }));

      await expect(saveEntity(Category, category)).resolves.toEqual(created);
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
    });

    it('PUT (con id): devuelve json.data, método/url correctos y body normalizado', async () => {
      const category = {
        id: 7,
        denomination: 'GT3',
        abbreviation: 'GT3',
        description: 'categoría editada',
      } as Category;
      mockFetchWithAuth.mockResolvedValue(mockResponse(true, { data: category }));

      await expect(saveEntity(Category, category)).resolves.toEqual(category);
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/categories/7', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
    });

    it('error HTTP: lanza el mensaje del servidor (res.ok=false)', async () => {
      mockFetchWithAuth.mockResolvedValue(
        mockResponse(false, { message: 'Nombre duplicado' })
      );

      await expect(
        saveEntity(Category, { denomination: 'GT3' } as Category)
      ).rejects.toThrow('Nombre duplicado');
    });

    it('error HTTP sin message: lanza el fallback por defecto', async () => {
      mockFetchWithAuth.mockResolvedValue(mockResponse(false, {}));

      await expect(
        saveEntity(Category, { denomination: 'GT3' } as Category)
      ).rejects.toThrow('Error al guardar la entidad');
    });
  });

  describe('deleteEntity', () => {
    it('éxito: resuelve y llama al endpoint con DELETE', async () => {
      mockFetchWithAuth.mockResolvedValue(mockResponse(true, {}));

      await expect(deleteEntity(Category, 1)).resolves.toBeUndefined();
      expect(mockFetchWithAuth).toHaveBeenCalledWith('/categories/1', {
        method: 'DELETE',
      });
    });

    it('error HTTP: lanza Error (comportamiento actual: mensaje genérico)', async () => {
      mockFetchWithAuth.mockResolvedValue(
        mockResponse(false, { message: 'X' })
      );

      await expect(deleteEntity(Category, 1)).rejects.toThrow(
        'Error eliminando entidad'
      );
    });
  });
});
