import React, { useState } from 'react';
import {
    Play,
    Pause,
    XCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    X,
    AlertTriangle,
    ArrowLeft
} from 'lucide-react';

// --- Tipos de Datos (TypeScript) ---
export type ExecutionState =
    | 'ACTIVE'
    | 'PAUSED'
    | 'CANCELLED'
    | 'PENDING_EVALUATION'
    | 'HAS_CORRECTIONS'
    | 'APPROVED_FINISHED';

export interface ExecutionItem {
    idExecution: number;
    idProcedure: number;
    procedureName: string;
    projectName: string;
    developerName: string;
    state: ExecutionState;
    startedAt: string;
    lastProgress: string;
    totalSteps: number;
    completedSteps: number;
}

// --- Mocks Iniciales de Prueba ---
const INITIAL_EXECUTIONS: ExecutionItem[] = [
    {
        idExecution: 104,
        idProcedure: 4,
        procedureName: 'Integración de Bucket Cloudflare R2',
        projectName: 'Almacenamiento Multimedia',
        developerName: 'Juan Pérez',
        state: 'HAS_CORRECTIONS',
        startedAt: '2026-11-07 11:20',
        lastProgress: 'Líder solicitó corregir tipo de campo en comprobante',
        totalSteps: 3,
        completedSteps: 2,
    },
    {
        idExecution: 107,
        idProcedure: 7,
        procedureName: 'Renovación de Certificados SSL Wildcard',
        projectName: 'Infraestructura Cloud',
        developerName: 'Juan Pérez',
        state: 'HAS_CORRECTIONS',
        startedAt: '2026-11-08 09:15',
        lastProgress: 'Requiere adjuntar captura de validación DNS',
        totalSteps: 4,
        completedSteps: 3,
    },
    {
        idExecution: 101,
        idProcedure: 1,
        procedureName: 'Despliegue de Microservicio en Staging',
        projectName: 'Sistema Core Backend',
        developerName: 'Juan Pérez',
        state: 'PAUSED',
        startedAt: '2026-11-09 10:30',
        lastProgress: 'Paso 3 de 5 completado - Variables de entorno verificadas',
        totalSteps: 5,
        completedSteps: 3,
    },
    {
        idExecution: 108,
        idProcedure: 8,
        procedureName: 'Actualización de Dependencias con Breaking Changes',
        projectName: 'Portal Clientes',
        developerName: 'Juan Pérez',
        state: 'PAUSED',
        startedAt: '2026-11-09 11:50',
        lastProgress: 'Pausado esperando aprobación de upgrade de React 19',
        totalSteps: 6,
        completedSteps: 2,
    },
    {
        idExecution: 102,
        idProcedure: 2,
        procedureName: 'Migración de Esquema SQLite WAL',
        projectName: 'Base de Datos Local',
        developerName: 'Juan Pérez',
        state: 'ACTIVE',
        startedAt: '2026-11-09 14:15',
        lastProgress: 'Ejecutando script de migración v2.4',
        totalSteps: 4,
        completedSteps: 1,
    },
    {
        idExecution: 103,
        idProcedure: 3,
        procedureName: 'Auditoría de Tokens JWT & Refresh Tokens',
        projectName: 'Módulo de Seguridad',
        developerName: 'Juan Pérez',
        state: 'PENDING_EVALUATION',
        startedAt: '2026-11-08 16:00',
        lastProgress: 'Enviado para evaluación por Líder Técnico',
        totalSteps: 6,
        completedSteps: 6,
    },
    {
        idExecution: 105,
        idProcedure: 5,
        procedureName: 'Configuración Inicial de Workspace Vite + React',
        projectName: 'Prototipo Frontend',
        developerName: 'Juan Pérez',
        state: 'APPROVED_FINISHED',
        startedAt: '2026-11-06 09:00',
        lastProgress: 'Aprobado y finalizado con éxito',
        totalSteps: 5,
        completedSteps: 5,
    },
    {
        idExecution: 106,
        idProcedure: 6,
        procedureName: 'Pruebas de Estrés en Endpoints REST',
        projectName: 'Sistema Core Backend',
        developerName: 'Juan Pérez',
        state: 'CANCELLED',
        startedAt: '2026-11-05 15:45',
        lastProgress: 'Cancelado por interrupción de infraestructura',
        totalSteps: 4,
        completedSteps: 1,
    },
];

