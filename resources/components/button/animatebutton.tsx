import React, { type MouseEvent, useRef } from 'react'
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Filter,
  LucideCheckCircle,
  ShoppingCart,

} from 'lucide-react'

interface AnimateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  mode: 'edit' | 'delete' | 'view' | 'create' | 'close' | 'search' | 'dropdown-up' | 'dropdown-down' | 'filter' | 'confirm' | 'cart'
}

const iconMap = {
  edit: Edit,
  delete: Trash2,
  view: Eye,
  create: Plus,
  close: X,
  search: Search,
  'dropdown-up': ChevronUp,
  'dropdown-down': ChevronDown,
  filter:Filter,
  confirm:LucideCheckCircle,
  cart:ShoppingCart,
}

const AnimateButton: React.FC<AnimateButtonProps> = ({
  label = '',
  className = '',
  mode = 'edit',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current
    if (!btn) return

    // Call passed onClick handler
    if (props.onClick) {
      props.onClick(e)
    }

    const rect = btn.getBoundingClientRect()
    const circle = document.createElement('span')
    circle.className = 'ripple-circle'

    const size = Math.max(rect.width, rect.height) * 0.5
    circle.style.width = `${size}px`
    circle.style.height = `${size}px`

    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    circle.style.left = `${x}px`
    circle.style.top = `${y}px`

    btn.appendChild(circle)
    circle.addEventListener('animationend', () => {
      circle.remove()
    })
  }


  const Icon = iconMap[mode] || Edit

  return (
    <div className="relative">
      <style>
        {`
          .ripple-circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: rippleGrowSmall 0.6s ease-out forwards;
            pointer-events: none;
          }

          @keyframes rippleGrowSmall {
            to {
              transform: scale(1.5);
              opacity: 0;
            }
          }
        `}
      </style>

      <button
        ref={buttonRef}
        onClick={handleClick}
        {...props}
        className={`relative shrink-0 overflow-hidden select-none px-6 py-2 bg-blue-500 rounded text-xs font-medium uppercase leading-normal
        text-white shadow-[0_4px_9px_-4px_#3b71ca]
        hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
        focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
        focus:outline-none focus:ring-0
        active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]
        dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]
        dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]
        dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]
        flex items-center group cursor-pointer ${className}`}
      >
        <span className="relative block transition-transform duration-500 ease-in-out group-hover:translate-x-7 group-hover:opacity-0">
          {label}
        </span>

        <Icon
          className="absolute left-6 top-1/2 w-5 h-5 text-white opacity-0 transform -translate-y-1/2 -translate-x-4 transition-all
          duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-0"
        />
      </button>
    </div>
  )
}

export default AnimateButton
