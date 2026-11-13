import React, { useState } from 'react';
import type { ProcedureWithDetails } from '../types';
import type { ExecutionWithDetails } from '@/features/procedure_executions/types';
import { FIELD_TYPE_LABELS } from '@shared/types';

interface ProcedureDetailModalProps {
  procedure: ProcedureWithDetails;
  exampleExecutions?: ExecutionWithDetails[];
  onClose: () => void;
  onExecute: (procedureId: number) => void;
}

export const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
  procedure,
  exampleExecutions = [],
  onClose,
  onExecute,
}) => {
  const [selectedExample, setSelectedExample] = useState<ExecutionWithDetails | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700">
                {procedure.state}
              </span>
              <span className="text-xs text-gray-400">Proyecto: {procedure.projectName}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{procedure.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Metadata & Metrics */}
          <div className="space-y-3">
            <div>
              <h3 className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">
                Descripción
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {procedure.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Pasos</span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{procedure.steps.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Creador</span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{procedure.creatorName}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Ejemplos Finalizados</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  {exampleExecutions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Procedure Steps List */}
          <div>
            <h3 className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">
              Estructura de Pasos ({procedure.steps.length})
            </h3>
            <div className="space-y-2">
              {procedure.steps.map((step, idx) => (
                <div key={step.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step.name}</span>
                  </div>
                  {step.description && (
                    <p className="text-gray-500 mt-1 pl-7 text-[11px]">{step.description}</p>
                  )}
                  {step.sections.length > 0 && (
                    <div className="pl-7 mt-2 space-y-1">
                      {step.sections.map((sec) => (
                        <div key={sec.id} className="text-[11px] text-gray-600">
                          • <span className="font-medium text-gray-700">{sec.name}</span>
                          <span className="text-gray-400 ml-1">({sec.fields.length} campos)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Executed Examples List (HU-008 CA 4 & CA 5) */}
          <div>
            <h3 className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">
              Ejemplos Ejecutados
            </h3>
            {exampleExecutions.length === 0 ? (
              <p className="text-gray-400 italic bg-gray-50 p-4 rounded-lg text-center">
                Aún no hay ejecuciones registradas como ejemplo para este procedimiento.
              </p>
            ) : (
              <div className="space-y-2">
                {exampleExecutions.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedExample(ex)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          Ejecución #{ex.id}
                        </span>
                        <span className="text-gray-400">por {ex.developerName}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Iniciada: {new Date(ex.startedAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Ver detalle de ejemplo →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => onExecute(procedure.id)}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>▶</span> Ejecutar Procedimiento
          </button>
        </div>
      </div>

      {/* Sub-modal: Detalle de Ejemplo (HU-008 CA 5) */}
      {selectedExample && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Detalle de Ejemplo: Ejecución #{selectedExample.id}
                </h4>
                <p className="text-xs text-gray-500">
                  Desarrollador: {selectedExample.developerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExample(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                  Inputs Ejecutados y Correcciones
                </span>
                {selectedExample.inputs.length === 0 ? (
                  <p className="text-gray-400 italic">No se registraron inputs en esta ejecución.</p>
                ) : (
                  selectedExample.inputs.map((inp) => (
                    <div key={inp.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                          {FIELD_TYPE_LABELS[inp.fieldType]}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(inp.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap">
                        {inp.content}
                      </div>

                      {inp.corrections && inp.corrections.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-amber-400 bg-amber-50/60 p-2 rounded text-[11px] text-amber-900">
                          <span className="font-bold block mb-0.5">Correcciones del Líder:</span>
                          {inp.corrections.map((corr) => (
                            <div key={corr.id} className="text-xs">
                              {corr.content || 'Ajuste requerido'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 flex justify-end bg-gray-50">
              <button
                type="button"
                onClick={() => setSelectedExample(null)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-black text-white rounded text-xs font-medium cursor-pointer"
              >
                Cerrar Ejemplo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
