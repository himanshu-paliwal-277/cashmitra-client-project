import styled, { keyframes } from 'styled-components';
import { theme } from '../../utils';

// Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main container
export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary[50]} 0%,
    ${theme.colors.accent[50]} 100%
  );
  padding: ${theme.spacing[4]};
`;

// Login card
export const LoginCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing[8]};
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.5s ease-out;
`;

// Brand section
export const BrandSection = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
`;

export const LogoContainer = styled.div`
  h1 {
    font-size: ${theme.typography.fontSize['3xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.primary.main};
    margin: 0 0 ${theme.spacing[1]};
    background: linear-gradient(
      135deg,
      ${theme.colors.primary.main} 0%,
      ${theme.colors.accent.main} 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  span {
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeight.medium};
  }
`;

// Header section
export const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};

  h2 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.text.primary};
    margin: 0 0 ${theme.spacing[2]};
  }

  p {
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.text.secondary};
    margin: 0;
  }
`;

// Form elements
export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

export const Input = styled.input`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid
    ${(props: any) => (props.hasError ? theme.colors.error.main : theme.colors.grey[300])};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease;
  background: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${(props: any) =>
      props.hasError ? theme.colors.error.main : theme.colors.primary.main};
    box-shadow: 0 0 0 3px
      ${(props: any) => (props.hasError ? theme.colors.error[100] : theme.colors.primary[100])};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }

  &:disabled {
    background: ${theme.colors.grey[100]};
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background: ${(props: any) =>
    props.disabled
      ? theme.colors.grey[300]
      : `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.accent.main} 100%)`};
  color: ${theme.colors.white};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: ${(props: any) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  min-height: 48px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Error message
export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.sm};
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
`;

// Loading spinner
export const LoadingSpinner = styled.div`
  width: ${(props: any) => (props.size === 'small' ? '16px' : '24px')};
  height: ${(props: any) => (props.size === 'small' ? '16px' : '24px')};
  border: 2px solid
    ${(props: any) => (props.size === 'small' ? 'rgba(255,255,255,0.3)' : theme.colors.grey[300])};
  border-top: 2px solid
    ${(props: any) => (props.size === 'small' ? theme.colors.white : theme.colors.primary.main)};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Divider
export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing[6]} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.grey[300]};
  }

  span {
    padding: 0 ${theme.spacing[4]};
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

// Link text
export const LinkText = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};

  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${theme.typography.fontWeight.medium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Feature list
export const FeatureList = styled.div`
  margin-top: ${theme.spacing[6]};
  padding-top: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.grey[200]};

  h3 {
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    margin: 0 0 ${theme.spacing[3]};
    text-align: center;
  }
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};

  &:last-child {
    margin-bottom: 0;
  }
`;
