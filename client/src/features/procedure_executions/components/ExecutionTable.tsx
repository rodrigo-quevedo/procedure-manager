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
  procedureHoverColor?: 'red' | 'blue' | 'indigo' | 'amber' | 'emerald';
  // Nuevas props para control total de colores desde el componente padre
  headerClassName?: string;
  headerTextClassName?: string;
}

export const ExecutionTable: React.FC<ExecutionTableProps> = ({
  data,
  columns,
  onRowClick,
  renderActions,
  emptyMessage = 'No hay ejecuciones disponibles.',
  emptyClassName = 'p-4 bg-white rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500',
  rowHoverClassName = 'hover:bg-gray-50/80',
  divideClassName = 'divide-gray-100',
  procedureHoverColor = 'red',
  headerClassName = 'bg-gray-50/80 border-b border-gray-200',
  headerTextClassName = 'text-gray-600',
}) => {
  if (data.length === 0) {
    return (
      <div className={emptyClassName}>
        {emptyMessage}
      </div>
    );
  }

  const defaultColumns: ColumnDef<ExecutionListItem>[] = [
    { key: 'procedure', header: 'Procedimiento' },
    { key: 'project', header: 'Proyecto' },
    { key: 'startedAt', header: 'Inicio' },
  ];

  const effectiveColumns = columns ?? defaultColumns;

  // Mapeo escalable para el color de hover del texto del procedimiento
  const hoverColorMap = {
    red: 'hover:text-red-700',
    blue: 'hover:text-blue-600',
    indigo: 'hover:text-indigo-600',
    amber: 'hover:text-amber-700',
    emerald: 'hover:text-emerald-700',
  };

  const hoverColorClass = hoverColorMap[procedureHoverColor] ?? 'hover:text-red-700';

  return (
    <table className="w-full text-left text-sm text-gray-600">
      <thead className={`${headerClassName} text-[12px] font-semibold ${headerTextClassName} uppercase tracking-wider`}>
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
                const getProcedureStyle = () => {
                  switch (execution.state) {
                    case 'HAS_CORRECTIONS':
                    case 'PAUSED':
                      return 'font-semibold text-gray-900';
                    case 'PENDING_EVALUATION':
                      return 'font-normal text-gray-500';
                    case 'CANCELLED':
                    case 'APPROVED_FINISHED':
                      return 'font-normal text-gray-500';
                    default:
                      return 'font-normal text-gray-700';
                  }
                };

                return (
                  <td key={col.key} className={col.className ?? 'px-4 py-3'}>
                    <div className={`${getProcedureStyle()} text-sm ${hoverColorClass} transition-colors`}>
                      {execution.procedureName}
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