export const ExecutionManagementMock: React.FC = () => {
    const [executions, setExecutions] = useState<ExecutionItem[]>(INITIAL_EXECUTIONS);
    const [activeTab, setActiveTab] = useState<ExecutionState | 'ALL'>('ALL');

    // Estados para Modales / Vistas de Maqueta
    const [selectedExecution, setSelectedExecution] = useState<ExecutionItem | null>(null);
    const [showActiveExecutionScreen, setShowActiveExecutionScreen] = useState<ExecutionItem | null>(null);
    const [cancelCandidate, setCancelCandidate] = useState<ExecutionItem | null>(null);

    // Handlers de Acciones
    const handlePause = (idExecution: number) => {
        setExecutions(prev =>
            prev.map(item =>
                item.idExecution === idExecution ? { ...item, state: 'PAUSED' } : item
            )
        );
        if (showActiveExecutionScreen?.idExecution === idExecution) {
            setShowActiveExecutionScreen(null);
        }
    };

    const handleResume = (execution: ExecutionItem) => {
        setExecutions(prev =>
            prev.map(item =>
                item.idExecution === execution.idExecution ? { ...item, state: 'ACTIVE' } : item
            )
        );
        setShowActiveExecutionScreen({ ...execution, state: 'ACTIVE' });
    };

    const handleConfirmCancel = () => {
        if (!cancelCandidate) return;
        setExecutions(prev =>
            prev.map(item =>
                item.idExecution === cancelCandidate.idExecution
                    ? { ...item, state: 'CANCELLED' }
                    : item
            )
        );
        if (showActiveExecutionScreen?.idExecution === cancelCandidate.idExecution) {
            setShowActiveExecutionScreen(null);
        }
        setCancelCandidate(null);
    };

    // Requerimiento 1: Listas prioritarias superiores
    const correctionExecutions = executions.filter(item => item.state === 'HAS_CORRECTIONS');
    const pausedExecutions = executions.filter(item => item.state === 'PAUSED');

    // Filtrado según pestañas de estado de la vista general
    const filteredExecutions = executions.filter(item => {
        if (activeTab === 'ALL') return true;
        return item.state === activeTab;
    });

    // Requerimiento 3: Jerarquía y Esquema de Colores
    // 1. Activa: el más llamativo (Azul vibrante con borde y pulso)
    // 2. Pendiente Corrección: muy visible (Ámbar/Naranja llamativo)
    // 3. Pausada: amarillo/dorado cálido
    // Cancelada: Gris
    // Pendiente Evaluación: Negro / Dark slate
    // Aprobada: Verde esmeralda suave
    const renderStateBadge = (state: ExecutionState) => {
        switch (state) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        <Play className="w-3 h-3 fill-current" /> Activa
                    </span>
                );
            case 'HAS_CORRECTIONS':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-xs">
                        <AlertCircle className="w-3.5 h-3.5" /> Pendiente Corrección
                    </span>
                );
            case 'PAUSED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <Pause className="w-3 h-3" /> Pausada
                    </span>
                );
            case 'PENDING_EVALUATION':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                        <Clock className="w-3 h-3" /> Pendiente Evaluación
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                        <XCircle className="w-3 h-3" /> Cancelada
                    </span>
                );
            case 'APPROVED_FINISHED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Aprobada
                    </span>
                );
        }
    };

    // Requerimiento 2: Componente auxiliar para botones de acciones alineados y de tamaño uniforme
    const renderActionButtons = (execution: ExecutionItem) => {
        return (
            <div className="flex items-center justify-end gap-1.5 h-7">
                {/* Botón Ver Detalle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExecution(execution);
                    }}
                    className="inline-flex items-center justify-center w-7 h-7 text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                    title="Ver Detalle"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Botón Pausar (Solo Activa) */}
                {execution.state === 'ACTIVE' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePause(execution.idExecution);
                        }}
                        className="inline-flex items-center justify-center gap-1 h-7 px-2.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors"
                        title="Pausar Ejecución"
                    >
                        <Pause className="w-3 h-3" /> Pausar
                    </button>
                )}

                {/* Botón Reanudar (Si está Pausada o con Correcciones) */}
                {(execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleResume(execution);
                        }}
                        className="inline-flex items-center justify-center gap-1 h-7 px-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
                        title="Reanudar Ejecución"
                    >
                        <Play className="w-3 h-3 fill-current" /> Reanudar
                    </button>
                )}

                {/* Botón Cancelar (Si está Activa, Pausada o con Correcciones) */}
                {(execution.state === 'ACTIVE' || execution.state === 'PAUSED' || execution.state === 'HAS_CORRECTIONS') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setCancelCandidate(execution);
                        }}
                        className="inline-flex items-center justify-center gap-1 h-7 px-2.5 text-xs font-medium text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-md transition-colors"
                        title="Cancelar Ejecución"
                    >
                        <XCircle className="w-3 h-3" /> Cancelar
                    </button>
                )}
            </div>
        );
    };

    // --- VISTA DE PANTALLA COMPLETA SI SE REANUDA ---
    if (showActiveExecutionScreen) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <div>
                            <button
                                onClick={() => setShowActiveExecutionScreen(null)}
                                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver a Gestión de Ejecuciones
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">{showActiveExecutionScreen.procedureName}</h1>
                            <p className="text-xs text-gray-500">Proyecto: {showActiveExecutionScreen.projectName} | ID Ejecución: #{showActiveExecutionScreen.idExecution}</p>
                        </div>
                        {renderStateBadge(showActiveExecutionScreen.state)}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                        <strong>Modo Ejecución Activa:</strong> Aquí el desarrollador completa los pasos del procedimiento.
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Progreso del Procedimiento</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${(showActiveExecutionScreen.completedSteps / showActiveExecutionScreen.totalSteps) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500">{showActiveExecutionScreen.completedSteps} de {showActiveExecutionScreen.totalSteps} pasos completados.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                        <button
                            onClick={() => handlePause(showActiveExecutionScreen.idExecution)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition"
                        >
                            <Pause className="w-4 h-4" /> Pausar y Guardar
                        </button>
                        <button
                            onClick={() => setCancelCandidate(showActiveExecutionScreen)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-300 rounded-md transition"
                        >
                            <XCircle className="w-4 h-4" /> Cancelar Ejecución
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Encabezado Principal */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Ejecuciones</h1>
                        <p className="text-sm text-gray-500">Supervisa las tareas que requieren atención inmediata y consulta el historial completo.</p>
                    </div>
                </div>

                {/* REQUERIMIENTO 1: SECCIÓN 1 - PENDIENTES DE CORRECCIÓN (ARRIBA DE TODO) */}
                <div className="bg-white rounded-xl border-2 border-red-300 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-red-50 to-orange-50/40 border-b border-red-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-red-500 text-white shadow-xs">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-red-950 uppercase tracking-wide">
                                    Pendientes de Corrección ({correctionExecutions.length})
                                </h2>
                                <p className="text-xs text-red-800">
                                    Observaciones devueltas por el revisor que requieren ajustes del desarrollador.
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                            Alta Prioridad
                        </span>
                    </div>

                    {correctionExecutions.length > 0 ? (
                        <div className="divide-y divide-amber-100">
                            {correctionExecutions.map(execution => (
                                <div
                                    key={execution.idExecution}
                                    className="p-4 hover:bg-amber-50/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setSelectedExecution(execution)}
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-mono font-semibold text-gray-500">#{execution.idExecution}</span>
                                            <h3 className="text-sm font-bold text-gray-900 hover:text-amber-700">
                                                {execution.procedureName}
                                            </h3>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs font-medium text-gray-600">{execution.projectName}</span>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg border border-red-200/80 text-xs text-red-900 font-medium flex items-start gap-1.5">
                                            <span className="font-bold shrink-0">Motivo de corrección:</span>
                                            <span>{execution.lastProgress}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                                        {renderStateBadge(execution.state)}
                                        {renderActionButtons(execution)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-xs text-gray-500">
                            No hay ejecuciones pendientes de corrección actualmente.
                        </div>
                    )}
                </div>

                {/* REQUERIMIENTO 1: SECCIÓN 2 - PAUSADAS (EN SEGUNDO LUGAR) */}
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50/60 to-white border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                                <Pause className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                    Ejecuciones Pausadas ({pausedExecutions.length})
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Procedimientos detenidos temporalmente que puedes reanudar en cualquier momento.
                                </p>
                            </div>
                        </div>
                    </div>

                    {pausedExecutions.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {pausedExecutions.map(execution => (
                                <div
                                    key={execution.idExecution}
                                    className="p-4 hover:bg-gray-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setSelectedExecution(execution)}
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-mono font-semibold text-gray-500">#{execution.idExecution}</span>
                                            <h3 className="text-sm font-bold text-gray-900 hover:text-blue-600">
                                                {execution.procedureName}
                                            </h3>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs font-medium text-gray-600">{execution.projectName}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-3">
                                            <span>Avance: <strong>{execution.completedSteps}/{execution.totalSteps}</strong> pasos</span>
                                            <span>•</span>
                                            <span className="truncate max-w-md">{execution.lastProgress}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                                        {renderStateBadge(execution.state)}
                                        {renderActionButtons(execution)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-xs text-gray-500">
                            No tienes ejecuciones pausadas en este momento.
                        </div>
                    )}
                </div>

                {/* REQUERIMIENTO 1: SECCIÓN 3 - VISTA GENERAL CON FILTROS (TODAS, PAUSADAS, PENDIENTES DE EVALUACION, ETC.) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Todas las Ejecuciones</h2>
                            <p className="text-xs text-gray-500">Filtra y visualiza el estado completo del historial de ejecuciones.</p>
                        </div>
                    </div>

                    {/* Pestañas de Filtro por Estado con colores semánticos correspondientes */}
                    <div className="flex flex-wrap gap-2 pb-1">
                        <button
                            onClick={() => setActiveTab('ALL')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'ALL'
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            Todas ({executions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('ACTIVE')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'ACTIVE'
                                ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                                : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                                }`}
                        >
                            Activas ({executions.filter(e => e.state === 'ACTIVE').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('HAS_CORRECTIONS')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'HAS_CORRECTIONS'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                                }`}
                        >
                            Pendientes de Corrección ({correctionExecutions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('PAUSED')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'PAUSED'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                                }`}
                        >
                            Pausadas ({pausedExecutions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('PENDING_EVALUATION')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'PENDING_EVALUATION'
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            Pendientes de Evaluación ({executions.filter(e => e.state === 'PENDING_EVALUATION').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('APPROVED_FINISHED')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'APPROVED_FINISHED'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                        >
                            Aprobadas ({executions.filter(e => e.state === 'APPROVED_FINISHED').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('CANCELLED')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'CANCELLED'
                                ? 'bg-gray-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            Canceladas ({executions.filter(e => e.state === 'CANCELLED').length})
                        </button>
                    </div>

                    {/* Tabla de la Vista Filtrada */}
                    <div className="border border-gray-200 rounded-lg overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">ID / Procedimiento</th>
                                    <th className="px-4 py-3">Proyecto</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3">Progreso</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-xs">
                                {filteredExecutions.map(execution => (
                                    <tr
                                        key={execution.idExecution}
                                        className="hover:bg-gray-50/80 transition cursor-pointer"
                                        onClick={() => setSelectedExecution(execution)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-900 text-sm">#{execution.idExecution} - {execution.procedureName}</div>
                                            <div className="text-[11px] text-gray-400">Iniciado: {execution.startedAt}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 font-medium">{execution.projectName}</td>
                                        <td className="px-4 py-3">{renderStateBadge(execution.state)}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{execution.completedSteps}/{execution.totalSteps} Pasos</div>
                                            <div className="text-gray-400 truncate max-w-xs">{execution.lastProgress}</div>
                                        </td>
                                        {/* Requerimiento 2: Acciones alineadas y con tamaño uniforme */}
                                        <td className="px-4 py-3 text-right">
                                            {renderActionButtons(execution)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredExecutions.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                No se encontraron ejecuciones en este estado.
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL / DETALLE DE EJECUCIÓN */}
                {selectedExecution && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full p-6 space-y-4">
                            <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Detalle de Ejecución #{selectedExecution.idExecution}</h3>
                                    <p className="text-xs text-gray-500">Información registrada en el sistema</p>
                                </div>
                                <button onClick={() => setSelectedExecution(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase font-semibold">Procedimiento</span>
                                    <span className="font-semibold text-gray-900">{selectedExecution.procedureName}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase font-semibold">Proyecto</span>
                                    <span className="font-medium text-gray-800">{selectedExecution.projectName}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-gray-400 block uppercase font-semibold">Desarrollador</span>
                                        <span className="font-medium text-gray-800">{selectedExecution.developerName}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 block uppercase font-semibold mb-1">Estado Actual</span>
                                        {renderStateBadge(selectedExecution.state)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase font-semibold">Fecha de Inicio</span>
                                    <span className="font-medium text-gray-800">{selectedExecution.startedAt}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block uppercase font-semibold">Último Avance Registrado</span>
                                    <p className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 mt-1">
                                        {selectedExecution.lastProgress}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                                {(selectedExecution.state === 'PAUSED' || selectedExecution.state === 'HAS_CORRECTIONS') && (
                                    <button
                                        onClick={() => {
                                            const exec = selectedExecution;
                                            setSelectedExecution(null);
                                            handleResume(exec);
                                        }}
                                        className="h-8 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition"
                                    >
                                        Reanudar Ejecución
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedExecution(null)}
                                    className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN */}
                {cancelCandidate && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-lg font-bold">¿Cancelar Ejecución?</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                ¿Estás seguro de cancelar la ejecución <strong>#{cancelCandidate.idExecution}</strong> ({cancelCandidate.procedureName})?
                                Esta acción cambiará su estado a <strong>Cancelada</strong> y no permitirá nuevas modificaciones.
                            </p>
                            <div className="pt-3 flex justify-end gap-2">
                                <button
                                    onClick={() => setCancelCandidate(null)}
                                    className="h-8 px-3 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    No, mantener
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="h-8 px-3 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition"
                                >
                                    Sí, Cancelar Ejecución
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ExecutionManagementMock;