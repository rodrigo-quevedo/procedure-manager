import type { User } from '@/features/auth/types';

interface ProjectAssignmentFieldsProps {
  actor: User;
  members: User[];
  leaderIds: string[];
  memberIds: string[];
  onChange: (next: { leaderIds: string[]; memberIds: string[] }) => void;
}

function roleLabel(role: User['role']): string {
  if (role === 'LIDER') return 'Líder';
  if (role === 'DESARROLLADOR') return 'Desarrollador';
  return 'Organización';
}

interface PersonOptionProps {
  person: User;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

function PersonOption({ person, checked, disabled = false, onToggle }: PersonOptionProps) {
  return (
    <label
      className={`flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors ${
        disabled ? 'bg-gray-50 border-gray-200 cursor-default' : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="mt-0.5 accent-red-600"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-900">{person.name}</span>
        <span className="block text-xs text-gray-500 truncate">
          {person.email} · {roleLabel(person.role)}
          {!person.isActive ? ' · Inhabilitado' : ''}
        </span>
      </span>
    </label>
  );
}

export function ProjectAssignmentFields({
  actor,
  members,
  leaderIds,
  memberIds,
  onChange,
}: ProjectAssignmentFieldsProps) {
  const selectedIds = new Set([...leaderIds, ...memberIds]);
  const leaders = members.filter(
    (member) => member.role === 'LIDER' && (member.isActive || selectedIds.has(member.id)),
  );
  const developers = members.filter(
    (member) => member.role === 'DESARROLLADOR' && (member.isActive || selectedIds.has(member.id)),
  );

  const toggleLeader = (id: string) => {
    if (actor.role === 'LIDER' && id === actor.id) return;
    const nextLeaderIds = leaderIds.includes(id)
      ? leaderIds.filter((leaderId) => leaderId !== id)
      : [...leaderIds, id];
    onChange({
      leaderIds: nextLeaderIds,
      memberIds: memberIds.filter((memberId) => memberId !== id),
    });
  };

  const toggleMember = (id: string) => {
    if (actor.role === 'LIDER' && id === actor.id) return;
    const nextMemberIds = memberIds.includes(id)
      ? memberIds.filter((memberId) => memberId !== id)
      : [...memberIds, id];
    onChange({
      leaderIds: leaderIds.filter((leaderId) => leaderId !== id),
      memberIds: nextMemberIds,
    });
  };

  const actorRecord = leaders.find((leader) => leader.id === actor.id);
  const otherLeaders = actor.role === 'LIDER' ? leaders.filter((leader) => leader.id !== actor.id) : leaders;
  const optionalPeople = actor.role === 'LIDER' ? [...otherLeaders, ...developers] : developers;

  return (
    <div className="space-y-5">
      {actor.role === 'ORGANIZACION' ? (
        <fieldset className="space-y-2">
          <legend className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Líderes
          </legend>
          <p className="text-[11px] text-gray-500">Selecciona al menos un líder habilitado.</p>
          {leaders.length === 0 ? (
            <p className="text-xs text-gray-500 rounded-md border border-dashed border-gray-300 px-3 py-4">
              No hay líderes habilitados. Crea un líder antes de continuar.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {leaders.map((leader) => (
                <PersonOption
                  key={leader.id}
                  person={leader}
                  checked={leaderIds.includes(leader.id)}
                  onToggle={() => toggleLeader(leader.id)}
                />
              ))}
            </div>
          )}
        </fieldset>
      ) : (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Líder del proyecto</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{actorRecord?.name || actor.name}</p>
          <p className="text-xs text-gray-500">{actor.email}</p>
          <p className="text-[11px] text-gray-500 mt-1">Quedas asignado automáticamente como líder de este proyecto.</p>
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          Otros miembros
        </legend>
        <p className="text-[11px] text-gray-500">
          {actor.role === 'LIDER'
            ? 'Opcional. Puedes sumar otros líderes o desarrolladores habilitados.'
            : 'Opcional. Puedes sumar desarrolladores habilitados.'}
        </p>
        {optionalPeople.length === 0 ? (
          <p className="text-xs text-gray-500 rounded-md border border-dashed border-gray-300 px-3 py-4">
            No hay otros miembros habilitados para asignar.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optionalPeople.map((person) => {
              const checked = person.role === 'LIDER'
                ? leaderIds.includes(person.id)
                : memberIds.includes(person.id);
              return (
                <PersonOption
                  key={person.id}
                  person={person}
                  checked={checked}
                  onToggle={() => (person.role === 'LIDER' ? toggleLeader(person.id) : toggleMember(person.id))}
                />
              );
            })}
          </div>
        )}
      </fieldset>
    </div>
  );
}
