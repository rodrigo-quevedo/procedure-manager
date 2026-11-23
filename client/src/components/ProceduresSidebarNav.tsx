import React from 'react';
import { PlaySquare, BookOpen, Plus } from 'lucide-react';
import { SidebarNav, SidebarNavItem } from './SidebarNav';

export type ProceduresNavSection = 'EXECUTIONS' | 'PROCEDURES';

interface ProceduresSidebarNavProps {
  activeSection: ProceduresNavSection;
  onSelectSection: (section: ProceduresNavSection) => void;
  onCreateProcedure?: () => void;
  className?: string;
}

export const ProceduresSidebarNav: React.FC<ProceduresSidebarNavProps> = ({
  activeSection,
  onSelectSection,
  onCreateProcedure,
  className = '',
}) => {
  const items: SidebarNavItem<ProceduresNavSection>[] = [
    {
      id: 'EXECUTIONS',
      label: 'Ejecuciones',
      icon: <PlaySquare className="w-4 h-4" />,
    },
    {
      id: 'PROCEDURES',
      label: 'Procedimientos Estándar',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <SidebarNav<ProceduresNavSection>
      items={items}
      activeId={activeSection}
      onSelect={onSelectSection}
      actionButton={
        onCreateProcedure
          ? {
            label: 'Crear Procedimiento',
            icon: <Plus className="w-3.5 h-3.5 stroke-[2.5]" />,
            onClick: onCreateProcedure,
          }
          : undefined
      }
      className={className}
    />
  );
};
