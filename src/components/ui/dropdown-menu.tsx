"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end'
  children: React.ReactNode
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup={true}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  align = 'center',
  children,
  className
}: DropdownMenuContentProps) {
  const { isOpen } = React.useContext(DropdownMenuContext)

  if (!isOpen) return null

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <div
      className={cn(
        "absolute top-full mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md animate-in fade-in-0 zoom-in-95",
        "dark:bg-gray-800 dark:border-gray-700",
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  className
}: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    onClick?.()
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
