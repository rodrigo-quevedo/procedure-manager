import React, { useState } from 'react';
import type { Section, Field, FieldType, Input } from '@shared/types';
import { FieldItem } from './FieldItem';

interface SectionBlockProps {
  section: Section & { fields: Field[] };
  inputsMap?: Record<number, Input>;
  isExecutable?: boolean;
  canEditDefinition?: boolean;
  onUpdateSection?: (updated: Section) => void;
  onDeleteSection?: (sectionId: number) => void;
  onCreateField?: (sectionId: number, fieldType: FieldType, content: string) => void;
  onUpdateField?: (field: Field) => void;
  onDeleteField?: (fieldId: number) => void;
  onSaveInput?: (fieldId: number, fieldType: FieldType, content: string) => void;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  inputsMap = {},
  isExecutable = true,
  canEditDefinition = true,
  onUpdateSection,
  onDeleteSection,
  onCreateField,
  onUpdateField,
  onDeleteField,
  onSaveInput,
}) => {
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [title, setTitle] = useState(section.name);
  const [description, setDescription] = useState(section.description || '');
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldType, setNewFieldType] = useState<FieldType>('TEXT');
  const [newFieldContent, setNewFieldContent] = useState('');

  const handleStartEdit = () => {
    setTitle(section.name);
    setDescription(section.description || '');
    setIsEditingSection(true);
  };

  const handleSaveSection = () => {
    if (!title.trim()) return;
    if (onUpdateSection) {
      onUpdateSection({
        ...section,
        name: title.trim(),
        description: description.trim(),
      });
    }
    setIsEditingSection(false);
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
      <div className="border-b border-gray-100 pb-3">
        {isEditingSection ? (
          <div className="space-y-2 bg-gray-50/70 p-3 rounded-lg border border-red-200">
            <div>
              <label className="block text-[11px] font-bold text-red-600 uppercase mb-1">Nombre de la Sección</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-semibold text-gray-800 bg-white border border-red-300 rounded px-2.5 py-1 outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Nombre de la sección..."
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Descripción de la Sección</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full text-xs text-gray-700 bg-white border border-gray-300 rounded px-2.5 py-1 outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Descripción o instrucciones de la sección..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingSection(false)}
                className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar Sección
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex-1 cursor-pointer group"
              onDoubleClick={() => {
                if (canEditDefinition) handleStartEdit();
              }}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 text-base">{section.name}</h3>
                {canEditDefinition && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    title="Editar título y descripción"
                    className="text-gray-400 group-hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors cursor-pointer"
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
              {section.description ? (
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{section.description}</p>
              ) : canEditDefinition ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-[11px] text-gray-400 hover:text-red-600 italic mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold">+</span> Agregar descripción
                </button>
              ) : null}
            </div>

            {canEditDefinition && onDeleteSection && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Está seguro de eliminar la sección "${section.name}" y todos sus campos?`)) {
                    onDeleteSection(section.id);
                  }
                }}
                title="Eliminar sección"
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors cursor-pointer shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
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
            onDeleteField={onDeleteField}
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
