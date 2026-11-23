import React, { useState, useMemo } from 'react';
import type { Procedure, Execution } from '@pm/shared';
import type { ProcedureWithDetails } from '../types';
import { ProcedureDetailModal } from './ProcedureDetailModal';
import { getProcedureDetails } from '../api/proceduresApi';
import { getExecutions } from '@/features/procedure_executions/api/executionsApi';

interface ProcedureManagementPanelProps {
  procedures: Procedure[];
  onExecuteProcedure: (procedureId: number) => void;
  onNewProcedure: () => void;
}

export const ProcedureManagementPanel: React.FC<ProcedureManagementPanelProps> = ({
  procedures,
  onExecuteProcedure,
  onNewProcedure,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Solo procedimientos en estado Aprobado (APPROVED)
  const approvedProcedures = useMemo(() => {
    return procedures.filter((proc) => proc.state === 'APPROVED');
  }, [procedures]);

  // Calcular tags disponibles en base a todos los tags de los procedimientos aprobados (sin repetición)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    approvedProcedures.forEach((proc) => {
      if (proc.tags && Array.isArray(proc.tags)) {
        proc.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [approvedProcedures]);

  // Nivel de Detalle checkboxes (HU-008 CA 1)
  const [detailScope, setDetailScope] = useState({
    procedimiento: true,
    descripcion: true,
    pasos: true,
  });

  // Modal Detail state (HU-008 CA 3, 4, 5)
  const [selectedProcedureDetails, setSelectedProcedureDetails] = useState<ProcedureWithDetails | null>(null);
  const [procedureExecutions, setProcedureExecutions] = useState<Execution[]>([]);
  const [, setIsLoadingDetails] = useState(false);

  const toggleScope = (key: keyof typeof detailScope) => {
    setDetailScope((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  // Open Procedure Detail (HU-008 CA 3, 4, 5)
  const handleOpenDetail = async (procedureId: number) => {
    setIsLoadingDetails(true);
    try {
      const [details, allExecutions] = await Promise.all([
        getProcedureDetails(procedureId),
        getExecutions(),
      ]);
      if (details) {
        setSelectedProcedureDetails(details);
        setProcedureExecutions(allExecutions.filter((e) => e.idProcedure === procedureId));
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filter procedures according to CA 1 and CA 2 (only APPROVED state)
  const filteredProcedures = useMemo(() => {
    return approvedProcedures.filter((proc) => {
      const term = searchTerm.trim().toLowerCase();
      let matchesSearch = true;

      if (term) {
        const searchInTitle = detailScope.procedimiento && proc.name.toLowerCase().includes(term);
        const searchInDesc =
          detailScope.descripcion && proc.description.toLowerCase().includes(term);

        const searchInSteps =
          detailScope.pasos &&
          ((proc.stepNames && proc.stepNames.some((sn) => sn.toLowerCase().includes(term))) ||
           (proc.stepDescriptions && proc.stepDescriptions.some((sd) => sd.toLowerCase().includes(term))));

        const noneSelected =
          !detailScope.procedimiento && !detailScope.descripcion && !detailScope.pasos;

        matchesSearch = noneSelected
          ? proc.name.toLowerCase().includes(term)
          : Boolean(searchInTitle || searchInDesc || searchInSteps);
      }

      // Filter by tags / categories (CA 2)
      const procTags = proc.tags || ['General'];
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => procTags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [approvedProcedures, searchTerm, detailScope, selectedTags]);

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda y Filtrado (HU-008 CA 1 y CA 2) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de Búsqueda por Texto */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar procedimientos por nombre o descripción..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-colors"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Botón Nuevo Procedimiento */}
          <button
            type="button"
            onClick={onNewProcedure}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear Procedimiento
          </button>
        </div>

        {/* Nivel de Detalle Checkboxes (HU-008 CA 1) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-600">
          <span className="font-semibold text-gray-700">Buscar en:</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={detailScope.procedimiento}
              onChange={() => toggleScope('procedimiento')}
              className="rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
            Procedimiento (Título)
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={detailScope.descripcion}
              onChange={() => toggleScope('descripcion')}
              className="rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
            Descripción
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={detailScope.pasos}
              onChange={() => toggleScope('pasos')}
              className="rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
            Pasos (Título / Descripción)
          </label>
        </div>

        {/* Tags / Categorías dinámicos (HU-008 CA 2) */}
        {availableTags.length > 0 && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 mr-1">Categorías:</span>
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {tag}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={handleClearTags}
                className="text-xs text-red-600 hover:text-red-700 font-medium ml-2 cursor-pointer underline"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid de Procedimientos disponibles (HU-008 CA 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Mostrando {filteredProcedures.length} de {procedures.length} procedimientos
          </span>
        </div>

        {filteredProcedures.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium text-sm text-gray-600">No se encontraron procedimientos</p>
            <p className="text-xs text-gray-400 mt-1">
              Prueba modificando los términos de búsqueda o los filtros de categorías.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProcedures.map((proc) => {
              const tags = proc.tags && proc.tags.length > 0 ? proc.tags : ['General'];

              // Color de estado
              const stateColor =
                proc.state === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : proc.state === 'PENDING_APPROVAL'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : proc.state === 'DEVIATION'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200';

              const stateLabel =
                proc.state === 'APPROVED'
                  ? 'Aprobado'
                  : proc.state === 'PENDING_APPROVAL'
                    ? 'Pendiente Aprobación'
                    : proc.state === 'DEVIATION'
                      ? 'Con Desvío'
                      : 'Borrador';

              return (
                <div
                  key={proc.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Estado y Categorías */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${stateColor}`}
                        >
                          {stateLabel}
                        </span>
                        <div className="flex items-center gap-1 overflow-hidden">
                          {tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate"
                            >
                              {t}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Título */}
                      <h4
                        onClick={() => handleOpenDetail(proc.id)}
                        className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1 group-hover:text-red-600 transition-colors cursor-pointer"
                        title={proc.name}
                      >
                        {proc.name}
                      </h4>

                      {/* Descripción */}
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {proc.description || 'Sin descripción detallada disponible.'}
                      </p>
                    </div>

                    {/* Metadata inferior */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>ID #{proc.id}</span>
                      <span>
                        {new Date(proc.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Acciones */}
                  <div className="bg-gray-50/80 px-4 py-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(proc.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => onExecuteProcedure(proc.id)}
                      className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Ejecutar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle de Procedimiento (HU-008 CA 3, 4, 5) */}
      {selectedProcedureDetails && (
        <ProcedureDetailModal
          procedure={selectedProcedureDetails}
          executions={procedureExecutions}
          onClose={() => setSelectedProcedureDetails(null)}
          onExecute={(procId) => {
            setSelectedProcedureDetails(null);
            onExecuteProcedure(procId);
          }}
        />
      )}
    </div>
  );
};
