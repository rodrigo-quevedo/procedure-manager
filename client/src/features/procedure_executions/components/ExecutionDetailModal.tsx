import React from 'react';
import type { ExecutionWithDetails } from '../types';
import { FIELD_TYPE_LABELS, EXECUTION_STATE_LABELS } from '@shared/types';

interface ExecutionDetailModalProps {
  execution: ExecutionWithDetails;
  onClose: () => void;
  onResume?: (executionId: number) => void;
}

export const ExecutionDetailModal: React.FC<ExecutionDetailModalProps> = ({
  execution,
  onClose,
  onResume,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {EXECUTION_STATE_LABELS[execution.state]}
              </span>
              <span className="text-xs text-gray-500">Ejecución #{execution.id}</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1">
              {execution.procedureName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-gray-400">Desarrollador</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5 truncate">
                {execution.developerName}
              </p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-gray-400">Inicio</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">
                {new Date(execution.startedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Inputs</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">{execution.inputs.length}</p>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-gray-400">Fin</span>
              <p className="text-xs font-semibold text-gray-900 mt-0.5">
                {execution.endedAt ? new Date(execution.endedAt).toLocaleDateString() : 'En curso'}
              </p>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Datos e Inputs Registrados ({execution.inputs.length})
            </h3>
            {execution.inputs.length === 0 ? (
              <p className="text-gray-400 italic bg-gray-50 p-4 rounded-lg text-center">
                Aún no hay inputs completados en esta ejecución.
              </p>
            ) : (
              <div className="space-y-3">
                {execution.inputs.map((inp, idx) => (
                  <div key={inp.id} className="p-3.5 rounded-lg border border-gray-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                          {FIELD_TYPE_LABELS[inp.fieldType]}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(inp.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded border border-gray-100 font-mono text-xs text-gray-800 whitespace-pre-wrap">
                      {inp.content}
                    </div>

                    {inp.corrections && inp.corrections.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-red-500 bg-red-50/50 p-2 rounded text-[11px] text-red-800">
                        <span className="font-bold block mb-1">Correcciones solicitadas:</span>
                        {inp.corrections.map((corr) => (
                          <div key={corr.id} className="text-xs">
                            {corr.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg cursor-pointer"
          >
            Cerrar
          </button>

          {execution.state === 'PAUSED' && onResume && (
            <button
              type="button"
              onClick={() => onResume(execution.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>▶</span> Reanudar Ejecución
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
