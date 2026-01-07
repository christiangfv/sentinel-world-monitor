import { Button as ChakraButton } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ComponentProps<typeof ChakraButton> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', colorPalette = 'blue', ...props }, ref) => {
    return (
      <ChakraButton
        ref={ref}
        variant={variant}
        colorPalette={colorPalette}
        className={cn(className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
