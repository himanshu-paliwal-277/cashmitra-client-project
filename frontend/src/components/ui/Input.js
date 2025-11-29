import React, { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};

  ${props =>
    props.required &&
    `
    &::after {
      content: '*';
      color: ${theme.colors.error.main};
      margin-left: ${theme.spacing[1]};
    }
  `}
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${props => {
    switch (props.size) {
      case 'sm':
        return `${theme.spacing[2]} ${theme.spacing[3]}`;
      case 'lg':
        return `${theme.spacing[4]} ${theme.spacing[5]}`;
      default:
        return `${theme.spacing[3]} ${theme.spacing[4]}`;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  }};
  border: 2px solid
    ${props => {
      if (props.error) return theme.colors.error.main;
      if (props.success) return theme.colors.accent.main;
      return theme.colors.grey[300];
    }};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.white};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};

  ${props =>
    props.$hasLeftIcon &&
    `
    padding-left: ${theme.spacing[10]};
  `}

  ${props =>
    props.$hasRightIcon &&
    `
    padding-right: ${theme.spacing[10]};
  `}
  
  &::placeholder {
    color: ${theme.colors.text.hint};
  }

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.error) return theme.colors.error.main;
      if (props.success) return theme.colors.accent.main;
      return theme.colors.primary.main;
    }};
    box-shadow: 0 0 0 3px
      ${props => {
        if (props.error) return `${theme.colors.error.main}20`;
        if (props.success) return `${theme.colors.accent.main}20`;
        return `${theme.colors.primary.main}20`;
      }};
  }

  &:disabled {
    background: ${theme.colors.grey[100]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    border-color: ${theme.colors.grey[200]};
  }

  &:read-only {
    background: ${theme.colors.grey[50]};
    cursor: default;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => (props.left ? `left: ${theme.spacing[3]};` : `right: ${theme.spacing[3]};`)}
  color: ${props => {
    if (props.error) return theme.colors.error.main;
    if (props.success) return theme.colors.accent.main;
    return theme.colors.text.hint;
  }};
  cursor: ${props => (props.clickable ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const HelperText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => {
    if (props.error) return theme.colors.error.main;
    if (props.success) return theme.colors.accent.main;
    return theme.colors.text.secondary;
  }};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const CharacterCount = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => (props.exceeded ? theme.colors.error.main : theme.colors.text.hint)};
  margin-left: auto;
`;

const Input = forwardRef(
  (
    {
      label,
      helperText,
      error,
      success,
      required = false,
      size = 'md',
      leftIcon,
      rightIcon,
      type = 'text',
      maxLength,
      showCharacterCount = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleChange = e => {
      setValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const characterCount = value.length;
    const isCharacterCountExceeded = maxLength && characterCount > maxLength;

    return (
      <InputWrapper className={className}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        <InputContainer>
          {leftIcon && (
            <IconContainer left error={error} success={success}>
              {leftIcon}
            </IconContainer>
          )}

          <StyledInput
            ref={ref}
            id={id}
            type={inputType}
            size={size}
            error={error}
            success={success}
            $hasLeftIcon={!!leftIcon}
            $hasRightIcon={!!rightIcon || isPassword}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            {...props}
          />

          {isPassword && (
            <IconContainer
              right
              clickable
              onClick={togglePasswordVisibility}
              error={error}
              success={success}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </IconContainer>
          )}

          {rightIcon && !isPassword && (
            <IconContainer right error={error} success={success}>
              {rightIcon}
            </IconContainer>
          )}
        </InputContainer>

        {(helperText || error || success || showCharacterCount) && (
          <HelperText error={error} success={success}>
            {error && <AlertCircle size={16} />}
            {success && <CheckCircle size={16} />}
            <span>{error || success || helperText}</span>
            {showCharacterCount && maxLength && (
              <CharacterCount exceeded={isCharacterCountExceeded}>
                {characterCount}/{maxLength}
              </CharacterCount>
            )}
          </HelperText>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
