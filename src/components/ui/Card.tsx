import { Card as ChakraCard } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, React.ComponentProps<typeof ChakraCard.Root>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Root
      ref={ref}
      className={cn('shadow-soft', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.ComponentProps<typeof ChakraCard.Header>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Header ref={ref} className={className} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, React.ComponentProps<typeof ChakraCard.Title>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Title ref={ref} className={className} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, React.ComponentProps<typeof ChakraCard.Description>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Description ref={ref} className={className} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.ComponentProps<typeof ChakraCard.Body>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Body ref={ref} className={className} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.ComponentProps<typeof ChakraCard.Footer>>(
  ({ className, ...props }, ref) => (
    <ChakraCard.Footer ref={ref} className={className} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
