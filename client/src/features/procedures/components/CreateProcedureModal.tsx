import React, { useState, useEffect } from 'react';
import type { ClientProject as Project } from '@/features/projects';
import { getProjects } from '@/features/projects/api/getProjects';
import { X, Tag, Plus, AlertCircle } from 'lucide-react';

interface CreateProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    projectId: number;
    tags: string[];
  }) => void;
  availableProjects?: Project[];
}

export const CreateProcedureModal: React.FC<CreateProcedureModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  availableProjects,
}) => {
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['General']);
  const [projects, setProjects] = useState<Project[]>(availableProjects || []);
  const [isLoadingProjects, setIsLoadingProjects] = useState(!availableProjects);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTagInput('');
      setTags(['General']);
      setError(null);

      // Cargar proyectos asignados al miembro (MIEMBROS_PROYECTO)
      const fetchAssignedProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const list = await getProjects(undefined, { assignedOnly: true });
          setProjects(list);
          if (list.length > 0) {
            setProjectId(list[0].id);
          } else {
            setProjectId('');
          }
        } catch (err) {
          console.error('Error al cargar proyectos del usuario:', err);
        } finally {
          setIsLoadingProjects(false);
        }
      };

      fetchAssignedProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTagInput('');
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, ingresa el nombre del procedimiento.');
      return;
    }

    if (!projectId) {
      setError('Debes seleccionar un proyecto asignado.');
      return;
    }

    onCreate({
      name: name.trim(),
      projectId: Number(projectId),
      tags: tags.length > 0 ? tags : ['General'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Crear Procedimiento</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Define el nombre, el proyecto asignado y las categorías del nuevo procedimiento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre de procedimiento */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nombre de Procedimiento *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Despliegue en Servidor Staging"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              autoFocus
            />
          </div>

          {/* Dropdown Proyecto (select projects in miembros_proyecto where id_member = id_usuario) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Proyecto Asignado *
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')}
                disabled={isLoadingProjects || projects.length === 0}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {isLoadingProjects ? (
                  <option value="">Cargando proyectos asignados...</option>
                ) : projects.length === 0 ? (
                  <option value="">No tienes proyectos asignados actualmente</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            {projects.length === 0 && !isLoadingProjects && (
              <p className="text-[11px] text-amber-600 mt-1">
                Para crear un procedimiento, un Líder o la Organización debe asignarte a al menos un proyecto.
              </p>
            )}
          </div>

          {/* Mini componente para categorías (Tags) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Categorías / Tags
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDownTag}
                  placeholder="Escribe una categoría y presiona Enter o +"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
                />
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>

            {/* Listado de tags agregados con cruz para eliminar */}
            <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-gray-50 border border-gray-200 rounded-lg">
              {tags.length === 0 ? (
                <span className="text-[11px] text-gray-400 italic">No hay categorías agregadas.</span>
              ) : (
                tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-900 transition-colors cursor-pointer"
                      title="Eliminar categoría"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Botones Crear y Cancelar */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoadingProjects || projects.length === 0}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
