import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { RaceResultsPanel } from './RaceResultPanel';
import { UserRacesFilterProvider } from '../../../context/UserRacesFilterContext.tsx';
import { User, RaceUser } from '../../../types/entities';

const user = { id: 1, realName: 'Juan Perez', userName: 'jperez' } as User;
const ru = {
  id: 10,
  startPosition: 2,
  finishPosition: 1,
  registrationDateTime: '2026-01-01T00:00:00',
  race: { raceDateTime: '2026-01-02T00:00:00' },
  user,
} as unknown as RaceUser;

const filterValue = {
  minFinishPosition: '' as number | '',
  setMinFinishPosition: vi.fn(),
  raceDateFrom: '',
  setRaceDateFrom: vi.fn(),
};

describe('RaceResultsPanel (BE #65: ya no recibe props de filtro)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('muestra el header del usuario y el contador de carreras visibles', () => {
    render(
      <UserRacesFilterProvider value={filterValue}>
        <RaceResultsPanel
          selectedUser={user}
          loadingRaces={false}
          raceUsers={[ru]}
          filteredRaceUsers={[]}
        />
      </UserRacesFilterProvider>,
    );

    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('@jperez')).toBeInTheDocument();
    expect(screen.getByText(/Carreras visibles: 0 \/ 1/)).toBeInTheDocument();
  });

  it('sin usuario seleccionado, muestra el mensaje inicial', () => {
    render(
      <UserRacesFilterProvider value={filterValue}>
        <RaceResultsPanel
          selectedUser={undefined}
          loadingRaces={false}
          raceUsers={[]}
          filteredRaceUsers={[]}
        />
      </UserRacesFilterProvider>,
    );

    expect(
      screen.getByText('Seleccione un usuario para ver sus carreras'),
    ).toBeInTheDocument();
  });

  it('renderiza el filtro (consumido via contexto) cuando hay usuario', () => {
    render(
      <UserRacesFilterProvider value={filterValue}>
        <RaceResultsPanel
          selectedUser={user}
          loadingRaces={false}
          raceUsers={[]}
          filteredRaceUsers={[]}
        />
      </UserRacesFilterProvider>,
    );

    expect(screen.getByText('Posición Máx.')).toBeInTheDocument();
    expect(screen.getByText('Carreras desde (Fecha)')).toBeInTheDocument();
  });
});
