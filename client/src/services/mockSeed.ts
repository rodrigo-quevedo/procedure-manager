import { storage } from '@/services/storage';
import type {
  Procedure,
  Step,
  Section,
  Field,
  Execution,
  Input,
} from '@shared/types';

export function initializeProcedureMocks(organizationId: string, developerId: number, projectId: number) {
  const existingProcedures = storage.getProcedures();
  if (existingProcedures.length > 0) return;

  const mockProcedures: Procedure[] = [
    {
      id: 1,
      idProject: 1,
      idCreator: developerId,
      idLeaderApprover: null,
      idPreviousVersion: null,
      state: 'APPROVED',
      name: 'Despliegue de Microservicio en Staging',
      description: 'Procedimiento seguro para empaquetar contenedores, verificar manifiestos y desplegar en clúster staging sin downtime.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      tags: ['DevOps', 'Backend'],
    },
    {
      id: 2,
      idProject: 2,
      idCreator: developerId,
      idLeaderApprover: null,
      idPreviousVersion: null,
      state: 'APPROVED',
      name: 'Migración y Rollback de Base de Datos PostgreSQL',
      description: 'Ejecución controlada de scripts Flyway/Liquibase con punto de restauración y validación de integridad referencial.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      tags: ['Backend'],
    },
    {
      id: 3,
      idProject: 3,
      idCreator: developerId,
      idLeaderApprover: null,
      idPreviousVersion: null,
      state: 'APPROVED',
      name: 'Auditoría y Rotación de Secretos y API Keys',
      description: 'Protocolo periódico para revocar credenciales antiguas, renovar llaves en HashiCorp Vault y sincronizar servicios.',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      tags: ['Seguridad', 'Cloud'],
    },
    {
      id: 4,
      idProject: 4,
      idCreator: developerId,
      idLeaderApprover: null,
      idPreviousVersion: null,
      state: 'APPROVED',
      name: 'Integración de Bucket Cloudflare R2',
      description: 'Configuración de bucket compatible S3 en Cloudflare R2 con credenciales y políticas de acceso.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      tags: ['Cloud', 'DevOps'],
    },
  ];

  const mockSteps: Step[] = [
    // Proc 1
    { id: 101, idProcedure: 1, name: 'Validar Dockerfile y escaneo de vulnerabilidades', description: 'Revisar sintaxis y seguridad previa al empaquetado.', order: 1 },
    { id: 102, idProcedure: 1, name: 'Compilar imagen taggeada y subir a Registry', description: 'Generar imagen Docker con tag semántico.', order: 2 },
    { id: 103, idProcedure: 1, name: 'Aplicar K8s manifests y monitorear rollout', description: 'Actualizar deployment en Kubernetes.', order: 3 },
    // Proc 2
    { id: 201, idProcedure: 2, name: 'Tomar snapshot previo y backup rápido en S3', description: 'Asegurar respaldo antes de cualquier migración de base de datos.', order: 1 },
    { id: 202, idProcedure: 2, name: 'Ejecutar script de migración', description: 'Correr migración de schema y verificar logs.', order: 2 },
    // Proc 3
    { id: 301, idProcedure: 3, name: 'Identificar claves con antigüedad mayor a 90 días', description: 'Escanear inventario de secretos.', order: 1 },
    // Proc 4
    { id: 401, idProcedure: 4, name: 'Configurar bucket y CORS', description: 'Crear bucket y especificar reglas de acceso de orígenes.', order: 1 },
  ];

  const mockSections: Section[] = [
    { id: 1001, idStep: 101, name: 'Entorno y Dependencias', description: 'Configurar credenciales del registry y docker daemon' },
    { id: 1002, idStep: 101, name: 'Escaneo Trivy', description: 'Ejecutar comando de análisis estático' },
    { id: 1003, idStep: 102, name: 'Build & Tag', description: 'Parámetros de compilación' },
    { id: 1004, idStep: 103, name: 'Despliegue K8s', description: 'Aplicación de manifiestos' },
    { id: 2001, idStep: 201, name: 'Respaldo', description: 'Comandos de snapshot pg_dump' },
    { id: 2002, idStep: 202, name: 'Migración Schema', description: 'Comandos Flyway' },
    { id: 3001, idStep: 301, name: 'Inventario', description: 'Listado de API Keys' },
    { id: 4001, idStep: 401, name: 'Políticas R2', description: 'Configuración bucket' },
  ];

  const mockFields: Field[] = [
    { id: 10001, idSection: 1001, fieldType: 'TEXT', content: 'Verificar versión de Docker instalada en el nodo de build' },
    { id: 10002, idSection: 1001, fieldType: 'CODE', content: 'export DOCKER_BUILDKIT=1\ndocker version' },
    { id: 10003, idSection: 1002, fieldType: 'CODE', content: 'trivy image --severity HIGH,CRITICAL my-app:staging' },
    { id: 10004, idSection: 1003, fieldType: 'CODE', content: 'docker build -t registry.internal/app:v1.2.0 .' },
    { id: 10005, idSection: 1004, fieldType: 'CODE', content: 'kubectl apply -f k8s/staging/ -n default' },
    { id: 20001, idSection: 2001, fieldType: 'CODE', content: 'pg_dump -Fc mydb > backup_pre_migration.dump' },
    { id: 20002, idSection: 2002, fieldType: 'CODE', content: 'npm run migrate:up' },
    { id: 30001, idSection: 3001, fieldType: 'TEXT', content: 'Revisar dashboard de Vault para identificar tokens expirados' },
    { id: 40001, idSection: 4001, fieldType: 'TEXT', content: 'Crear bucket "assets-storage" en la consola de Cloudflare' },
  ];

  const mockExecutions: Execution[] = [
    {
      id: 104,
      idProcedure: 4,
      idProject: 4,
      idDeveloper: developerId,
      state: 'HAS_CORRECTIONS',
      startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 101,
      idProcedure: 1,
      idProject: 1,
      idDeveloper: developerId,
      state: 'PAUSED',
      startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 102,
      idProcedure: 2,
      idProject: 2,
      idDeveloper: developerId,
      state: 'PAUSED',
      startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 103,
      idProcedure: 3,
      idProject: 3,
      idDeveloper: developerId,
      state: 'PENDING_EVALUATION',
      startedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 105,
      idProcedure: 1,
      idProject: 1,
      idDeveloper: developerId,
      state: 'APPROVED_FINISHED',
      startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      endedAt: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(),
    },
    {
      id: 106,
      idProcedure: 3,
      idProject: 3,
      idDeveloper: developerId,
      state: 'CANCELLED',
      startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      endedAt: new Date(Date.now() - 86400000 * 4 + 600000).toISOString(),
    },
  ];

  const mockInputs: Input[] = [
    {
      id: 50001,
      idExecution: 105,
      idField: 10001,
      fieldType: 'TEXT',
      content: 'Docker 24.0.7 verificado ok',
      createdAt: new Date().toISOString(),
    },
    {
      id: 50002,
      idExecution: 105,
      idField: 10002,
      fieldType: 'CODE',
      content: 'Client: Docker Engine 24.0.7\nServer: Docker Engine 24.0.7',
      createdAt: new Date().toISOString(),
    },
    {
      id: 50003,
      idExecution: 105,
      idField: 10003,
      fieldType: 'CODE',
      content: '0 vulnerabilities found (HIGH: 0, CRITICAL: 0)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 50004,
      idExecution: 101,
      idField: 10001,
      fieldType: 'TEXT',
      content: 'Versión verificada',
      createdAt: new Date().toISOString(),
    },
    {
      id: 50005,
      idExecution: 104,
      idField: 40001,
      fieldType: 'TEXT',
      content: 'Bucket creado con ID cf_r2_bucket_01',
      createdAt: new Date().toISOString(),
    },
  ];

  // Save mocks to storage
  mockProcedures.forEach((p) => storage.saveProcedure(p));
  storage.saveSteps(mockSteps);
  storage.saveSections(mockSections);
  storage.saveFields(mockFields);
  mockExecutions.forEach((e) => storage.saveExecution(e));
  storage.saveInputs(mockInputs);
}
