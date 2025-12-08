import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-grey-100 text-text-primary hover:bg-grey-200',
        primary:
          'bg-green-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
        secondary:
          'bg-white text-primary border-2 border-primary shadow-sm hover:bg-primary-50 hover:border-primary-dark hover:text-primary-dark hover:shadow-md',
        accent: 'bg-green-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
        warning: 'bg-warning text-white hover:bg-warning-dark',
        error: 'bg-error text-white hover:bg-error-dark',
        ghost: 'bg-transparent text-text-primary hover:bg-grey-100',
        link: 'bg-transparent text-primary hover:text-primary-dark hover:underline p-1 min-h-0',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {leftIcon && !loading && leftIcon}
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
        {rightIcon && !loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
export { buttonVariants };
