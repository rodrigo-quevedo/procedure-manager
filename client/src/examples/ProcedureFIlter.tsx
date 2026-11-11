import React, { useState, useMemo } from 'react';

interface ProcedureStep {
    id: string;
    label: string;
    level: 'basico' | 'intermedio' | 'avanzado';
}

interface Procedure {
    id: string;
    title: string;
    category: string;
    description: string;
    steps: ProcedureStep[];
    usageCount: number;
    successRate: number;
    avgDurationMin: number;
    lastUsed: string;
    author: string;
}

const INITIAL_PROCEDURES: Procedure[] = [
    {
        id: 'proc-1',
        title: 'Despliegue de Microservicios con Docker y Kubernetes',
        category: 'DevOps',
        description: 'Procedimiento seguro para empaquetar contenedores, verificar manifiestos y desplegar en clúster staging sin downtime.',
        author: 'Martín Quevedo',
        usageCount: 142,
        successRate: 98.5,
        avgDurationMin: 18,
        lastUsed: 'Hace 2 horas',
        steps: [
            { id: '1-1', label: 'Validar Dockerfile y escaneo de vulnerabilidades con Trivy', level: 'basico' },
            { id: '1-2', label: 'Compilar imagen taggeada y subir a Artifact Registry', level: 'intermedio' },
            { id: '1-3', label: 'Aplicar K8s manifests y monitorear rollout status', level: 'avanzado' },
            { id: '1-4', label: 'Comprobar endpoints de health check (liveness/readiness)', level: 'basico' }
        ]
    },
    {
        id: 'proc-2',
        title: 'Migración y Rollback de Base de Datos PostgreSQL',
        category: 'Backend',
        description: 'Ejecución controlada de scripts Flyway/Liquibase con punto de restauración y validación de integridad referencial.',
        author: 'Valeria Rivas',
        usageCount: 89,
        successRate: 94.2,
        avgDurationMin: 35,
        lastUsed: 'Ayer',
        steps: [
            { id: '2-1', label: 'Tomar snapshot previo y backup rápido en S3', level: 'basico' },
            { id: '2-2', label: 'Adquirir lock de mantenimiento y correr migración schema', level: 'intermedio' },
            { id: '2-3', label: 'Validar índices, constraints y rendimiento de queries clave', level: 'avanzado' },
            { id: '2-4', label: 'Liberar locks y confirmar métricas de latencia de BD', level: 'basico' }
        ]
    },
    {
        id: 'proc-3',
        title: 'Pruebas End-to-End Automatizadas con Playwright',
        category: 'Testing',
        description: 'Batería de pruebas funcionales para flujos críticos de checkout, login y onboarding en entornos pre-productivos.',
        author: 'Tomás Gómez',
        usageCount: 230,
        successRate: 99.1,
        avgDurationMin: 12,
        lastUsed: 'Hace 30 min',
        steps: [
            { id: '3-1', label: 'Preparar fixtures con usuarios sintéticos limpios', level: 'basico' },
            { id: '3-2', label: 'Ejecutar suite paralela y capturar screenshots/trazas', level: 'intermedio' },
            { id: '3-3', label: 'Verificar tests de regresión visual y responsive', level: 'intermedio' },
            { id: '3-4', label: 'Publicar reporte de cobertura y alertar en canal Slack', level: 'basico' }
        ]
    },
    {
        id: 'proc-4',
        title: 'Auditoría y Rotación de Secretos y API Keys',
        category: 'Seguridad',
        description: 'Protocolo periódico para revocar credenciales antiguas, renovar llaves en HashiCorp Vault y sincronizar servicios.',
        author: 'Carolina Méndez',
        usageCount: 45,
        successRate: 100,
        avgDurationMin: 25,
        lastUsed: 'Hace 3 días',
        steps: [
            { id: '4-1', label: 'Identificar claves con antigüedad mayor a 90 días', level: 'basico' },
            { id: '4-2', label: 'Generar nuevos tokens y actualizar variables en Vault', level: 'intermedio' },
            { id: '4-3', label: 'Reiniciar pods dependientes mediante zero-downtime restart', level: 'avanzado' },
            { id: '4-4', label: 'Revocar claves previas y verificar logs de acceso no autorizado', level: 'avanzado' }
        ]
    },
    {
        id: 'proc-5',
        title: 'Optimización de Assets Web y Lighthouse Score',
        category: 'Frontend',
        description: 'Compresión WebP/AVIF, lazy loading de componentes y refinamiento de Core Web Vitals en la aplicación cliente.',
        author: 'Esteban Paz',
        usageCount: 67,
        successRate: 96.0,
        avgDurationMin: 22,
        lastUsed: 'Hace 5 horas',
        steps: [
            { id: '5-1', label: 'Ejecutar bundle analyzer para detectar dependencias pesadas', level: 'basico' },
            { id: '5-2', label: 'Convertir imágenes estáticas a formatos modernos y CDN', level: 'basico' },
            { id: '5-3', label: 'Implementar code-splitting dinámico en rutas secundarias', level: 'intermedio' },
            { id: '5-4', label: 'Auditar Core Web Vitals (LCP, FID, CLS) con Lighthouse CI', level: 'avanzado' }
        ]
    },
    {
        id: 'proc-6',
        title: 'Gestión y Resolución de Incidencias Críticas (Sev-1)',
        category: 'Soporte',
        description: 'Guía de contingencia para contención rápida de caídas de servicio, comunicación a stakeholders y post-mortem.',
        author: 'Laura Fernández',
        usageCount: 31,
        successRate: 91.5,
        avgDurationMin: 48,
        lastUsed: 'Hace 1 semana',
        steps: [
            { id: '6-1', label: 'Abrir war-room virtual y designar Incident Commander', level: 'basico' },
            { id: '6-2', label: 'Revisar dashboards de Grafana y trazas en OpenTelemetry', level: 'intermedio' },
            { id: '6-3', label: 'Aplicar mitigación temporal (circuit breaker o bypass de cache)', level: 'avanzado' },
            { id: '6-4', label: 'Redactar informe preliminar y calendarizar sesión post-mortem', level: 'basico' }
        ]
    },
    {
        id: 'proc-7',
        title: 'Configuración y Aislamiento de Red VPC en AWS',
        category: 'Cloud',
        description: 'Creación de subnets públicas/privadas, NAT Gateways redundantes y reglas estrictas de Security Groups.',
        author: 'Diego Navarro',
        usageCount: 53,
        successRate: 97.8,
        avgDurationMin: 40,
        lastUsed: 'Hace 4 días',
        steps: [
            { id: '7-1', label: 'Definir bloques CIDR y partición de subnets multizona', level: 'basico' },
            { id: '7-2', label: 'Provisionar Internet Gateway y NAT Gateways con Terraform', level: 'intermedio' },
            { id: '7-3', label: 'Configurar Route Tables y Network ACLs perimetrales', level: 'avanzado' },
            { id: '7-4', label: 'Verificar conectividad cruzada y logs en AWS VPC Flow', level: 'avanzado' }
        ]
    },
    {
        id: 'proc-8',
        title: 'Onboarding de Nuevo Desarrollador al Repositorio Monorepo',
        category: 'Gobernanza',
        description: 'Pasos iniciales para clonado seguro, configuración de variables locales, hooks de Git y primera PR de prueba.',
        author: 'Martín Quevedo',
        usageCount: 115,
        successRate: 100,
        avgDurationMin: 15,
        lastUsed: 'Hace 6 horas',
        steps: [
            { id: '8-1', label: 'Configurar llaves SSH y firma de commits con GPG', level: 'basico' },
            { id: '8-2', label: 'Instalar pnpm, Docker Desktop y sincronizar archivo .env local', level: 'basico' },
            { id: '8-3', label: 'Levantar stack local con docker-compose y verificar seeds', level: 'intermedio' },
            { id: '8-4', label: 'Crear rama feature y pasar validación de linter y pre-push', level: 'intermedio' }
        ]
    }
];

