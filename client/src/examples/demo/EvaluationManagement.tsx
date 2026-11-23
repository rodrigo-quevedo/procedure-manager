import React, { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Inbox,
    User,
    Calendar,
    ChevronRight,
    Sparkles,
    RefreshCw,
    ArrowLeft,
    CheckSquare,
    MessageSquare,
    Send,
    FolderKanban,
    Tags,
    FileText,
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

// ─────────────────────────────────────────────────────────────────
// Datos hardcodeados: Aprovisionamiento de Clúster Redis Sentinel
// ─────────────────────────────────────────────────────────────────

interface HardcodedField {
    id: number;
    label: string;
    fieldType: 'TEXT' | 'IMAGE';
    // Valor ingresado por el desarrollador (versión actual)
    value: string;
    // Si existe, este input tiene una corrección pendiente (en rojo)
    correction?: {
        // Texto de la corrección anterior enviada por el líder
        message: string;
        // Valor anterior (pre-corrección) a mostrar como "versión anterior"
        previousValue: string;
    };
}

interface HardcodedSection {
    id: number;
    name: string;
    description: string;
    fields: HardcodedField[];
}

interface HardcodedStep {
    id: number;
    name: string;
    description: string;
    isCompleted: boolean;
    sections: HardcodedSection[];
}

const REDIS_STEPS: HardcodedStep[] = [
    {
        id: 1,
        name: 'Preparación del entorno y dependencias',
        description: 'Verificar nodos disponibles, versión de Redis y configuración de red requerida.',
        isCompleted: true,
        sections: [
            {
                id: 101,
                name: 'Verificación de nodos',
                description: 'Confirmar que los 3 nodos están disponibles y sin workloads activos.',
                fields: [
                    {
                        id: 1001,
                        label: 'Resultado del comando de verificación de nodos',
                        fieldType: 'TEXT',
                        value: 'node-01: OK\nnode-02: OK\nnode-03: OK\nAll nodes reachable via private network 10.0.1.0/24',
                    },
                    {
                        id: 1002,
                        label: 'Versión de Redis instalada',
                        fieldType: 'TEXT',
                        value: 'Redis 7.2.4 (stable)',
                    },
                ],
            },
            {
                id: 102,
                name: 'Configuración de red',
                description: 'Registrar la configuración de puertos y firewall aplicada.',
                fields: [
                    {
                        id: 1003,
                        label: 'Reglas de firewall aplicadas',
                        fieldType: 'TEXT',
                        value: 'Puerto 6379 (Redis): abierto entre nodos\nPuerto 26379 (Sentinel): abierto entre nodos\nBloqueo de acceso externo confirmado',
                        correction: {
                            previousValue: 'Puerto 6379 abierto\nPuerto 26379 abierto',
                            message: 'Falta especificar si el acceso externo está bloqueado. Incluir regla de denegación explícita y confirmar que el puerto 26379 está restringido al VLAN interno.',
                        },
                    },
                ],
            },
        ],
    },
    {
        id: 2,
        name: 'Configuración de nodos Redis maestro y réplicas',
        description: 'Aplicar archivos redis.conf a cada nodo según su rol (master/replica).',
        isCompleted: true,
        sections: [
            {
                id: 201,
                name: 'Configuración del nodo maestro',
                description: 'Registrar la configuración aplicada al nodo maestro.',
                fields: [
                    {
                        id: 2001,
                        label: 'Parámetros clave aplicados en redis.conf (maestro)',
                        fieldType: 'TEXT',
                        value: 'bind 10.0.1.11\nport 6379\nmaxmemory 4gb\nmaxmemory-policy allkeys-lru\nsave 900 1\nsave 300 10',
                    },
                ],
            },
            {
                id: 202,
                name: 'Configuración de réplicas',
                description: 'Registrar la configuración de cada nodo réplica.',
                fields: [
                    {
                        id: 2002,
                        label: 'Configuración réplica node-02',
                        fieldType: 'TEXT',
                        value: 'replicaof 10.0.1.11 6379\nbind 10.0.1.12\nreplica-read-only yes',
                        correction: {
                            previousValue: 'replicaof 10.0.1.11 6379\nbind 10.0.1.12',
                            message: 'Falta la directiva replica-read-only. Las réplicas deben tener acceso de solo lectura para evitar escrituras accidentales durante el failover.',
                        },
                    },
                    {
                        id: 2003,
                        label: 'Configuración réplica node-03',
                        fieldType: 'TEXT',
                        value: 'replicaof 10.0.1.11 6379\nbind 10.0.1.13\nreplica-read-only yes',
                    },
                ],
            },
        ],
    },
    {
        id: 3,
        name: 'Configuración de Sentinel',
        description: 'Configurar y levantar el proceso sentinel en los 3 nodos.',
        isCompleted: true,
        sections: [
            {
                id: 301,
                name: 'Archivo sentinel.conf',
                description: 'Registrar la configuración de Sentinel aplicada.',
                fields: [
                    {
                        id: 3001,
                        label: 'Parámetros sentinel.conf (todos los nodos)',
                        fieldType: 'TEXT',
                        value: 'sentinel monitor mymaster 10.0.1.11 6379 2\nsentinel down-after-milliseconds mymaster 5000\nsentinel failover-timeout mymaster 60000\nsentinel parallel-syncs mymaster 1',
                    },
                    {
                        id: 3002,
                        label: 'Estado de procesos Sentinel tras levantar',
                        fieldType: 'TEXT',
                        value: 'node-01 sentinel: running (PID 4821)\nnode-02 sentinel: running (PID 4903)\nnode-03 sentinel: running (PID 4977)',
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        name: 'Prueba de failover y validación',
        description: 'Simular falla del maestro y verificar promoción automática de réplica.',
        isCompleted: true,
        sections: [
            {
                id: 401,
                name: 'Prueba de failover',
                description: 'Registrar evidencia del failover exitoso.',
                fields: [
                    {
                        id: 4001,
                        label: 'Log de failover de Sentinel',
                        fieldType: 'TEXT',
                        value: '+odown master mymaster 10.0.1.11 6379 #quorum 2/2\n+failover-state-select-slave master mymaster 10.0.1.11 6379\n+selected-slave slave 10.0.1.12:6379\n+promoted-slave slave 10.0.1.12:6379\n+failover-end master mymaster 10.0.1.12 6379',
                    },
                    {
                        id: 4002,
                        label: 'Tiempo de recuperación (RTO medido)',
                        fieldType: 'TEXT',
                        value: 'Failover completado en 8.3 segundos. Dentro del umbral aceptable (< 15s).',
                        correction: {
                            previousValue: 'Failover completado en aproximadamente 10 segundos.',
                            message: 'El tiempo reportado debe incluir la medición exacta en segundos con dos decimales, y confirmar explícitamente si está dentro del umbral definido en la política de RTO del proyecto.',
                        },
                    },
                ],
            },
        ],
    },
    {
        id: 5,
        name: 'Documentación y cierre',
        description: 'Registrar IPs finales del clúster, contraseña de acceso y validación de conectividad desde la aplicación.',
        isCompleted: true,
        sections: [
            {
                id: 501,
                name: 'Resumen del clúster',
                description: 'Datos finales del clúster para su registro en la wiki del proyecto.',
                fields: [
                    {
                        id: 5001,
                        label: 'IPs y roles finales del clúster',
                        fieldType: 'TEXT',
                        value: 'Maestro activo: 10.0.1.12 (fue réplica, promovido)\nRéplica 1: 10.0.1.11 (nodo original, re-integrado como réplica)\nRéplica 2: 10.0.1.13\nSentinel en: 10.0.1.11, 10.0.1.12, 10.0.1.13',
                    },
                    {
                        id: 5002,
                        label: 'Validación de conectividad desde la aplicación',
                        fieldType: 'TEXT',
                        value: 'Test de conexión desde backend: OK\nLatencia promedio: 1.2ms\nConexión a través de Sentinel discovery: confirmado',
                    },
                ],
            },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────
// Componente: Vista de Detalle de Evaluación (read-only + correcciones)
// ─────────────────────────────────────────────────────────────────

interface EvaluationDetailViewProps {
    onBack: () => void;
}

const EvaluationDetailView: React.FC<EvaluationDetailViewProps> = ({ onBack }) => {
    const [selectedStepId, setSelectedStepId] = useState<number>(REDIS_STEPS[0].id);
    // Mapa de texto de nueva corrección por fieldId (cuando el líder hace click en "Corregir")
    const [correctionDraft, setCorrectionDraft] = useState<Record<number, string>>({});
    // Track which fields have the correction box open
    const [correctionOpen, setCorrectionOpen] = useState<Record<number, boolean>>({});
    // Track sent corrections (simulated)
    const [correctionSent, setCorrectionSent] = useState<Record<number, string>>({});

    const selectedStep = REDIS_STEPS.find((s) => s.id === selectedStepId) || REDIS_STEPS[0];
    const stepIndex = REDIS_STEPS.findIndex((s) => s.id === selectedStepId);

    const handleOpenCorrection = (fieldId: number) => {
        setCorrectionOpen((prev) => ({ ...prev, [fieldId]: true }));
        setCorrectionDraft((prev) => ({ ...prev, [fieldId]: '' }));
    };

    const handleSendCorrection = (fieldId: number) => {
        const text = (correctionDraft[fieldId] || '').trim();
        if (!text) return;
        setCorrectionSent((prev) => ({ ...prev, [fieldId]: text }));
        setCorrectionOpen((prev) => ({ ...prev, [fieldId]: false }));
    };

    const renderField = (field: HardcodedField) => {
        const hasCorrection = !!field.correction;
        const isSent = !!correctionSent[field.id];
        const isOpen = !!correctionOpen[field.id];

        return (
            <div
                key={field.id}
                className={`rounded-xl border p-4 space-y-3 ${hasCorrection
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-gray-200 bg-white'
                    }`}
            >
                {/* Label con badge "Ejecución" */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">{field.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${hasCorrection
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                        Ejecución
                    </span>
                </div>

                {/* Si hay corrección: mostrar versión anterior */}
                {hasCorrection && field.correction && (
                    <div className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Versión anterior (antes de corrección)
                        </p>
                        <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono leading-relaxed">
                            {field.correction.previousValue}
                        </pre>
                    </div>
                )}

                {/* Valor actual (ingresado por el desarrollador) */}
                <div className={`rounded-lg px-3 py-2.5 ${hasCorrection
                    ? 'bg-white border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                    }`}>
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                        {field.value}
                    </pre>
                </div>

                {/* Corrección del líder (en negro, como sugerencia) */}
                {hasCorrection && field.correction && (
                    <div className="rounded-lg border border-gray-900/20 bg-gray-900/5 px-3 py-2.5 flex gap-2 items-start">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-700 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Corrección enviada anteriormente
                            </p>
                            <p className="text-xs text-gray-800 leading-relaxed">
                                {field.correction.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* Corrección nueva enviada por el líder en esta revisión */}
                {isSent && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex gap-2 items-start">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                Nueva corrección enviada
                            </p>
                            <p className="text-xs text-emerald-800 mt-0.5">{correctionSent[field.id]}</p>
                        </div>
                    </div>
                )}

                {/* Botón "Corregir" solo en inputs rojos y si no fue enviada ya */}
                {hasCorrection && !isSent && (
                    <div className="pt-1">
                        {!isOpen ? (
                            <button
                                type="button"
                                onClick={() => handleOpenCorrection(field.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Corregir
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700">
                                    Nueva sugerencia de corrección:
                                </label>
                                <textarea
                                    value={correctionDraft[field.id] || ''}
                                    onChange={(e) =>
                                        setCorrectionDraft((prev) => ({ ...prev, [field.id]: e.target.value }))
                                    }
                                    rows={3}
                                    placeholder="Escribí la nueva corrección o sugerencia para el desarrollador..."
                                    className="w-full text-xs border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSendCorrection(field.id)}
                                        disabled={!(correctionDraft[field.id] || '').trim()}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-3 h-3" />
                                        Enviar corrección
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCorrectionOpen((prev) => ({ ...prev, [field.id]: false }))}
                                        className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-gray-200 bg-gray-50 p-4 flex flex-col justify-between overflow-y-auto shrink-0">
                <div>
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-sm font-bold text-red-600 tracking-wide bg-red-50 border border-red-200 px-3 py-1 rounded-md shadow-xs">
                            Revisión de Ejecución
                        </span>
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-xs text-gray-500 hover:text-red-600 cursor-pointer flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Volver
                        </button>
                    </div>

                    {/* Step Navigation */}
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                            Pasos del procedimiento
                        </p>
                        <div className="space-y-1">
                            {REDIS_STEPS.map((step, idx) => {
                                const isSelected = step.id === selectedStepId;
                                // ¿Tiene algún campo con corrección?
                                const hasCorrections = step.sections.some((sec) =>
                                    sec.fields.some((f) => !!f.correction)
                                );
                                return (
                                    <button
                                        key={step.id}
                                        type="button"
                                        onClick={() => setSelectedStepId(step.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${isSelected
                                            ? 'bg-red-50 border border-red-200 shadow-xs'
                                            : 'hover:bg-gray-100 border border-transparent'
                                            }`}
                                    >
                                        <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className={`flex-1 text-xs font-medium leading-snug ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                                            {step.name}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {hasCorrections && (
                                                <span title="Tiene correcciones">
                                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                </span>
                                            )}
                                            {step.isCompleted && (
                                                <span title="Paso completado">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-4 mt-6">
                        {/* Proyecto */}
                        <div>
                            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                                Proyecto
                            </label>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
                                <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                                <span>Infraestructura Cloud</span>
                            </div>
                        </div>
                        {/* Categorías */}
                        <div>
                            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                                Categorías
                            </label>
                            <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg border border-gray-200">
                                {['Redis', 'HA', 'Cloud'].map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100">
                                        <Tags className="w-2.5 h-2.5 text-red-500" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Nombre */}
                        <div>
                            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                                Nombre
                            </label>
                            <p className="text-xs font-semibold text-gray-800 leading-snug bg-white p-2 rounded-lg border border-gray-200">
                                Aprovisionamiento de Clúster Redis Sentinel
                            </p>
                        </div>
                        {/* Desarrollador */}
                        <div>
                            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                                Desarrollador
                            </label>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 bg-white p-2 rounded-lg border border-gray-200">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>María Gómez</span>
                            </div>
                        </div>
                        {/* Stats de correcciones */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resumen</p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Pasos completados
                                </span>
                                <span className="font-bold text-gray-900">5 / 5</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Correcciones
                                </span>
                                <span className="font-bold text-red-600">3</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1 text-gray-500">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" /> Inputs registrados
                                </span>
                                <span className="font-bold text-gray-900">10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción al final del Sidebar */}
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-2.5">
                    <button
                        type="button"
                        className="w-full py-2.5 px-4 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="w-full py-2.5 px-4 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                        Enviar
                    </button>
                    <button
                        type="button"
                        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                        Aprobar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-white">
                {/* Step header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Paso {stepIndex + 1} de {REDIS_STEPS.length}
                        </span>
                        {selectedStep.isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Completado
                            </span>
                        )}
                        {selectedStep.sections.some((sec) => sec.fields.some((f) => !!f.correction)) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Tiene correcciones
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedStep.name}</h2>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{selectedStep.description}</p>
                </div>

                {/* Sections + Fields */}
                <div className="space-y-8">
                    {selectedStep.sections.map((section) => (
                        <div key={section.id} className="space-y-4">
                            {/* Section header */}
                            <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                                <div className="pt-0.5 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{section.name}</h3>
                                    {section.description && (
                                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{section.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4 pl-5">
                                {section.fields.map(renderField)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer navigation */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        type="button"
                        disabled={stepIndex === 0}
                        onClick={() => setSelectedStepId(REDIS_STEPS[stepIndex - 1].id)}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Paso anterior
                    </button>
                    <button
                        type="button"
                        disabled={stepIndex === REDIS_STEPS.length - 1}
                        onClick={() => setSelectedStepId(REDIS_STEPS[stepIndex + 1].id)}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                        Paso siguiente
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </main>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────

export const EvaluationManagement: React.FC = () => {
    // Por defecto mostramos la lista de evaluaciones "Pendientes" (Criterio de Aceptación 1)
    const [selectedTab, setSelectedTab] = useState<EvaluationTabState>('PENDING');
    const [pendingSubfilter, setPendingSubfilter] = useState<'ALL' | PendingSubtype>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [evaluations] = useState<EvaluationItem[]>(INITIAL_EVALUATIONS);
    // Detalle de evaluación abierto
    const [openDetailId, setOpenDetailId] = useState<number | null>(null);

    // Si hay un detalle abierto (y es el de Redis Sentinel = idEvaluation 202), mostrar la vista
    if (openDetailId === 202) {
        return <EvaluationDetailView onBack={() => setOpenDetailId(null)} />;
    }

    // Conteo por cada estado principal
    const pendingTotal = evaluations.filter(e => e.status === 'PENDING').length;
    const pendingNewCount = evaluations.filter(e => e.status === 'PENDING' && e.pendingSubtype === 'NEW').length;
    const pendingWithCorrectionsCount = evaluations.filter(e => e.status === 'PENDING' && e.pendingSubtype === 'CORRECTIONS_IMPLEMENTED').length;
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
                    setOpenDetailId(item.idEvaluation);
                }}
            >
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {item.procedureTitle}
                        </h3>

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

                    </div>
                </div>

                {/* Estado y Acción */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div>{renderStatusBadge(item)}</div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDetailId(item.idEvaluation);
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
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Evaluaciones</h1>
                        <p className="text-sm text-gray-500">
                            Supervisa y gestiona las revisiones de ejecuciones enviadas por los desarrolladores.
                        </p>
                    </div>


                </div>

                {/* Barra de Control: Pestañas de Estado y Buscador */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Pestañas de Estados: Pendientes (defecto con Rojo), Aprobadas, Correcciones Enviadas */}
                        <div className="inline-flex p-1 bg-gray-100/90 rounded-xl border border-gray-200 text-xs font-semibold">                            <button
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


                    </div>

                    {/* Subfiltros para PENDIENTES con Rojo como protagonista */}
                    {/* Buscador */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por procedimiento, proyecto o desarrollador..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                    </div>
                    {/* Subfiltros para Pendientes */}
                    {selectedTab === 'PENDING' && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-medium">Filtrar:</span>
                            {(['ALL', 'NEW', 'CORRECTIONS_IMPLEMENTED'] as const).map((sf) => {
                                const count = sf === 'ALL' ? pendingTotal : sf === 'NEW' ? pendingNewCount : pendingWithCorrectionsCount;
                                const label = sf === 'ALL' ? 'Todas' : sf === 'NEW' ? 'Nuevas' : 'Con correcciones';
                                return (
                                    <button
                                        key={sf}
                                        type="button"
                                        onClick={() => setPendingSubfilter(sf)}
                                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${pendingSubfilter === sf
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
                                            }`}
                                    >
                                        {label}
                                        <span className={`text-[10px] px-1.5 py-0 rounded-full font-bold ${pendingSubfilter === sf ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
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