import React, { useState } from 'react';

export const CreationAndExecutionView: React.FC = () => {
    const [selectedStep, setSelectedStep] = useState(1);
    const steps = [1, 2, 3];

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
            {/* Sidebar de navegación */}
            <aside className="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between">
                <div>
                    {/* Header llamativo */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm font-bold text-red-600 tracking-wide bg-red-50 border border-red-200 px-3 py-1 rounded-md shadow-sm">
                            Nuevo Procedimiento
                        </span>
                    </div>

                    {/* Navegación de Pasos: Rectángulo contenedor con números redondeados en rojo principal */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 tracking-wider mb-2">
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

                    {/* Selección de Proyecto abajo del rectángulo de pasos */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                            Proyecto Asignado
                        </label>
                        <select className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm">
                            <option>Sistema de Gestión de Pagos</option>
                            <option>API Gateway Principal</option>
                        </select>
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
                    {/* Fila superior: Etiqueta Paso y Botones de acción */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold font-mono border border-red-200 shadow-sm">
                            Paso {selectedStep}
                        </span>

                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => { }}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow hover:shadow-md transition-all flex items-center gap-1 active:scale-95"
                            >
                                <span className="text-sm leading-none font-black">+</span> Crear Paso
                            </button>
                            <button
                                onClick={() => { }}
                                className="text-xs font-semibold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                            >
                                <span>🗑</span> Eliminar Paso
                            </button>
                        </div>
                    </div>

                    {/* Campo Título con Label e Icono de edición pegado al texto */}
                    <div className="mb-3">
                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                            Título
                        </label>
                        <div className="inline-flex items-center gap-2 max-w-full">
                            <span className="text-2xl font-bold text-gray-900 outline-none leading-none">
                                Despliegue de Microservicio Auth
                            </span>
                            <button
                                type="button"
                                title="Editar título"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-all flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Rule debajo del título */}
                    <hr className="border-t border-gray-200 my-3" />

                    {/* Campo Descripción con Label e Icono de edición pegado al texto */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Descripción
                        </label>
                        <div className="inline-flex items-center gap-2 max-w-full">
                            <span className="text-sm text-gray-600 outline-none">
                                Procedimiento para desplegar en staging las dependencias del módulo Auth
                            </span>
                            <button
                                type="button"
                                title="Editar descripción"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-all flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Seccion 1 */}
                <div className="space-y-6">
                    <span className="inline-block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        SECCIÓN 1
                    </span>
                    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="mb-1 border-b border-gray-100">

                            <h3 className="font-semibold text-gray-800 text-base">
                                Configurar Entorno
                                <button
                                    type="button"
                                    title="Editar título"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-all flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </h3>
                        </div>


                        {/* Campo 1 */}
                        <div className="border border-gray-100 rounded p-4 mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider mb-2">
                                Variables de Entorno
                            </div>

                            {/* Campo 1 */}
                            <div className="mb-4">
                                <div className="inline-flex items-center gap-1.5 max-w-full mb-1">
                                    <label className="text-xs font-medium text-gray-700">
                                        Especificar clave JWT: Ingresar la clave de firma token en la consola.
                                    </label>
                                    <button
                                        type="button"
                                        title="Editar definición"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-0.5 transition-all flex-shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                                {/* <input
                                    type="text"
                                    defaultValue=
                                    className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-600 mb-2"
                                /> */}

                                {/* Input Ejecutado Indentado con dropdown arriba a la derecha */}
                                <div className="ml-5 mt-2.5 pl-3 border-l-2  border-red-300 bg-red-100 p-3 rounded shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                                            Ejecución
                                        </span>
                                        <select
                                            defaultValue="Texto"
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
                                        defaultValue="JWT_SECRET=production_key_v12"
                                        className="w-full text-xs text-gray-800 outline-none font-mono bg-white p-3 rounded-md"
                                    />
                                </div>

                                {/* Botón rojo redondo pequeño con un signo + centrado abajo de EJECUCIÓN */}
                                {/* <div className="ml-5 mt-2 flex justify-center">
                                    <button
                                        type="button"
                                        title="Agregar"
                                        className="w-5 h-5 bg-red-400 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-90"
                                    >
                                        +
                                    </button>
                                </div> */}
                            </div>
                        </div>

                        {/* HR + Botón "+ Crear Campo" en el bottom del box Configurar Entorno */}
                        {/* <div className="relative  mb-1 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-red-200"></div>
                            </div>
                            <button
                                type="button"
                                className="relative z-10 inline-flex items-center gap-1 bg-white hover:bg-gray-50 border border-red-300 hover:border-red-400 text-gray-600 hover:text-red-600 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-95"
                            >
                                <span className="text-red-600 font-bold">+</span>
                            </button>
                        </div> */}
                    </div>

                </div>

                {/* Horizontal rule con texto "+ Crear Sección" en el medio */}
                <div className="relative my-6 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-red-400"></div>
                    </div>
                    <button
                        type="button"
                        className="relative z-10 inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-red-400 hover:border-red-400 text-gray-600 hover:text-red-600 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95"
                    >
                        <span className="text-red-600 font-bold">+</span> Crear Sección
                    </button>
                </div>

            </main>
        </div>
    );
};