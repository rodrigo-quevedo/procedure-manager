import React from 'react';
import { PlaySquare, BookOpen, Plus } from 'lucide-react';

export type ProceduresNavSection = 'EXECUTIONS' | 'PROCEDURES';

interface ProceduresSidebarNavProps {
  activeSection: ProceduresNavSection;
  onSelectSection: (section: ProceduresNavSection) => void;
  onCreateProcedure?: () => void;
  className?: string;
}

export const ProceduresSidebarNav: React.FC<ProceduresSidebarNavProps> = ({
  activeSection,
  onSelectSection,
  onCreateProcedure,
  className = '',
}) => {
  return (
    <aside
      className={`w-full md:w-60 shrink-0 bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div className="space-y-1">
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Navegación
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectSection('EXECUTIONS')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'EXECUTIONS'
              ? 'bg-red-50 text-red-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <PlaySquare
            className={`w-4 h-4 shrink-0 transition-transform ${
              activeSection === 'EXECUTIONS' ? 'text-red-600' : 'text-gray-400'
            }`}
          />
          <span>Ejecuciones</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('PROCEDURES')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'PROCEDURES'
              ? 'bg-red-50 text-red-700 shadow-2xs font-bold'
              : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
          }`}
        >
          <BookOpen
            className={`w-4 h-4 shrink-0 transition-transform ${
              activeSection === 'PROCEDURES' ? 'text-red-600' : 'text-gray-400'
            }`}
          />
          <span>Procedimientos Estándar</span>
        </button>
      </div>

      <div className="pt-3 mt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onCreateProcedure}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Crear Procedimiento</span>
        </button>
      </div>
    </aside>
  );
};
