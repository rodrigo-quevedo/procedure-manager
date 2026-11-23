import React, { useState } from 'react';
import type { Section, Field, FieldType, Input } from '@shared/types';
import { FieldItem } from './FieldItem';

interface SectionBlockProps {
  section: Section & { fields: Field[] };
  inputsMap?: Record<number, Input>;
  isExecutable?: boolean;
  canEditDefinition?: boolean;
  onUpdateSection?: (updated: Section) => void;
  onCreateField?: (sectionId: number, fieldType: FieldType, content: string) => void;
  onUpdateField?: (field: Field) => void;
  onSaveInput?: (fieldId: number, fieldType: FieldType, content: string) => void;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  inputsMap = {},
  isExecutable = true,
  canEditDefinition = true,
  onUpdateSection,
  onCreateField,
  onUpdateField,
  onSaveInput,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.name);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldType, setNewFieldType] = useState<FieldType>('TEXT');
  const [newFieldContent, setNewFieldContent] = useState('');

  const handleSaveTitle = () => {
    if (onUpdateSection) {
      onUpdateSection({ ...section, name: title });
    }
    setIsEditingTitle(false);
  };

  const handleCreateFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldContent.trim()) return;
    if (onCreateField) {
      onCreateField(section.id, newFieldType, newFieldContent.trim());
    }
    setNewFieldContent('');
    setIsCreatingField(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
      {/* Section Header */}
      <div className="border-b border-gray-100 pb-2">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-semibold text-gray-800 border border-red-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-red-500 flex-1"
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsEditingTitle(false)}
              className="px-2.5 py-1 text-gray-500 text-xs"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center gap-1.5 cursor-pointer group"
              onDoubleClick={() => {
                if (canEditDefinition) setIsEditingTitle(true);
              }}
            >
              <h3 className="font-semibold text-gray-800 text-base">{section.name}</h3>
              {canEditDefinition && (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  title="Editar sección"
                  className="text-gray-400 group-hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
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
            </div>
            {section.description && (
              <span className="text-xs text-gray-500 truncate max-w-xs">{section.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        {section.fields.map((field) => (
          <FieldItem
            key={field.id}
            field={field}
            input={inputsMap[field.id]}
            isExecutable={isExecutable}
            canEditDefinition={canEditDefinition}
            onUpdateFieldDefinition={onUpdateField}
            onSaveInput={onSaveInput}
          />
        ))}

        {section.fields.length === 0 && !isCreatingField && (
          <p className="text-xs text-gray-400 italic text-center py-2">
            No hay campos en esta sección.
          </p>
        )}
      </div>

      {/* Inline Create Field Form */}
      {isCreatingField && (
        <form onSubmit={handleCreateFieldSubmit} className="bg-red-50/50 p-3 rounded-lg border border-red-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase">Nuevo Campo</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-gray-600 font-medium">Tipo de campo:</label>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className="text-xs bg-white border border-red-200 text-gray-700 rounded px-2 py-1 outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="TEXT">Texto</option>
                <option value="CODE">Código / Consola</option>
                <option value="IMAGE">Imagen</option>
              </select>
            </div>
          </div>
          <textarea
            value={newFieldContent}
            onChange={(e) => setNewFieldContent(e.target.value)}
            rows={2}
            placeholder="Ingrese el contenido o descripción del campo..."
            className="w-full text-xs bg-white border border-gray-200 rounded p-2 outline-none focus:border-red-400"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingField(false)}
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-xs"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Button: + Crear Campo */}
      {canEditDefinition && !isCreatingField && (
        <div className="relative flex items-center justify-center pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-red-200"></div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingField(true)}
            className="relative z-10 inline-flex items-center gap-1 bg-white hover:bg-gray-50 border border-red-300 hover:border-red-400 text-gray-600 hover:text-red-600 px-3 py-0.5 rounded-full text-[11px] font-semibold shadow-2xs transition-all active:scale-95"
          >
            <span className="text-red-600 font-bold">+</span> Crear campo
          </button>
        </div>
      )}
    </div>
  );
};
