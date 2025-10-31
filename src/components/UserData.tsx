import React from 'react';
import { User } from '../types/entities';
import { Card } from './tremor/Card';
import { Button } from './tremor/Button';
import { Input } from './tremor/Input';
import { Badge } from './tremor/Badge';
import { Divider } from './tremor/Divider';

interface UserDataFormProps {
  user: User;
  formData: User;
  isEditing: boolean;
  saving: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  setIsEditing: (editing: boolean) => void;
}

export const UserDataForm: React.FC<UserDataFormProps> = ({
  user,
  formData,
  isEditing,
  saving,
  handleChange,
  handleSave,
  handleCancel,
  setIsEditing,
}) => {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <Badge color={user.type === 'admin' ? 'orange' : 'blue'}>
          {user.type.toUpperCase()}
        </Badge>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Datos Personales</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Usuario (Login)
              </label>
              <Input type="text" value={user.userName} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre Completo *
              </label>
              <Input
                type="text"
                name="realName"
                value={formData.realName}
                onChange={handleChange}
                disabled={!isEditing || saving}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!isEditing || saving}
              />
            </div>
          </div>
        </form>

        <Divider />
        <div className="flex gap-2 justify-end">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} disabled={saving} variant="ghost">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
