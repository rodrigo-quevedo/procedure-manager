import React from 'react';

export interface SidebarNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface SidebarNavProps<T extends string = string> {
  title?: string;
  items: SidebarNavItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  className?: string;
}

export function SidebarNav<T extends string = string>({
  title = 'Navegación',
  items,
  activeId,
  onSelect,
  actionButton,
  className = '',
}: SidebarNavProps<T>) {
  return (
    <aside
      className={`w-full md:w-60 shrink-0 bg-white border border-gray-200/80 rounded-xl p-3 shadow-xs flex flex-col justify-between self-start ${className}`}
    >
      <div className="space-y-1">
        {title && (
          <div className="px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {title}
            </p>
          </div>
        )}

        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-50 text-red-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-red-600' : 'text-gray-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-red-200/80 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {actionButton && (
        <div className="pt-3 mt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={actionButton.onClick}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {actionButton.icon}
            <span>{actionButton.label}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
