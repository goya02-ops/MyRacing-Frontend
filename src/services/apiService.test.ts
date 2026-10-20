import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteEntity,
  fetchEntities,
  fetchOne,
  saveEntity,
} from './apiService';
import { fetchWithAuth } from './apiClient.ts';
import { Category, CategoryVersion, Circuit, User } from '../types/entities';

// Mockeamos apiClient para evitar llamadas de red reales
vi.mock('./apiClient.ts', () => ({
  fetchWithAuth: vi.fn(),
}));

class UnregisteredClass {
  id?: number;
  name: string = '';
}

describe('apiService', () => {
  const fetchWithAuthMock = vi.mocked(fetchWithAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEntities', () => {
    it('construye la URL correcta según la clase registrada y retorna los datos', async () => {
      const mockCircuits: Circuit[] = [
        { id: 1, denomination: 'Monza', abbreviation: 'MNZ', description: 'Autodromo' },
        { id: 2, denomination: 'Spa', abbreviation: 'SPA', description: 'Spa-Francorchamps' },
      ];

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: mockCircuits }), { status: 200 })
      );

      const result = await fetchEntities(Circuit);

      expect(fetchWithAuthMock).toHaveBeenCalledTimes(1);
      expect(fetchWithAuthMock).toHaveBeenCalledWith('/circuits');
      expect(result).toEqual(mockCircuits);
    });

    it('funciona correctamente para otras entidades registradas como Category', async () => {
      const mockCategories: Category[] = [
        { id: 10, denomination: 'GT3', abbreviation: 'GT3', description: 'Gran Turismo 3' },
      ];

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: mockCategories }), { status: 200 })
      );

      const result = await fetchEntities(Category);

      expect(fetchWithAuthMock).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    it('arroja un error si la clase no está registrada en entityMetaByClass', async () => {
      await expect(fetchEntities(UnregisteredClass)).rejects.toThrow(
        'Clase no registrada'
      );
      expect(fetchWithAuthMock).not.toHaveBeenCalled();
    });

    it('propaga errores de red o excepciones arrojadas por apiClient', async () => {
      fetchWithAuthMock.mockRejectedValueOnce(new Error('Fallo de conexión'));

      await expect(fetchEntities(Circuit)).rejects.toThrow('Fallo de conexión');
    });
  });

  describe('fetchOne', () => {
    it('construye la URL con el ID de la entidad y retorna los datos', async () => {
      const mockCircuit: Circuit = {
        id: 3,
        denomination: 'Silverstone',
        abbreviation: 'SLV',
        description: 'Circuito de Silverstone',
      };

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: mockCircuit }), { status: 200 })
      );

      const result = await fetchOne(Circuit, mockCircuit);

      expect(fetchWithAuthMock).toHaveBeenCalledWith('/circuits/3');
      expect(result).toEqual(mockCircuit);
    });

    it('arroja un error si la clase no está registrada', async () => {
      const unregistered: UnregisteredClass = { id: 1, name: 'Sin registro' };
      await expect(fetchOne(UnregisteredClass, unregistered)).rejects.toThrow(
        'Clase no registrada'
      );
      expect(fetchWithAuthMock).not.toHaveBeenCalled();
    });

    it('propaga errores de red al consultar una entidad', async () => {
      const mockCircuit: Circuit = {
        id: 1,
        denomination: 'Monza',
        abbreviation: 'MNZ',
        description: '',
      };
      fetchWithAuthMock.mockRejectedValueOnce(new Error('Timeout de servidor'));

      await expect(fetchOne(Circuit, mockCircuit)).rejects.toThrow(
        'Timeout de servidor'
      );
    });
  });

  describe('saveEntity', () => {
    it('usa método POST y endpoint base cuando la entidad no tiene ID (creación)', async () => {
      const newCircuit: Circuit = {
        denomination: 'Interlagos',
        abbreviation: 'INT',
        description: 'Brasil',
      };
      const createdCircuit: Circuit = { id: 4, ...newCircuit };

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: createdCircuit }), { status: 201 })
      );

      const result = await saveEntity(Circuit, newCircuit);

      expect(fetchWithAuthMock).toHaveBeenCalledWith('/circuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCircuit),
      });
      expect(result).toEqual(createdCircuit);
    });

    it('usa método PUT y URL con ID cuando la entidad ya tiene ID (actualización)', async () => {
      const existingUser: User = {
        id: 7,
        userName: 'pilot1',
        realName: 'Piloto Uno',
        email: 'piloto1@racing.com',
        type: 'common',
      };

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: existingUser }), { status: 200 })
      );

      const result = await saveEntity(User, existingUser);

      expect(fetchWithAuthMock).toHaveBeenCalledWith('/users/7', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existingUser),
      });
      expect(result).toEqual(existingUser);
    });

    it('normaliza las relaciones de la entidad antes de enviarla en el body', async () => {
      const categoryVersionWithRelation: CategoryVersion = {
        status: 'ACTIVE',
        category: { id: 2 } as Category,
      };

      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { id: 10, ...categoryVersionWithRelation },
          }),
          { status: 201 }
        )
      );

      await saveEntity(CategoryVersion, categoryVersionWithRelation);

      expect(fetchWithAuthMock).toHaveBeenCalledWith(
        '/categories-version',
        expect.objectContaining({
          body: JSON.stringify(categoryVersionWithRelation),
        })
      );
    });

    it('arroja un error si la clase no está registrada', async () => {
      const unregistered: UnregisteredClass = { name: 'test' };
      await expect(saveEntity(UnregisteredClass, unregistered)).rejects.toThrow(
        'Clase no registrada'
      );
      expect(fetchWithAuthMock).not.toHaveBeenCalled();
    });

    it('propaga errores de red al guardar una entidad', async () => {
      const circuit: Circuit = {
        denomination: 'Test',
        abbreviation: 'TST',
        description: 'Test circuit',
      };
      fetchWithAuthMock.mockRejectedValueOnce(
        new Error('Error de red al guardar')
      );

      await expect(saveEntity(Circuit, circuit)).rejects.toThrow(
        'Error de red al guardar'
      );
    });
  });

  describe('deleteEntity', () => {
    it('llama al método DELETE con la URL del ID y resuelve sin contenido en caso de éxito', async () => {
      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      await expect(deleteEntity(Circuit, 5)).resolves.toBeUndefined();

      expect(fetchWithAuthMock).toHaveBeenCalledWith('/circuits/5', {
        method: 'DELETE',
      });
    });

    it('arroja "Error eliminando entidad" si la respuesta HTTP no es ok (res.ok: false)', async () => {
      fetchWithAuthMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Not found' }), {
          status: 404,
        })
      );

      await expect(deleteEntity(Circuit, 999)).rejects.toThrow(
        'Error eliminando entidad'
      );
    });

    it('arroja un error si la clase no está registrada', async () => {
      await expect(deleteEntity(UnregisteredClass, 1)).rejects.toThrow(
        'Clase no registrada'
      );
      expect(fetchWithAuthMock).not.toHaveBeenCalled();
    });

    it('propaga errores de red al intentar eliminar', async () => {
      fetchWithAuthMock.mockRejectedValueOnce(new Error('Fallo de red'));

      await expect(deleteEntity(Circuit, 1)).rejects.toThrow('Fallo de red');
    });
  });
});
