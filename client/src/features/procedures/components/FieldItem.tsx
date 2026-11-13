import React, { useState } from 'react';
import type { Field, FieldType, Input } from '@shared/types';
import { FIELD_TYPE_LABELS } from '@shared/types';

interface FieldItemProps {
  field: Field;
  input?: Input;
  isExecutable?: boolean;
  canEditDefinition?: boolean;
  onUpdateFieldDefinition?: (updated: Field) => void;
  onSaveInput?: (fieldId: number, fieldType: FieldType, content: string) => void;
}

export const FieldItem: React.FC<FieldItemProps> = ({
  field,
  input,
  isExecutable = true,
  canEditDefinition = true,
  onUpdateFieldDefinition,
  onSaveInput,
}) => {
  const [isEditingDef, setIsEditingDef] = useState(false);
  const [defContent, setDefContent] = useState(field.content);
  const [defType, setDefType] = useState<FieldType>(field.fieldType);

  const [isExecuting, setIsExecuting] = useState(Boolean(input));
  const [inputType, setInputType] = useState<FieldType>(input?.fieldType || 'TEXT');
  const [inputContent, setInputContent] = useState(input?.content || '');
  const [isSaved, setIsSaved] = useState(Boolean(input));

  const handleSaveDef = () => {
    if (onUpdateFieldDefinition) {
      onUpdateFieldDefinition({
        ...field,
        fieldType: defType,
        content: defContent,
      });
    }
    setIsEditingDef(false);
  };

  const handleSaveInput = () => {
    if (onSaveInput) {
      onSaveInput(field.id, inputType, inputContent);
      setIsSaved(true);
    }
  };

  return (
    <div
      className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      onDoubleClick={() => {
        if (canEditDefinition && !isEditingDef) {
          setIsEditingDef(true);
        }
      }}
    >
      {/* Definition Row */}
      {isEditingDef ? (
        <div className="space-y-2 bg-white p-3 rounded border border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-red-600">Editar Campo</span>
            <select
              value={defType}
              onChange={(e) => setDefType(e.target.value as FieldType)}
              className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 outline-none focus:border-red-500"
            >
              <option value="TEXT">Texto</option>
              <option value="CODE">Código</option>
              <option value="IMAGE">Imagen</option>
            </select>
          </div>
          <textarea
            value={defContent}
            onChange={(e) => setDefContent(e.target.value)}
            rows={2}
            className="w-full text-xs border border-gray-200 rounded p-2 outline-none focus:border-red-500 font-sans"
            placeholder="Instrucción o contenido del campo..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingDef(false)}
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveDef}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-xs"
            >
              Guardar Campo
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                {FIELD_TYPE_LABELS[field.fieldType]}
              </span>
            </div>
            {field.fieldType === 'CODE' ? (
              <pre className="text-xs bg-slate-900 text-slate-100 p-2.5 rounded font-mono overflow-x-auto whitespace-pre-wrap">
                {field.content}
              </pre>
            ) : field.fieldType === 'IMAGE' ? (
              <div className="text-xs text-gray-700">
                <span className="text-gray-500 italic block mb-1">URL de referencia / Imagen:</span>
                <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200 block truncate">
                  {field.content}
                </span>
              </div>
            ) : (
              <p className="text-xs font-medium text-gray-800 leading-relaxed">{field.content}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canEditDefinition && (
              <button
                type="button"
                onClick={() => setIsEditingDef(true)}
                title="Editar definición"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}
            {isExecutable && !isExecuting && (
              <button
                type="button"
                onClick={() => setIsExecuting(true)}
                className="text-xs bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-2.5 py-1 rounded font-medium transition-all shadow-xs"
              >
                Ejecutar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Execution Input Box */}
      {isExecuting && (
        <div className="mt-3 pl-3 border-l-2 border-red-400 bg-red-50/60 p-3 rounded-lg border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Ejecución de Campo
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 font-medium">Tipo Input:</label>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value as FieldType);
                  setIsSaved(false);
                }}
                className="text-[11px] font-medium bg-white border border-red-200 text-gray-700 rounded px-2 py-0.5 outline-none focus:border-red-500 cursor-pointer shadow-xs"
              >
                <option value="TEXT">Texto</option>
                <option value="CODE">Código</option>
                <option value="IMAGE">Imagen</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {inputType === 'CODE' ? (
              <textarea
                value={inputContent}
                onChange={(e) => {
                  setInputContent(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Pegar resultado, comando de consola o código ejecutado..."
                rows={3}
                className="w-full text-xs text-gray-900 outline-none font-mono bg-white p-2.5 rounded border border-gray-200 focus:border-red-400"
              />
            ) : inputType === 'IMAGE' ? (
              <input
                type="text"
                value={inputContent}
                onChange={(e) => {
                  setInputContent(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="URL o ruta de la captura de pantalla..."
                className="w-full text-xs text-gray-900 outline-none bg-white p-2 rounded border border-gray-200 focus:border-red-400"
              />
            ) : (
              <input
                type="text"
                value={inputContent}
                onChange={(e) => {
                  setInputContent(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Ingresar contenido del resultado o valor obtenido..."
                className="w-full text-xs text-gray-900 outline-none bg-white p-2 rounded border border-gray-200 focus:border-red-400"
              />
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-500">
                {isSaved ? '✓ Guardado como parte de la ejecución' : 'Cambios sin guardar'}
              </span>
              <button
                type="button"
                onClick={handleSaveInput}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded shadow-xs transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
