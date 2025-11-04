// src/features/CategoryAdmin/components/CategoryRow.tsx
import React from 'react';
import {
  Button,
  TableRow,
  TableCell,
} from '../../../components/tremor/TremorComponents';
import { Category } from '../../../types/entities.ts';

interface CategoryRowProps {
  category: Category;
  editing: Category | null;
  isCreating: boolean;

  handleEditCategory: (category: Category) => void;
  handleCancel: () => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  editing,
  isCreating,
  handleEditCategory,
  handleCancel,
}) => {
  const isThisRowEditing = editing?.id === category.id && !isCreating;

  return (
    <TableRow>
      <TableCell className="font-medium">{category.denomination}</TableCell>
      <TableCell>{category.abbreviation}</TableCell>
      <TableCell className="truncate max-w-xs">
        {category.description}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant={isThisRowEditing ? 'primary' : 'ghost'}
          onClick={() =>
            isThisRowEditing ? handleCancel() : handleEditCategory(category)
          }
        >
          {isThisRowEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </TableCell>
    </TableRow>
  );
};
