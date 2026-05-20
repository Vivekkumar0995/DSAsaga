'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type DrawerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawerContext() {
  const context = React.useContext(DrawerContext)

  if (!context) {
    throw new Error('Drawer components must be used within <Drawer>.')
  }

  return context
}

function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen

  const setOpen = React.useCallback<DrawerContextValue['setOpen']>(
    (value) => {
      const nextOpen = typeof value === 'function' ? value(open) : value

      if (openProp === undefined) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [onOpenChange, open, openProp],
  )

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      <div data-slot="drawer" {...props}>
        {children}
      </div>
    </DrawerContext.Provider>
  )
}

function DrawerTrigger({
  asChild = false,
  children,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useDrawerContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      ...props,
    })
  }

  return (
    <button data-slot="drawer-trigger" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function DrawerPortal({ children }: React.ComponentProps<'div'>) {
  return <>{children}</>
}

function DrawerClose({
  asChild = false,
  children,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useDrawerContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(false)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      ...props,
    })
  }

  return (
    <button data-slot="drawer-close" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { open, setOpen } = useDrawerContext()

  if (!open) {
    return null
  }

  return (
    <div
      data-slot="drawer-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const { open } = useDrawerContext()

  if (!open) {
    return null
  }

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-border bg-background p-4 shadow-2xl',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-muted" />
        {children}
      </div>
    </DrawerPortal>
  )
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-header" className={cn('flex flex-col gap-1', className)} {...props} />
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-title" className={cn('text-foreground font-semibold', className)} {...props} />
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
