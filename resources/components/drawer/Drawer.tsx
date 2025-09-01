import React from 'react';
import clsx from 'clsx';
import ImageButton from '../button/ImageBtn';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface DrawerProps {
  position?: Position;
  title?: string;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void; 
}

const Drawer: React.FC<DrawerProps> = ({
  position = 'right',
  title = 'Filters',
  children,
  className = '',
  isOpen,
  onClose,
}) => {
  const baseClasses =
    'fixed bg-white dark:bg-neutral-800 z-50 transition-transform duration-300 shadow-md border-t border-gray-500/20';
  const directionClasses = {
    top: `top-0 inset-x-0 ${isOpen ? 'translate-y-0' : '-translate-y-full'} border-b max-h-[40vh] overflow-y-auto scrollbar-hide`,
    bottom: `bottom-0 inset-x-0 ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[40vh] overflow-y-auto scrollbar-hide`,
    left: `top-0 left-0 h-full max-w-xs w-full ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r`,
    right: `top-0 right-0 h-full max-w-xs w-full ${isOpen ? 'translate-x-0' : 'translate-x-full'} border-l`,
  };

  return (
    <div
      className={clsx(
        baseClasses,
        directionClasses[position],
        'transform',
        !isOpen && 'pointer-events-none',
        className
      )}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 dark:text-white">{title}</h3>
        <ImageButton
          onClick={onClose}
          
          className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400"
          aria-label="Close"
          icon="close"
        />
      </div>

      <div className="p-4 text-gray-800 dark:text-neutral-400">{children}</div>
    </div>
  );
};

export default Drawer;
