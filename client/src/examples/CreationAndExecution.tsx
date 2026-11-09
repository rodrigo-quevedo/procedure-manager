import React from 'react';

export const CreationAndExecutionView: React.FC = () => {
    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* Sidebar de navegación de pasos (Estilo Notion / Todoist) */}
            <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between">
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Proyecto / Ejecución Nueva
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-medium">
                            Simultáneo
                        </span>
                    </div>

                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Proyecto Asignado
                    </label>
                    <select className="w-full mb-6 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 outline-none focus:border-red-500">
                        <option>Sistema de Gestión de Pagos</option>
                        <option>API Gateway Principal</option>
                    </select>

                    <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                            Pasos del Procedimiento
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-red-50 text-red-600 font-medium text-sm border-l-2 border-red-600 cursor-pointer">
                            <span>1. Configurar Entorno</span>
                            <span className="text-xs text-red-400">⋮⋮</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-gray-100 text-gray-600 text-sm cursor-pointer">
                            <span>2. Ejecutar Migraciones</span>
                            <span className="text-xs text-gray-300">⋮⋮</span>
                        </div>
                    </div>

                    <button className="mt-4 w-full border border-dashed border-gray-300 rounded p-2 text-xs text-gray-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center gap-1">
                        + Crear Paso
                    </button>
                </div>

                <div className="space-y-2">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded text-sm transition-colors">
                        Guardar y Enviar
                    </button>
                    <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 py-1.5 rounded text-xs">
                        Guardar Borrador
                    </button>
                </div>
            </aside>

            {/* Panel Principal */}
            <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto">
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <input
                        type="text"
                        defaultValue="Despliegue de Microservicio Auth"
                        className="text-2xl font-bold w-full outline-none placeholder-gray-300 text-gray-900 mb-1"
                        placeholder="Nombre del procedimiento..."
                    />
                    <input
                        type="text"
                        defaultValue="Procedimiento para desplegar en staging las dependencias del módulo Auth"
                        className="text-sm text-gray-500 w-full outline-none placeholder-gray-300"
                        placeholder="Descripción corta del procedimiento..."
                    />
                </div>

                {/* Paso 1 */}
                <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 font-mono">Paso 1</span>
                                Configurar Entorno
                            </h3>
                            <button className="text-xs text-gray-400 hover:text-red-500">Eliminar Paso</button>
                        </div>

                        {/* Sección */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded p-4 mb-4">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Sección: Variables de Entorno
                            </div>

                            {/* Campo 1 */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Definición del Campo (Texto): Especificar clave JWT
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Ingresar la clave de firma token en la consola."
                                    className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-600 mb-2"
                                />

                                {/* Input Ejecutado */}
                                <div className="pl-3 border-l-2 border-red-500 bg-white p-2.5 rounded shadow-sm border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-red-600 block mb-1">
                                        Respuesta de Ejecución (Input)
                                    </span>
                                    <input
                                        type="text"
                                        defaultValue="JWT_SECRET=production_key_v12"
                                        className="w-full text-xs text-gray-800 outline-none font-mono bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Botón agregar campo */}
                            <div className="flex gap-2">
                                <button className="text-xs text-red-600 hover:underline font-medium">
                                    + Crear Campo (Texto/Código/Imagen)
                                </button>
                            </div>
                        </div>

                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium border border-gray-200 px-3 py-1 rounded">
                            + Crear Sección
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};