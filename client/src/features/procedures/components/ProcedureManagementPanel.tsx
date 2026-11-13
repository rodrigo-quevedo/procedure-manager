import React, { useState, useMemo } from 'react';
import type { Procedure } from '@shared/types';
import type { ProcedureWithDetails } from '../types';
import { ProcedureDetailModal } from './ProcedureDetailModal';
import { getProcedureDetails } from '../api/proceduresApi';
import { getExecutionDetails } from '@/features/procedure_executions/api/executionsApi';
import type { ExecutionWithDetails } from '@/features/procedure_executions/types';
import { storage } from '@/services/storage';

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
  const [tagSearchInput, setTagSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'DevOps',
    'Backend',
    'Seguridad',
    'Cloud',
    'Frontend',
    'Testing',
  ]);

  // Nivel de Detalle checkboxes (HU-008 CA 1)
  const [detailScope, setDetailScope] = useState({
    procedimiento: true,
    descripcion: true,
    pasos: true,
  });

  // Modal Detail state (HU-008 CA 3, 4, 5)
  const [selectedProcedureDetails, setSelectedProcedureDetails] = useState<ProcedureWithDetails | null>(null);
  const [exampleExecutions, setExampleExecutions] = useState<ExecutionWithDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tagSearchInput.trim();
    if (!trimmed) return;

    const formattedTag = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!availableTags.includes(formattedTag)) {
      setAvailableTags((prev) => [...prev, formattedTag]);
    }
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags((prev) => [...prev, formattedTag]);
    }
    setTagSearchInput('');
  };

  // Open Procedure Detail (HU-008 CA 3, 4, 5)
  const handleOpenDetail = async (procedureId: number) => {
    setIsLoadingDetails(true);
    try {
      const details = await getProcedureDetails(procedureId);
      if (details) {
        setSelectedProcedureDetails(details);
        // Find example executions (e.g. APPROVED_FINISHED executions of this procedure)
        const allExecutions = storage.getExecutions().filter((e) => e.idProcedure === procedureId);
        const hydratedExamples: ExecutionWithDetails[] = [];
        for (const ex of allExecutions) {
          const det = await getExecutionDetails(ex.id);
          if (det) hydratedExamples.push(det);
        }
        setExampleExecutions(hydratedExamples);
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Steps lookup for filtering by steps content (HU-008 CA 1)
  const allSteps = useMemo(() => storage.getSteps(), [procedures]);

  // Filter procedures according to CA 1 and CA 2
  const filteredProcedures = useMemo(() => {
    return procedures.filter((proc) => {
      const term = searchTerm.trim().toLowerCase();
      let matchesSearch = true;

      if (term) {
        const searchInTitle = detailScope.procedimiento && proc.name.toLowerCase().includes(term);
        const searchInDesc =
          detailScope.descripcion && proc.description.toLowerCase().includes(term);

        const procSteps = allSteps.filter((s) => s.idProcedure === proc.id);
        const searchInSteps =
          detailScope.pasos &&
          procSteps.some(
            (s) =>
              s.name.toLowerCase().includes(term) ||
              s.description.toLowerCase().includes(term)
          );

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
  }, [procedures, searchTerm, detailScope, allSteps, selectedTags]);

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Gestión de Procedimientos
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Explora, busca y ejecuta procedimientos estándar aprobados para tu organización.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewProcedure}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span className="text-sm font-bold leading-none">+</span> Crear y Ejecutar Procedimiento
        </button>
      </div>

      {/* SEARCH BAR & DETAIL SCOPE CHECKBOXES (HU-008 CA 1) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Input text */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
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
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar procedimientos aprobados..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-red-500 transition-colors"
            />
          </div>

          {/* Nivel de Detalle Checkboxes */}
          <div className="flex items-center gap-4 text-xs text-gray-700 font-medium px-1">
            <span className="text-red-600 font-bold text-[11px] uppercase tracking-wider">
              Nivel de Detalle:
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={detailScope.procedimiento}
                onChange={() => toggleScope('procedimiento')}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Nombre</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={detailScope.descripcion}
                onChange={() => toggleScope('descripcion')}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Descripción</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={detailScope.pasos}
                onChange={() => toggleScope('pasos')}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Pasos</span>
            </label>
          </div>
        </div>

        {/* TAGS / CATEGORIAS (HU-008 CA 2) */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-red-600 tracking-wider mr-1">
              Categorías:
            </span>
            <button
              type="button"
              onClick={handleClearTags}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                selectedTags.length === 0
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 border cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-red-50/70 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <span>{tag}</span>
                  {isSelected && <span className="text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddTag} className="flex items-center gap-1">
            <input
              type="text"
              value={tagSearchInput}
              onChange={(e) => setTagSearchInput(e.target.value)}
              placeholder="+ Agregar tag..."
              className="text-[11px] py-1 px-2.5 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-red-400 w-32"
            />
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={handleClearTags}
                className="text-[11px] text-gray-500 hover:text-red-600 px-2 py-1"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>
      </div>

      {/* PROCEDURE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProcedures.map((proc) => {
          const procSteps = allSteps.filter((s) => s.idProcedure === proc.id);
          const firstTag = proc.tags?.[0] || 'General';

          return (
            <div
              key={proc.id}
              className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-sm hover:border-red-300 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
              onClick={() => handleOpenDetail(proc.id)}
            >
              <div className="p-4 bg-gradient-to-b from-gray-50/80 to-transparent border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
                    {firstTag}
                  </span>
                  <button
                    type="button"
                    title="Ejecutar procedimiento"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecuteProcedure(proc.id);
                    }}
                    className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-1 rounded-md text-[11px] shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Iniciar
                  </button>
                </div>

                <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors mt-2 leading-snug">
                  {proc.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {proc.description}
                </p>
              </div>

              {/* Steps summary */}
              <div className="p-4 flex-1 space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Pasos ({procSteps.length})</span>
                </div>
                <ol className="space-y-1 pt-1">
                  {procSteps.slice(0, 3).map((st, idx) => (
                    <li key={st.id} className="text-xs text-gray-600 truncate flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-red-500">{idx + 1}.</span>
                      <span className="truncate">{st.name}</span>
                    </li>
                  ))}
                  {procSteps.length > 3 && (
                    <li className="text-[10px] text-gray-400 italic">
                      + {procSteps.length - 3} pasos adicionales
                    </li>
                  )}
                </ol>
              </div>

              {/* Metrics footer (HU-008 CA 4) */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="text-[11px] font-medium text-gray-700">Ver detalles</span>
                <span className="text-red-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProcedures.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-700">No se encontraron procedimientos</p>
          <p className="text-xs text-gray-400 mt-1">Prueba cambiando los términos o limpiando los tags.</p>
        </div>
      )}

      {/* Procedure Detail Modal (HU-008 CA 3, 4, 5) */}
      {selectedProcedureDetails && (
        <ProcedureDetailModal
          procedure={selectedProcedureDetails}
          exampleExecutions={exampleExecutions}
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
