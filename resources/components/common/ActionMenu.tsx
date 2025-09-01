import { useEffect, useRef } from 'react';
import ImageButton from '../button/ImageBtn';
import {
  Edit, Trash2, Plus, Eye, ChevronDown, ChevronUp, X, Search,
  ArrowUpWideNarrow, ArrowDownWideNarrow, Menu
} from 'lucide-react';

const iconMap = {
  plus: <Plus size={16} />,
  edit: <Edit size={16} />,
  delete: <Trash2 size={16} />,
  view: <Eye size={16} />,
  chevronDown: <ChevronDown size={16} />,
  chevronUp: <ChevronUp size={16} />,
  close: <X size={16} />,
  search: <Search size={16} />,
  asc: <ArrowUpWideNarrow size={16} />,
  desc: <ArrowDownWideNarrow size={16} />,
  menu: <Menu size={16} />,
};

interface MenuItem {
  label: string;
  icon: keyof typeof iconMap;
  onClick?: () => void;
}

interface ActionMenuProps {
  className?: string;
  onClick?: () => void; // toggle visibility
  isVisible: boolean;
  menuItems: MenuItem[];
}

function ActionMenu({ className = '', onClick, menuItems, isVisible }: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClick?.(); // hide menu
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClick]);

  return (
    <div ref={menuRef} className={` border rounded-md border-ring/30 ${className}`}>
      <ImageButton icon="menu" className=" p-2" onClick={onClick} />

      {isVisible && (
        <div className="absolute right-0 mt-2 bg-popover overflow-hidden text-popover-foreground border border-ring/30 rounded-md shadow-lg z-50">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => {
                item.onClick?.();
                onClick?.();
              }}
            >
              {iconMap[item.icon]}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;
