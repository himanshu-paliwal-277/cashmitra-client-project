import React from 'react';import styled from 'styled-components';
import { theme } from '../../theme';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  padding: ${(props: any) => {
    switch (props.size) {
      case 'sm':
        return `${theme.spacing[2]} ${theme.spacing[3]}`;
      case 'lg':
        return `${theme.spacing[4]} ${theme.spacing[6]}`;
      case 'xl':
        return `${theme.spacing[5]} ${theme.spacing[8]}`;
      default:
        return `${theme.spacing[3]} ${theme.spacing[5]}`;
    }
  }};
  font-size: ${(props: any) => {
    switch (props.size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      case 'xl':
        return theme.typography.fontSize.xl;
      default:
        return theme.typography.fontSize.base;
    }
  }};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${(props: any) => props.$rounded ? theme.borderRadius.full : theme.borderRadius.lg};
  border: 2px solid transparent;
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  text-decoration: none;
  min-height: ${(props: any) => {
    switch (props.size) {
      case 'sm':
        return '32px';
      case 'lg':
        return '48px';
      case 'xl':
        return '56px';
      default:
        return '40px';
    }
  }};
  position: relative;
  overflow: hidden;
  width: ${(props: any) => props.$fullWidth ? '100%' : 'auto'};

  /* Variant Styles */
  ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%);
          color: ${theme.colors.white};
          box-shadow: ${theme.shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${theme.colors.primary.dark} 0%, ${theme.colors.primary[800]} 100%);
            box-shadow: ${theme.shadows.lg};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.white};
          color: ${theme.colors.primary.main};
          border-color: ${theme.colors.primary.main};
          box-shadow: ${theme.shadows.sm};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary[50]};
            border-color: ${theme.colors.primary.dark};
            color: ${theme.colors.primary.dark};
            box-shadow: ${theme.shadows.md};
          }
        `;
      case 'accent':
        return `
          background: linear-gradient(135deg, ${theme.colors.accent.main} 0%, ${theme.colors.accent.dark} 100%);
          color: ${theme.colors.white};
          box-shadow: ${theme.shadows.md};
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, ${theme.colors.accent.dark} 0%, ${theme.colors.accent[800]} 100%);
            box-shadow: ${theme.shadows.lg};
            transform: translateY(-1px);
          }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning.main};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.warning.dark};
          }
        `;
      case 'error':
        return `
          background: ${theme.colors.error.main};
          color: ${theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.error.dark};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.grey[100]};
          }
        `;
      case 'link':
        return `
          background: transparent;
          color: ${theme.colors.primary.main};
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          min-height: auto;
          
          &:hover:not(:disabled) {
            color: ${theme.colors.primary.dark};
            text-decoration: underline;
          }
        `;
      default:
        return `
          background: ${theme.colors.grey[100]};
          color: ${theme.colors.text.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.grey[200]};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }

  /* Loading State */
  ${(props: any) => props.$loading &&
`
pointer-events: none;

&::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
`}

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* This is now handled by the width property above */
`;

const Button = React.forwardRef(
  (
    {      children,      variant = 'default',      size = 'md',      loading = false,      disabled = false,      fullWidth = false,      rounded = false,      leftIcon,      rightIcon,      as = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        $loading={loading}
        disabled={disabled || loading}
        $fullWidth={fullWidth}
        $rounded={rounded}
        as={as}
        {...props}
      >
        {leftIcon && !loading && leftIcon}
        {!loading && children}
        {rightIcon && !loading && rightIcon}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
