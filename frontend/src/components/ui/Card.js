import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['shadow', 'rounded', 'bordered', 'hoverable', 'clickable', 'fullHeight'].includes(prop)
})`
  background: ${theme.colors.white};
  border-radius: ${props => {
    switch (props.rounded) {
      case 'sm': return theme.borderRadius.md;
      case 'lg': return theme.borderRadius['2xl'];
      case 'xl': return theme.borderRadius['3xl'];
      default: return theme.borderRadius.xl;
    }
  }};
  box-shadow: ${props => {
    switch (props.shadow) {
      case 'none': return theme.shadows.none;
      case 'sm': return theme.shadows.sm;
      case 'md': return theme.shadows.md;
      case 'lg': return theme.shadows.lg;
      case 'xl': return theme.shadows.xl;
      default: return theme.shadows.base;
    }
  }};
  border: ${props => props.bordered ? `1px solid ${theme.colors.grey[200]}` : 'none'};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  
  ${props => props.hoverable && `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.clickable && `
    cursor: pointer;
    
    &:hover {
      box-shadow: ${theme.shadows.md};
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
  
  ${props => props.fullHeight && `
    height: 100%;
  `}
`;

const CardHeader = styled.div`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${theme.spacing[3]} ${theme.spacing[4]}`;
      case 'lg': return `${theme.spacing[6]} ${theme.spacing[8]}`;
      default: return `${theme.spacing[4]} ${theme.spacing[6]}`;
    }
  }};
  border-bottom: ${props => props.divider ? `1px solid ${theme.colors.grey[200]}` : 'none'};
  
  ${props => props.centered && `
    text-align: center;
  `}
`;

const CardBody = styled.div`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${theme.spacing[3]} ${theme.spacing[4]}`;
      case 'lg': return `${theme.spacing[6]} ${theme.spacing[8]}`;
      default: return `${theme.spacing[4]} ${theme.spacing[6]}`;
    }
  }};
  
  ${props => props.noPadding && `
    padding: 0;
  `}
  
  ${props => props.centered && `
    text-align: center;
  `}
`;

const CardFooter = styled.div`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return `${theme.spacing[3]} ${theme.spacing[4]}`;
      case 'lg': return `${theme.spacing[6]} ${theme.spacing[8]}`;
      default: return `${theme.spacing[4]} ${theme.spacing[6]}`;
    }
  }};
  border-top: ${props => props.divider ? `1px solid ${theme.colors.grey[200]}` : 'none'};
  background: ${props => props.muted ? theme.colors.grey[50] : 'transparent'};
  
  ${props => props.centered && `
    text-align: center;
  `}
`;

const CardImage = styled.div`
  width: 100%;
  height: ${props => props.height || '200px'};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  ${props => props.overlay && `
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${props.overlay};
    }
  `}
`;

const CardTitle = styled.h3`
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return theme.typography.fontSize.lg;
      case 'lg': return theme.typography.fontSize['2xl'];
      default: return theme.typography.fontSize.xl;
    }
  }};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: ${theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[3]} 0;
  line-height: ${theme.typography.lineHeight.normal};
`;

const CardText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.normal};
  margin: 0 0 ${theme.spacing[3]} 0;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.full};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.wide};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[800]};
        `;
      case 'accent':
        return `
          background: ${theme.colors.accent[100]};
          color: ${theme.colors.accent[800]};
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[800]};
        `;
      case 'error':
        return `
          background: ${theme.colors.error[100]};
          color: ${theme.colors.error[800]};
        `;
      default:
        return `
          background: ${theme.colors.grey[100]};
          color: ${theme.colors.grey[800]};
        `;
    }
  }}
`;

// Main Card Component
const Card = ({ 
  children, 
  shadow = 'base',
  rounded = 'md',
  bordered = false,
  hoverable = false,
  clickable = false,
  fullHeight = false,
  className,
  onClick,
  ...props 
}) => {
  return (
    <StyledCard
      shadow={shadow}
      rounded={rounded}
      bordered={bordered}
      hoverable={hoverable}
      clickable={clickable}
      fullHeight={fullHeight}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

// Export all components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Text = CardText;
Card.Badge = CardBadge;

export default Card;
export {
  CardHeader,
  CardBody,
  CardFooter,
  CardImage,
  CardTitle,
  CardSubtitle,
  CardText,
  CardBadge
};