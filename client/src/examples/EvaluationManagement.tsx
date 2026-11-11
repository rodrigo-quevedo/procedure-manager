import React, { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Filter,
    Search,
    Inbox,
    User,
    Calendar,
    ChevronRight,
    Sparkles,
    RefreshCw
} from 'lucide-react';

// --- Tipos de Datos para la Gestión de Evaluaciones ---
export type EvaluationTabState = 'PENDING' | 'APPROVED' | 'CORRECTIONS_SENT';
export type PendingSubtype = 'NEW' | 'CORRECTIONS_IMPLEMENTED';

export interface EvaluationItem {
    idEvaluation: number;
    idExecution: number;
    procedureTitle: string;
    procedureVersion?: string;
    projectName: string;
    developerName: string;
    developerAvatar?: string;
    status: 'PENDING' | 'APPROVED' | 'CORRECTIONS_SENT';
    pendingSubtype?: PendingSubtype; // Si es PENDING: Nueva o Con correcciones implementadas
    submittedAt: string;
    evaluatedAt?: string;
    totalSteps: number;
    deviationsCount: number;
    correctionsCount?: number;
    summaryNotes?: string;
}

// --- Mocks Iniciales de Evaluaciones ---
const INITIAL_EVALUATIONS: EvaluationItem[] = [
    {
        idEvaluation: 201,
        idExecution: 105,
        procedureTitle: 'Despliegue de Microservicio en Producción (Kubernetes)',
        procedureVersion: 'v2.1',
        projectName: 'Core Banking API',
        developerName: 'Juan Pérez',
        status: 'PENDING',
        pendingSubtype: 'NEW',
        submittedAt: '2026-11-09 10:45',
        totalSteps: 6,
        deviationsCount: 1,
        summaryNotes: 'Ejecución finalizada. Presenta 1 desviación justificada en paso de verificación de ingress.'
    },
    {
        idEvaluation: 202,
        idExecution: 98,
        procedureTitle: 'Aprovisionamiento de Clúster Redis Sentinel',
        procedureVersion: 'v1.4',
        projectName: 'Infraestructura Cloud',
        developerName: 'María Gómez',
        status: 'PENDING',
        pendingSubtype: 'CORRECTIONS_IMPLEMENTED',
        submittedAt: '2026-11-09 09:30',
        totalSteps: 5,
        deviationsCount: 0,
        correctionsCount: 2,
        summaryNotes: 'Correcciones implementadas por el desarrollador según feedback anterior en pasos 2 y 4.'
    },
    {
        idEvaluation: 203,
        idExecution: 104,
        procedureTitle: 'Integración de Bucket Cloudflare R2 y Políticas CORS',
        procedureVersion: 'v1.0',
        projectName: 'Almacenamiento Multimedia',
        developerName: 'Carlos López',
        status: 'PENDING',
        pendingSubtype: 'NEW',
        submittedAt: '2026-11-08 17:10',
        totalSteps: 4,
        deviationsCount: 2,
        summaryNotes: 'Nueva entrega pendiente de revisión inicial por parte del líder.'
    },
    {
        idEvaluation: 204,
        idExecution: 92,
        procedureTitle: 'Rotación de Credenciales de Base de Datos y Secrets',
        procedureVersion: 'v3.0',
        projectName: 'Seguridad y Accesos',
        developerName: 'Ana Rodríguez',
        status: 'PENDING',
        pendingSubtype: 'CORRECTIONS_IMPLEMENTED',
        submittedAt: '2026-11-08 14:00',
        totalSteps: 5,
        deviationsCount: 1,
        correctionsCount: 1,
        summaryNotes: 'El desarrollador adjuntó la captura corregida del hash de verificación de secrets.'
    },
    {
        idEvaluation: 205,
        idExecution: 88,
        procedureTitle: 'Configuración Inicial de Monitoreo con Datadog Agent',
        procedureVersion: 'v1.2',
        projectName: 'Observabilidad',
        developerName: 'Juan Pérez',
        status: 'CORRECTIONS_SENT',
        submittedAt: '2026-11-07 16:20',
        evaluatedAt: '2026-11-07 18:15',
        totalSteps: 7,
        deviationsCount: 0,
        correctionsCount: 3,
        summaryNotes: 'Se solicitaron correcciones en la política de retención de logs y etiquetas de APM.'
    },
    {
        idEvaluation: 206,
        idExecution: 85,
        procedureTitle: 'Migración de Esquema SQLite a PostgreSQL',
        procedureVersion: 'v2.0',
        projectName: 'Plataforma Core',
        developerName: 'Lucas Benítez',
        status: 'CORRECTIONS_SENT',
        submittedAt: '2026-11-06 11:40',
        evaluatedAt: '2026-11-06 15:00',
        totalSteps: 4,
        deviationsCount: 1,
        correctionsCount: 2,
        summaryNotes: 'Falta validar los índices de tablas particionadas previo al switchover.'
    },
    {
        idEvaluation: 207,
        idExecution: 79,
        procedureTitle: 'Renovación y Certificación SSL Wildcard Let\'s Encrypt',
        procedureVersion: 'v2.5',
        projectName: 'Infraestructura Cloud',
        developerName: 'María Gómez',
        status: 'APPROVED',
        submittedAt: '2026-11-05 08:30',
        evaluatedAt: '2026-11-05 10:15',
        totalSteps: 4,
        deviationsCount: 0,
        summaryNotes: 'Aprobado sin observaciones. Todos los registros DNS propagados correctamente.'
    },
    {
        idEvaluation: 208,
        idExecution: 75,
        procedureTitle: 'Hardening de Contenedores Docker en Base Alpine',
        procedureVersion: 'v1.1',
        projectName: 'Seguridad y Accesos',
        developerName: 'Carlos López',
        status: 'APPROVED',
        submittedAt: '2026-11-04 12:10',
        evaluatedAt: '2026-11-04 17:30',
        totalSteps: 6,
        deviationsCount: 1,
        correctionsCount: 1,
        summaryNotes: 'Aprobado satisfactoriamente tras resolución de correcciones del análisis Trivy.'
    }
];

