import * as React from 'react';
import { cn } from '../../utils/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-white text-gray-900 shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center', className)} {...props} />
  )
);
CardAction.displayName = 'CardAction';

// Legacy aliases for backward compatibility
const CardBody = CardContent;
CardBody.displayName = 'CardBody';

const CardSubtitle = CardDescription;
CardSubtitle.displayName = 'CardSubtitle';

const CardText = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-base text-gray-900 leading-normal mb-3 last:mb-0', className)}
      {...props}
    />
  )
);
CardText.displayName = 'CardText';

interface CardImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  height?: string;
  overlay?: string;
}

const CardImage = React.forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, src, height = '200px', overlay, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full bg-cover bg-center bg-no-repeat relative', className)}
      style={{
        height,
        backgroundImage: `url(${src})`,
      }}
      {...props}
    >
      {overlay && <div className="absolute inset-0" style={{ background: overlay }} />}
    </div>
  )
);
CardImage.displayName = 'CardImage';

interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'error';
}

const CardBadge = React.forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-blue-100 text-blue-800',
      accent: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full uppercase tracking-wide',
          variantClasses[variant] || variantClasses.default,
          className
        )}
        {...props}
      />
    );
  }
);
CardBadge.displayName = 'CardBadge';

// Create a typed Card component with subcomponents
type CardComponent = typeof Card & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
  Action: typeof CardAction;
  Body: typeof CardBody;
  Subtitle: typeof CardSubtitle;
  Text: typeof CardText;
  Image: typeof CardImage;
  Badge: typeof CardBadge;
};

// Attach subcomponents to Card (shadcn style + legacy support)
(Card as CardComponent).Header = CardHeader;
(Card as CardComponent).Title = CardTitle;
(Card as CardComponent).Description = CardDescription;
(Card as CardComponent).Content = CardContent;
(Card as CardComponent).Footer = CardFooter;
(Card as CardComponent).Action = CardAction;

// Legacy support
(Card as CardComponent).Body = CardBody;
(Card as CardComponent).Subtitle = CardSubtitle;
(Card as CardComponent).Text = CardText;
(Card as CardComponent).Image = CardImage;
(Card as CardComponent).Badge = CardBadge;

export default Card as CardComponent;
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  // Legacy exports
  CardBody,
  CardSubtitle,
  CardText,
  CardImage,
  CardBadge,
};
