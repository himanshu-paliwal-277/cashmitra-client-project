import * as React from 'react';
import { cn } from '../../lib/utils';

// @ts-expect-error
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    // @ts-expect-error
    ref={ref}
    className={cn('rounded-lg border bg-white text-gray-900 shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

// @ts-expect-error
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  // @ts-expect-error
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

// @ts-expect-error
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    // @ts-expect-error
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// @ts-expect-error
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  // @ts-expect-error
  <p ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

// @ts-expect-error
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  // @ts-expect-error
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// @ts-expect-error
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  // @ts-expect-error
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

// @ts-expect-error
const CardAction = React.forwardRef(({ className, ...props }, ref) => (
  // @ts-expect-error
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
CardAction.displayName = 'CardAction';

// Legacy aliases for backward compatibility
const CardBody = CardContent;
CardBody.displayName = 'CardBody';

const CardSubtitle = CardDescription;
CardSubtitle.displayName = 'CardSubtitle';

// @ts-expect-error
const CardText = React.forwardRef(({ className, ...props }, ref) => (
  <p
    // @ts-expect-error
    ref={ref}
    className={cn('text-base text-gray-900 leading-normal mb-3 last:mb-0', className)}
    {...props}
  />
));
CardText.displayName = 'CardText';

const CardImage = React.forwardRef(
  // @ts-expect-error
  ({ className, src, height = '200px', overlay, ...props }, ref) => (
    <div
      // @ts-expect-error
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

// @ts-expect-error
const CardBadge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    accent: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      // @ts-expect-error
      ref={ref}
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full uppercase tracking-wide',
        // @ts-expect-error
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
CardBadge.displayName = 'CardBadge';

// Attach subcomponents to Card (shadcn style + legacy support)
// @ts-expect-error
Card.Header = CardHeader;
// @ts-expect-error
Card.Title = CardTitle;
// @ts-expect-error
Card.Description = CardDescription;
// @ts-expect-error
Card.Content = CardContent;
// @ts-expect-error
Card.Footer = CardFooter;
// @ts-expect-error
Card.Action = CardAction;

// Legacy support
// @ts-expect-error
Card.Body = CardBody;
// @ts-expect-error
Card.Subtitle = CardSubtitle;
// @ts-expect-error
Card.Text = CardText;
// @ts-expect-error
Card.Image = CardImage;
// @ts-expect-error
Card.Badge = CardBadge;

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
