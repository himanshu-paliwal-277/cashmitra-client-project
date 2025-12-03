import * as React from 'react';
import { cn } from '../../lib/utils';const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div    ref={ref}
    className={cn('rounded-lg border bg-white text-gray-900 shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';const CardHeader = React.forwardRef(({ className, ...props }, ref) => (  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';const CardDescription = React.forwardRef(({ className, ...props }, ref) => (  <p ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';const CardContent = React.forwardRef(({ className, ...props }, ref) => (  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';const CardFooter = React.forwardRef(({ className, ...props }, ref) => (  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';const CardAction = React.forwardRef(({ className, ...props }, ref) => (  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
CardAction.displayName = 'CardAction';

// Legacy aliases for backward compatibility
const CardBody = CardContent;
CardBody.displayName = 'CardBody';

const CardSubtitle = CardDescription;
CardSubtitle.displayName = 'CardSubtitle';const CardText = React.forwardRef(({ className, ...props }, ref) => (
  <p    ref={ref}
    className={cn('text-base text-gray-900 leading-normal mb-3 last:mb-0', className)}
    {...props}
  />
));
CardText.displayName = 'CardText';

const CardImage = React.forwardRef(  ({ className, src, height = '200px', overlay, ...props }, ref) => (
    <div      ref={ref}
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
CardImage.displayName = 'CardImage';const CardBadge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    accent: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span      ref={ref}
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full uppercase tracking-wide',        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
CardBadge.displayName = 'CardBadge';

// Attach subcomponents to Card (shadcn style + legacy support)Card.Header = CardHeader;Card.Title = CardTitle;Card.Description = CardDescription;Card.Content = CardContent;Card.Footer = CardFooter;Card.Action = CardAction;

// Legacy supportCard.Body = CardBody;Card.Subtitle = CardSubtitle;Card.Text = CardText;Card.Image = CardImage;Card.Badge = CardBadge;

export default Card;
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
