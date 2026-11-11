import React, { useState } from 'react';

export const EvaluationView: React.FC = () => {
    const [selectedStep, setSelectedStep] = useState(1);
    const steps = [1, 2, 3];

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* Sidebar de navegación */}
            <aside className="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between">
                <div>
                    {/* Header llamativo */}
                    <div className="mb-6 flex items-center justify-bet gap-4 ">
                        <span className="text-sm font-bold text-red-600 tracking-wide bg-red-50 border border-red-200 px-3 py-1 rounded-md shadow-sm">
                            Evaluación:
                            <span className="ml-1 font-light">
                                Ejecución Estándar
                            </span>
                        </span>

                    </div>


                    {/* Navegación de Pasos: Rectángulo contenedor con números redondeados en rojo principal */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-red-600 tracking-wider mb-2">
                            Navegación
                        </label>
                        <div className="p-3 bg-white border border-gray-200 rounded-sm shadow-inner">
                            <div className="flex flex-wrap gap-2.5 items-center">
                                {steps.map((num) => {
                                    const isSelected = selectedStep === num;
                                    return (
                                        <button
                                            key={num}
                                            onClick={() => setSelectedStep(num)}
                                            className={`w-7 h-8 rounded-sm flex items-center justify-center font-bold text-sm transition-all shadow-sm ${isSelected
                                                ? 'bg-red-600 text-white scale-105'
                                                : 'bg-red-700 text-white hover:bg-red-700 hover:scale-105 opacity-90 hover:opacity-100'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contenedor de pasos existentes */}
                    </div>

                    {/* Proyecto Asignado como texto */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            Proyecto Asignado
                        </label>
                        <p className="text-xs font-semibold text-gray-800 leading-snug">
                            Sistema de Gestión de Pagos
                        </p>
                    </div>

                    {/* Ejecutado por con icono de perfil rojo */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            EJECUTADO POR
                        </label>
                        <div className="inline-flex items-center gap-1.5 max-w-full">
                            <span className="text-xs font-semibold text-gray-800 leading-snug">
                                Martín Quevedo
                            </span>
                            <div className="text-red-600 p-0.5 flex-shrink-0" title="Perfil ejecutante">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Nombre del Procedimiento */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            NOMBRE
                        </label>
                        <p className="text-xs font-semibold text-gray-800 leading-snug">
                            Despliegue de Microservicio Auth
                        </p>
                    </div>

                    {/* Descripción del Procedimiento */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            DESCRIPCIÓN
                        </label>
                        <p className="text-xs text-gray-600 leading-snug">
                            Procedimiento para desplegar en staging las dependencias del módulo Auth
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded text-sm transition-colors shadow">
                        Guardar
                    </button>
                    <button disabled className="w-full border border-gray-200 hover:bg-gray-100 text-gray-600 py-1.5 rounded text-xs transition-colors">
                        Enviar
                    </button>
                </div>
            </aside>

            {/* Panel Principal */}
            <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto">
                <div className="mb-6 border-b border-gray-100 pb-5">
                    {/* Fila superior: Etiqueta Paso, Botones Pausar/Cancelar y Botón Desviar Procedimiento */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold font-mono border border-red-200 shadow-sm">
                                Paso {selectedStep}
                            </span>
                            {/* <button
                                type="button"
                                title="Pausar procedimiento"
                                className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 hover:text-amber-800 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pausar
                            </button>
                            <button
                                type="button"
                                title="Cancelar procedimiento"
                                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 border border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-600 px-2.5 py-1 rounded-md text-xs font-semibold shadow-xs transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancelar
                            </button> */}
                        </div>

                        {/* <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => { }}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Desviar procedimiento
                            </button>
                        </div> */}
                    </div>

                    {/* Campo Título con Label */}
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            Título
                        </label>
                        <div className="inline-flex items-center gap-2 max-w-full">
                            <span className="text-2xl font-bold text-gray-900 outline-none leading-none">
                                Despliegue de Microservicio Auth
                            </span>
                        </div>
                    </div>

                    {/* Horizontal Rule debajo del título */}
                    <hr className="border-t border-gray-200 my-3" />

                    {/* Campo Descripción con Label */}
                    <div>
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            Descripción
                        </label>
                        <div className="inline-flex items-center gap-2 max-w-full">
                            <span className="text-sm text-gray-600 outline-none">
                                Procedimiento para desplegar en staging las dependencias del módulo Auth
                            </span>
                        </div>
                    </div>
                </div>

                {/* Seccion 1 */}
                <div className="space-y-6 mb-6">
                    <span className="inline-block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        SECCIÓN 1
                    </span>
                    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="mb-3 border-b border-gray-100 pb-2">
                            <h3 className="font-semibold text-gray-800 text-base">
                                Configurar Entorno
                            </h3>
                        </div>

                        {/* Campo 1 */}
                        <div className="border border-gray-100 rounded p-4">
                            <div className="text-xs font-medium uppercase tracking-wider mb-2">
                                Variables de Entorno
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-1.5 max-w-full mb-1">
                                    <label className="text-xs font-medium text-gray-700">
                                        Especificar clave JWT: Ingresar la clave de firma token en la consola.
                                    </label>
                                </div>

                                {/* Input Ejecutado Indentado: Tarjeta limpia y neutra */}
                                <div className="ml-5 mt-3 pl-3.5 border-l-3  bg-slate-50/70 p-3.5 rounded-lg border border-amber-600/80 shadow-2xs">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider">
                                                Respuesta ejecutada
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 bg-white border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider">
                                            TEXTO
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        defaultValue="JWT_SECRET=production_key_v12"
                                        className="w-full text-xs text-slate-800 outline-none font-mono bg-white p-2.5 rounded-md border border-slate-200"
                                    />
                                </div>

                                {/* Conector visual sutil entre Ejecución y Corrección */}
                                <div className="ml-19 h-3 w-px bg-slate-300"></div>

                                {/* Box Corrección: Tarjeta estilo Timeline / Feedback contextual */}
                                <div className="ml-15 rounded-lg border border-slate-200 bg-slate-50/60 p-4 shadow-sm border-l-4 border-l-red-500">
                                    {/* Header de Corrección */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] uppercase font-bold text-red-700 tracking-wider">
                                                    Corrección
                                                </span>
                                                <span className=" border border-red-300 rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                                                    Juan Pérez
                                                </span>
                                            </div>
                                        </div>

                                        {/* Selector de tipo */}
                                        <select
                                            defaultValue="Texto"
                                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
                                        >
                                            <option value="Texto">Texto</option>
                                            <option value="Codigo">Código</option>
                                            <option value="Consola">Consola</option>
                                            <option value="Imagen">Imagen</option>
                                        </select>
                                    </div>

                                    {/* Área de texto de la observación */}
                                    <textarea
                                        rows={2}
                                        className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed resize-none shadow-2xs font-sans"
                                        defaultValue="JWT_SECRET=staging_auth_key_sec2026_v2 (Sugerencia: no usar sufijo de producción en el entorno de staging)."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seccion 2 */}
                <div className="space-y-6">
                    <span className="inline-block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        SECCIÓN 2
                    </span>
                    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="mb-3 border-b border-gray-100 pb-2">
                            <h3 className="font-semibold text-gray-800 text-base">
                                Validación de Base de Datos
                            </h3>
                        </div>

                        {/* Campo Sección 2 */}
                        <div className="border border-gray-100 rounded p-4">
                            <div className="text-xs font-medium uppercase tracking-wider mb-2">
                                Verificación de Conexión y Migraciones
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-1.5 max-w-full mb-1">
                                    <label className="text-xs font-medium text-gray-700">
                                        Comando de Migración: Correr prisma migrate status en terminal staging.
                                    </label>
                                </div>

                                {/* Input Ejecutado Indentado */}
                                <div className="ml-5 mt-2.5 pl-3 border-l-2 border-red-300 bg-red-100 p-3 rounded shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                                            Ejecución
                                        </span>
                                        <select
                                            defaultValue="Consola"
                                            className="text-[11px] font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded px-2 py-0.5 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 cursor-pointer shadow-2xs"
                                        >
                                            <option value="Texto">Texto</option>
                                            <option value="Codigo">Código</option>
                                            <option value="Consola">Consola</option>
                                            <option value="Imagen">Imagen</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="npx prisma migrate deploy --preview-feature"
                                        className="w-full text-xs text-gray-800 outline-none font-mono bg-white p-3 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};