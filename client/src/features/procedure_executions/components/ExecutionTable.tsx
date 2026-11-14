import React, { ReactNode } from 'react';
import type { ExecutionListItem } from '../api/executionsApi';

export interface ColumnDef<T = ExecutionListItem> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface ExecutionTableProps {
  data: ExecutionListItem[];
  columns?: ColumnDef<ExecutionListItem>[];
  onRowClick?: (item: ExecutionListItem) => void;
  renderActions?: (item: ExecutionListItem) => ReactNode;
  emptyMessage?: string;
  emptyClassName?: string;
  rowHoverClassName?: string;
  divideClassName?: string;
  procedureHoverColor?: 'red' | 'blue';
}

export const ExecutionTable: React.FC<ExecutionTableProps> = ({
  data,
  columns,
  onRowClick,
  renderActions,
  emptyMessage = 'No hay ejecuciones disponibles.',
  emptyClassName = 'p-4 bg-white rounded-xl border border-dashed border-red-200 text-center text-xs text-gray-500',
  rowHoverClassName = 'hover:bg-red-50/40',
  divideClassName = 'divide-red-100',
  procedureHoverColor = 'red',
}) => {
  if (data.length === 0) {
    return (
      <div className={emptyClassName}>
        {emptyMessage}
      </div>
    );
  }

  // Columnas básicas por defecto: procedimiento, proyecto, inicio (fecha) y acciones (si renderActions existe)
  const defaultColumns: ColumnDef<ExecutionListItem>[] = [
    { key: 'procedure', header: 'Procedimiento' },
    { key: 'project', header: 'Proyecto' },
    { key: 'startedAt', header: 'Inicio' },
  ];

  const effectiveColumns = columns ?? defaultColumns;

  const hoverColorClass = procedureHoverColor === 'blue'
    ? 'hover:text-blue-600'
    : 'hover:text-red-700';

  return (
    <table className="w-full text-left text-sm text-gray-600">
      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
        <tr>
          {effectiveColumns.map((col) => (
            <th key={col.key} className={col.headerClassName ?? 'px-4 py-3'}>
              {col.header}
            </th>
          ))}
          {renderActions && (
            <th className="px-4 py-3 text-right w-[1%] whitespace-nowrap">
              Acciones
            </th>
          )}
        </tr>
      </thead>
      <tbody className={`divide-y ${divideClassName} text-xs`}>
        {data.map((execution) => (
          <tr
            key={execution.id}
            className={`${rowHoverClassName} transition cursor-pointer`}
            onClick={() => onRowClick?.(execution)}
          >
            {effectiveColumns.map((col) => {
              if (col.render) {
                return (
                  <td key={col.key} className={col.className ?? 'px-4 py-3'}>
                    {col.render(execution)}
                  </td>
                );
              }

              if (col.key === 'procedure' || col.key === 'procedureName') {
                return (
                  <td key={col.key} className={col.className ?? 'px-4 py-3'}>
                    <div className={`font-bold text-gray-900 text-sm ${hoverColorClass} transition-colors`}>
                      {execution.procedureName}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Iniciado: {new Date(execution.startedAt).toLocaleDateString()}
                    </div>
                  </td>
                );
              }

              if (col.key === 'project' || col.key === 'projectName') {
                return (
                  <td key={col.key} className={col.className ?? 'px-4 py-3 text-gray-700 font-medium'}>
                    {execution.projectName}
                  </td>
                );
              }

              if (col.key === 'startedAt' || col.key === 'inicio') {
                return (
                  <td key={col.key} className={col.className ?? 'px-4 py-3 text-gray-600'}>
                    {new Date(execution.startedAt).toLocaleDateString()}
                  </td>
                );
              }

              return (
                <td key={col.key} className={col.className ?? 'px-4 py-3'}>
                  {(execution as any)[col.key]}
                </td>
              );
            })}

            {renderActions && (
              <td className="px-4 py-3 text-right relative w-[1%] whitespace-nowrap">
                <div className="relative inline-flex items-center justify-end h-7">
                  {renderActions(execution)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