export const ProcedureSearchAndFilter: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tagSearchInput, setTagSearchInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([
        'Backend',
        'DevOps',
        'Testing',
        'Seguridad',
        'Frontend',
        'Cloud',
        'Soporte',
        'Gobernanza'
    ]);

    // Checkboxes del Nivel de Detalle al lado de la barra de búsqueda
    const [detailScope, setDetailScope] = useState({
        procedimiento: true,
        descripcion: true,
        pasos: true
    });

    const toggleScope = (key: keyof typeof detailScope) => {
        setDetailScope(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleToggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleClearTags = () => {
        setSelectedTags([]);
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = tagSearchInput.trim();
        if (!trimmed) return;

        const formattedTag = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

        if (!availableTags.includes(formattedTag)) {
            setAvailableTags(prev => [...prev, formattedTag]);
        }
        if (!selectedTags.includes(formattedTag)) {
            setSelectedTags(prev => [...prev, formattedTag]);
        }
        setTagSearchInput('');
    };

    const filteredProcedures = useMemo(() => {
        return INITIAL_PROCEDURES.filter(proc => {
            // Filtro por búsqueda según los checkboxes activos
            const term = searchTerm.trim().toLowerCase();
            let matchesSearch = true;

            if (term) {
                const searchInProcedure = detailScope.procedimiento && proc.title.toLowerCase().includes(term);
                const searchInDesc = detailScope.descripcion && proc.description.toLowerCase().includes(term);
                const searchInSteps = detailScope.pasos && proc.steps.some(s => s.label.toLowerCase().includes(term));

                // Si ninguno de los 3 está seleccionado, busca en título por defecto
                const noneSelected = !detailScope.procedimiento && !detailScope.descripcion && !detailScope.pasos;
                matchesSearch = noneSelected
                    ? proc.title.toLowerCase().includes(term)
                    : (searchInProcedure || searchInDesc || searchInSteps);
            }

            // Filtro por tags seleccionados
            const matchesTags =
                selectedTags.length === 0 || selectedTags.includes(proc.category);

            return matchesSearch && matchesTags;
        });
    }, [searchTerm, selectedTags, detailScope]);

    const getLevelBadge = (level: ProcedureStep['level']) => {
        switch (level) {
            case 'basico':
                return (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        Básico
                    </span>
                );
            case 'intermedio':
                return (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                        Medio
                    </span>
                );
            case 'avanzado':
                return (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                        Avanzado
                    </span>
                );
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-3 sm:p-5 bg-slate-50 min-h-screen font-sans text-slate-800 text-xs">
            {/* Encabezado compacto */}
            <div className="mb-4 bg-gradient-to-r from-red-100/70 via-rose-50 to-white p-4 rounded-xl border border-red-100 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        {/* <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600">
                                Repositorio Operativo
                            </span>
                        </div> */}
                        <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                            Biblioteca de Procedimientos Estándar (SOP)
                        </h1>
                        <p className="text-xs text-slate-500">
                            Explora y consulta los procedimientos estandarizados de la organización.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs bg-white/90 px-2.5 py-1.5 rounded-lg border border-rose-200 shadow-xs self-start sm:self-auto">
                        <span className="text-rose-600 font-bold text-sm">{filteredProcedures.length}</span>
                        <span className="text-slate-600 font-medium text-[11px]">procedimientos</span>
                    </div>
                </div>
            </div>

            {/* Barra de Búsqueda y Requerimiento 1: 3 Checkboxes SIEMPRE visibles al lado */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar procedimientos..."
                        className="w-full pl-9 pr-7 py-2 bg-white border border-rose-200 rounded-lg text-xs outline-none shadow-xs focus:border-rose-400 focus:ring-1 focus:ring-rose-300 transition-all placeholder:text-slate-400"
                    />
                    <svg className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Requerimiento 1: Checkboxes SIEMPRE visibles (Procedimiento, Descripcion, Pasos) */}
                <div className="flex items-center gap-2 bg-white border border-rose-200 rounded-lg px-3 py-1.5 shadow-xs shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                        Buscar en:
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none hover:text-rose-600">
                        <input
                            type="checkbox"
                            checked={detailScope.procedimiento}
                            onChange={() => toggleScope('procedimiento')}
                            className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-300 accent-rose-500 cursor-pointer"
                        />
                        <span>Procedimiento</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none hover:text-rose-600">
                        <input
                            type="checkbox"
                            checked={detailScope.descripcion}
                            onChange={() => toggleScope('descripcion')}
                            className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-300 accent-rose-500 cursor-pointer"
                        />
                        <span>Descripción</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none hover:text-rose-600">
                        <input
                            type="checkbox"
                            checked={detailScope.pasos}
                            onChange={() => toggleScope('pasos')}
                            className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-300 accent-rose-500 cursor-pointer"
                        />
                        <span>Pasos</span>
                    </label>
                </div>
            </div>

            {/* SECCIÓN DE TAGS (Categorías, Limpiar tags y agregar) */}
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs mb-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                            Categorías:
                        </span>
                        {selectedTags.length > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.2 rounded-full">
                                {selectedTags.length} activa{selectedTags.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleAddTag} className="flex items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={tagSearchInput}
                                    onChange={(e) => setTagSearchInput(e.target.value)}
                                    placeholder="+ Agregar/Buscar tag..."
                                    className="w-40 sm:w-48 text-[11px] py-1 pl-2.5 pr-6 bg-slate-50 border border-rose-200 rounded-md outline-none focus:bg-white focus:border-rose-400 transition"
                                />
                                {tagSearchInput && (
                                    <button
                                        type="submit"
                                        title="Agregar tag"
                                        className="absolute right-1.5 top-1 text-[11px] text-rose-600 font-bold px-1 hover:text-rose-700"
                                    >
                                        ↵
                                    </button>
                                )}
                            </div>
                        </form>

                        {selectedTags.length > 0 && (
                            <button
                                onClick={handleClearTags}
                                className="text-[11px] font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Limpiar tags
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                        onClick={handleClearTags}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${selectedTags.length === 0
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                    >
                        Todas
                    </button>

                    {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => handleToggleTag(tag)}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 border ${isSelected
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                    : 'bg-rose-50/60 text-rose-700 border-rose-200/70 hover:bg-rose-100/70 hover:border-rose-300'
                                    }`}
                            >
                                <span>{tag}</span>
                                {isSelected && <span className="text-[9px]">✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Listado de Tarjetas: Tamaño más compacto, Rojo suave pastel, Lista simple de pasos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredProcedures.map((proc) => {
                    return (
                        <div
                            key={proc.id}
                            className="bg-white rounded-xl border border-rose-100 shadow-xs hover:shadow-sm transition-all duration-150 overflow-hidden flex flex-col justify-between hover:border-rose-200 text-xs"
                        >
                            {/* Card Header (Compacto) */}
                            <div className="p-3 bg-gradient-to-b from-rose-50/60 to-transparent border-b border-rose-50/80">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-rose-100/90 text-rose-700 border border-rose-200/80">
                                        {proc.category}
                                    </span>
                                    <button
                                        title="Ejecutar procedimiento"
                                        className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white font-medium px-2.5 py-1 rounded-md text-[11px] shadow-xs transition-all flex items-center gap-1 active:scale-95"
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        Iniciar
                                    </button>
                                </div>

                                <h3 className="text-sm font-bold text-slate-900 hover:text-rose-600 transition-colors cursor-pointer mt-1.5 leading-snug">
                                    {proc.title}
                                </h3>

                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {proc.description}
                                </p>
                            </div>

                            {/* Requerimiento 2: Lista SIMPLE de pasos (sin checklist ni progreso) */}
                            <div className="p-3 flex-1 bg-white space-y-1.5">
                                <div className="flex items-center justify-between pb-1 border-b border-rose-50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Pasos del Procedimiento ({proc.steps.length})
                                    </span>
                                </div>

                                <ol className="space-y-1 pt-0.5">
                                    {proc.steps.map((step, idx) => (
                                        <li
                                            key={step.id}
                                            className="flex items-start justify-between gap-1.5 p-1 rounded-md bg-slate-50/70 hover:bg-rose-50/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-1.5 flex-1 pr-1">
                                                <span className="text-[10px] font-bold text-rose-500 shrink-0 mt-0.5">
                                                    {idx + 1}.
                                                </span>
                                                <span className="text-[11px] text-slate-700 leading-tight">
                                                    {step.label}
                                                </span>
                                            </div>
                                            {/* <div className="shrink-0 self-center">
                                                                                                        {getLevelBadge(step.level)}
                                                                                                    </div> */}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Métricas de uso compactas y legibles */}
                            <div className="px-3 py-2 bg-rose-50/20 border-t border-rose-100 text-xs">
                                <div className="grid grid-cols-3 gap-1 py-1.5 mb-1.5 bg-white rounded-lg border border-rose-100/90 text-center">
                                    <div className="border-r border-rose-100 last:border-r-0">
                                        <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                            Usos
                                        </div>
                                        <div className="text-xs font-extrabold text-slate-800">
                                            {proc.usageCount}
                                        </div>
                                    </div>

                                    <div className="border-r border-rose-100 last:border-r-0">
                                        <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                            Éxito
                                        </div>
                                        <div className="text-xs font-extrabold text-emerald-600">
                                            {proc.successRate}%
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                            Tiempo
                                        </div>
                                        <div className="text-xs font-extrabold text-slate-800">
                                            ~{proc.avgDurationMin}m
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                                    <span className="truncate max-w-[130px] font-medium text-slate-600">
                                        {proc.author}
                                    </span>
                                    <span className="text-slate-400">
                                        {proc.lastUsed}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProcedures.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-rose-100 shadow-xs mt-3">
                    <h3 className="text-xs font-bold text-slate-800">No se encontraron procedimientos</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Prueba ajustando los términos de búsqueda o los tags.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedTags([]);
                            setDetailScope({ procedimiento: true, descripcion: true, pasos: true });
                        }}
                        className="mt-2 text-[11px] bg-rose-50 text-rose-600 font-semibold px-2.5 py-1 rounded-md border border-rose-200 hover:bg-rose-100 transition"
                    >
                        Restablecer filtros
                    </button>
                </div>
            )}
        </div>
    );
};