export const EvaluationManagement: React.FC = () => {
    // Por defecto mostramos la lista de evaluaciones "Pendientes" (Criterio de Aceptación 1)
    const [selectedTab, setSelectedTab] = useState<EvaluationTabState>('PENDING');
    const [pendingSubfilter, setPendingSubfilter] = useState<'ALL' | PendingSubtype>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [evaluations] = useState<EvaluationItem[]>(INITIAL_EVALUATIONS);

    // Conteo por cada estado principal
    const pendingTotal = evaluations.filter(e => e.status === 'PENDING').length;
    const pendingNewCount = evaluations.filter(e => e.status === 'PENDING' && e.pendingSubtype === 'NEW').length;
    const pendingWithCorrectionsCount = evaluations.filter(
        e => e.status === 'PENDING' && e.pendingSubtype === 'CORRECTIONS_IMPLEMENTED'
    ).length;
    const approvedTotal = evaluations.filter(e => e.status === 'APPROVED').length;
    const correctionsSentTotal = evaluations.filter(e => e.status === 'CORRECTIONS_SENT').length;

    // Filtrado de evaluaciones según la pestaña activa y búsqueda opcional
    const currentList = evaluations.filter(item => {
        if (item.status !== selectedTab) return false;

        // Subfiltro específico de Pendientes (Nuevas vs Con correcciones implementadas)
        if (selectedTab === 'PENDING' && pendingSubfilter !== 'ALL') {
            if (item.pendingSubtype !== pendingSubfilter) return false;
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const matchesTitle = item.procedureTitle.toLowerCase().includes(query);
            const matchesProject = item.projectName.toLowerCase().includes(query);
            const matchesDev = item.developerName.toLowerCase().includes(query);
            const matchesId = item.idExecution.toString().includes(query) || item.idEvaluation.toString().includes(query);
            return matchesTitle || matchesProject || matchesDev || matchesId;
        }

        return true;
    });

    // Sublistas para visualización agrupada cuando está en la pestaña "Pendientes"
    const pendingNewList = currentList.filter(e => e.pendingSubtype === 'NEW');
    const pendingCorrectedList = currentList.filter(e => e.pendingSubtype === 'CORRECTIONS_IMPLEMENTED');

    // Badge visual de estado con Rojo como color principal para lo pendiente/nuevo
    const renderStatusBadge = (item: EvaluationItem) => {
        switch (item.status) {
            case 'PENDING':
                if (item.pendingSubtype === 'CORRECTIONS_IMPLEMENTED') {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-purple-200">
                            <RefreshCw className="w-3 h-3 text-red-600" />
                            Correcciones Implementadas
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <Sparkles className="w-3 h-3 text-red-600" />
                        Nueva Ejecución
                    </span>
                );
            case 'CORRECTIONS_SENT':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Correcciones Enviadas
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Aprobada
                    </span>
                );
        }
    };

    // Render de tarjeta de evaluación en la lista
    const renderEvaluationCard = (item: EvaluationItem) => {
        return (
            <div
                key={item.idEvaluation}
                className="group p-4 bg-white hover:bg-slate-50/80 transition-all border border-gray-200 hover:border-red-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => {
                    console.log('Navegar a Detalle de Evaluación:', item.idEvaluation);
                }}
            >
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Eval #{item.idEvaluation}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                            (Ejecución #{item.idExecution})
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {item.procedureTitle}
                        </h3>
                        {item.procedureVersion && (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {item.procedureVersion}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            {item.projectName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {item.developerName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {item.status === 'PENDING' ? `Enviado: ${item.submittedAt}` : `Evaluado: ${item.evaluatedAt || item.submittedAt}`}
                        </span>
                        <span>•</span>
                        <span>{item.totalSteps} pasos</span>
                    </div>

                    {/* Resumen / Notas y Metadatos de Desviaciones */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {item.deviationsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                ⚠ {item.deviationsCount} desviación{item.deviationsCount > 1 ? 'es' : ''}
                            </span>
                        )}
                        {item.correctionsCount !== undefined && item.correctionsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                ✎ {item.correctionsCount} corrección{item.correctionsCount > 1 ? 'es' : ''}
                            </span>
                        )}
                        {item.summaryNotes && (
                            <p className="text-xs text-gray-600 italic truncate max-w-xl">
                                "{item.summaryNotes}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Estado y Acción */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div>{renderStatusBadge(item)}</div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('Ver detalle de evaluación:', item.idEvaluation);
                        }}
                        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-900 border border-red-200 rounded-lg transition-colors"
                        title="Ver Detalle de Evaluación"
                    >
                        <Eye className="w-3.5 h-3.5 text-red-600" />
                        <span>Ver Detalle</span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Encabezado Principal */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded">
                                Rol: Líder Técnico
                            </span>
                            <span className="text-xs text-gray-400 font-mono">HU-012</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Evaluaciones</h1>
                        <p className="text-sm text-gray-500">
                            Supervisa y gestiona las revisiones de ejecuciones enviadas por los desarrolladores.
                        </p>
                    </div>

                    {/* Resumen numérico de estados con Rojo como principal */}
                    <div className="flex items-center gap-2">
                        <div className="px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl text-center">
                            <span className="block text-xs font-medium text-red-700">Pendientes</span>
                            <span className="text-lg font-black text-red-900 leading-none">{pendingTotal}</span>
                        </div>
                        <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                            <span className="block text-xs font-medium text-emerald-700">Aprobadas</span>
                            <span className="text-lg font-black text-emerald-900 leading-none">{approvedTotal}</span>
                        </div>
                        <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-center">
                            <span className="block text-xs font-medium text-rose-700">Correcciones</span>
                            <span className="text-lg font-black text-rose-900 leading-none">{correctionsSentTotal}</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Control: Pestañas de Estado y Buscador */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Pestañas de Estados: Pendientes (defecto con Rojo), Aprobadas, Correcciones Enviadas */}
                        <div className="inline-flex p-1 bg-gray-100/90 rounded-xl border border-gray-200 text-xs font-semibold">
                            <button
                                onClick={() => {
                                    setSelectedTab('PENDING');
                                    setPendingSubfilter('ALL');
                                }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'PENDING'
                                    ? 'bg-red-600 text-white shadow-xs font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Clock className={`w-3.5 h-3.5 ${selectedTab === 'PENDING' ? 'text-white' : 'text-red-600'}`} />
                                <span>Pendientes</span>
                                <span className={`px-2 py-0.2 rounded-full text-[11px] ${selectedTab === 'PENDING'
                                    ? 'bg-red-700 text-white font-bold'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {pendingTotal}
                                </span>
                            </button>

                            <button
                                onClick={() => setSelectedTab('APPROVED')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'APPROVED'
                                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Aprobadas</span>
                                <span className={`px-2 py-0.2 rounded-full text-[11px] ${selectedTab === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {approvedTotal}
                                </span>
                            </button>

                            <button
                                onClick={() => setSelectedTab('CORRECTIONS_SENT')}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedTab === 'CORRECTIONS_SENT'
                                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Correcciones Enviadas</span>
                                <span className={`px-2 py-0.2 rounded-full text-[11px] ${selectedTab === 'CORRECTIONS_SENT'
                                    ? 'bg-rose-100 text-rose-800 font-bold'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {correctionsSentTotal}
                                </span>
                            </button>
                        </div>

                        {/* Buscador Rápido */}
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar procedimiento, dev o proyecto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Subfiltros para PENDIENTES con Rojo como protagonista */}
                    {selectedTab === 'PENDING' && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Filter className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium text-gray-700">Filtrar lista de Pendientes:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    onClick={() => setPendingSubfilter('ALL')}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${pendingSubfilter === 'ALL'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Todas ({pendingTotal})
                                </button>
                                <button
                                    onClick={() => setPendingSubfilter('NEW')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${pendingSubfilter === 'NEW'
                                        ? 'bg-red-700 text-white shadow-xs'
                                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                        }`}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Nuevas ({pendingNewCount})
                                </button>
                                <button
                                    onClick={() => setPendingSubfilter('CORRECTIONS_IMPLEMENTED')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${pendingSubfilter === 'CORRECTIONS_IMPLEMENTED'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                                        }`}
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Con Correcciones Implementadas ({pendingWithCorrectionsCount})
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENIDO PRINCIPAL: LISTA SEGÚN ESTADO SELECCIONADO */}

                {/* CASO: LISTA VACÍA (Criterio de Aceptación 3) */}
                {currentList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                            <Inbox className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">
                            No se encontraron evaluaciones
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {searchQuery
                                ? `No se encontraron resultados para "${searchQuery}". Prueba ajustando los términos de búsqueda.`
                                : selectedTab === 'PENDING'
                                    ? 'No hay evaluaciones pendientes en este momento. Todas las entregas han sido evaluadas.'
                                    : selectedTab === 'APPROVED'
                                        ? 'No hay procedimientos evaluados en estado Aprobado.'
                                        : 'No hay evaluaciones con correcciones enviadas pendientes de ser resueltas.'
                            }
                        </p>
                    </div>
                ) : (
                    /* CASO: LISTA CON ELEMENTOS */
                    <div className="space-y-6">

                        {/* Si estamos en PENDIENTES y no se eligió un subfiltro específico, mostramos secciones diferenciadas */}
                        {selectedTab === 'PENDING' && pendingSubfilter === 'ALL' ? (
                            <>
                                {/* Sección: Con Correcciones Implementadas */}
                                {pendingCorrectedList.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                                                    <RefreshCw className="w-4 h-4" />
                                                </span>
                                                <div>
                                                    <h2 className="text-sm font-bold text-gray-900">
                                                        Con Correcciones Implementadas ({pendingCorrectedList.length})
                                                    </h2>
                                                    <p className="text-xs text-gray-500">
                                                        Ejecuciones observadas anteriormente donde el desarrollador ya aplicó las correcciones solicitadas.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {pendingCorrectedList.map(renderEvaluationCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Sección: Nuevas Ejecuciones Pendientes */}
                                {pendingNewList.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
                                                    <Sparkles className="w-4 h-4" />
                                                </span>
                                                <div>
                                                    <h2 className="text-sm font-bold text-gray-900">
                                                        Nuevas Ejecuciones ({pendingNewList.length})
                                                    </h2>
                                                    <p className="text-xs text-gray-500">
                                                        Procedimientos completados por primera vez que esperan tu evaluación inicial.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {pendingNewList.map(renderEvaluationCard)}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Vista unificada directa para Aprobadas, Correcciones Enviadas o subfiltro específico */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between pb-1">
                                    <h2 className="text-sm font-bold text-gray-900">
                                        {selectedTab === 'APPROVED' && `Evaluaciones Aprobadas (${currentList.length})`}
                                        {selectedTab === 'CORRECTIONS_SENT' && `Evaluaciones con Correcciones Enviadas (${currentList.length})`}
                                        {selectedTab === 'PENDING' && pendingSubfilter === 'NEW' && `Nuevas Ejecuciones Pendientes (${currentList.length})`}
                                        {selectedTab === 'PENDING' && pendingSubfilter === 'CORRECTIONS_IMPLEMENTED' && `Con Correcciones Implementadas (${currentList.length})`}
                                    </h2>
                                    <span className="text-xs text-gray-500 font-medium">
                                        Mostrando {currentList.length} registro{currentList.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {currentList.map(renderEvaluationCard)}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
};

export default EvaluationManagement;