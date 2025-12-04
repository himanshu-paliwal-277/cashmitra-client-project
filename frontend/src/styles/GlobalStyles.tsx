import { createGlobalStyle } from 'styled-components';
import { theme } from '../theme';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset and Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.regular};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Typography Styles */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin-bottom: ${theme.spacing[4]};
    color: ${theme.colors.text.primary};
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
    
    @media (max-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.fontSize['3xl']};
    }
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
    
    @media (max-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.fontSize['2xl']};
    }
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
    
    @media (max-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.fontSize.xl};
    }
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin-bottom: ${theme.spacing[4]};
    line-height: ${theme.typography.lineHeight.normal};
  }

  /* Link Styles */
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
    
    &:hover {
      color: ${theme.colors.primary.dark};
      text-decoration: underline;
    }
    
    &:focus {
      outline: 2px solid ${theme.colors.primary.main};
      outline-offset: 2px;
      border-radius: ${theme.borderRadius.sm};
    }
  }

  /* Form Elements */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
  }

  input, textarea, select {
    border: 1px solid ${theme.colors.grey[300]};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    transition: border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
    }
    
    &:disabled {
      background-color: ${theme.colors.grey[100]};
      color: ${theme.colors.text.disabled};
      cursor: not-allowed;
    }
  }

  /* Button Reset */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    
    &:disabled {
      cursor: not-allowed;
    }
  }

  /* List Styles */
  ul, ol {
    list-style: none;
  }

  /* Image Styles */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Table Styles */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus visible for better accessibility */
  .focus-visible {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.grey[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.grey[400]};
    border-radius: ${theme.borderRadius.full};
    
    &:hover {
      background: ${theme.colors.grey[500]};
    }
  }

  /* Utility Classes */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};
    
    @media (min-width: ${theme.breakpoints.sm}) {
      padding: 0 ${theme.spacing[6]};
    }
    
    @media (min-width: ${theme.breakpoints.lg}) {
      padding: 0 ${theme.spacing[8]};
    }
  }

  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation Classes */
  .fade-in {
    animation: fadeIn ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  }

  .slide-up {
    animation: slideUp ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* About Page Animations */
  @keyframes blob {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    25% {
      transform: translate(20px, -20px) scale(1.1);
    }
    50% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    75% {
      transform: translate(20px, 20px) scale(1.05);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gradient-x {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  /* Animation Utility Classes */
  .animate-blob {
    animation: blob 7s infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
  }

  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }

  /* Animation Delay Utilities */
  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }

  .animation-delay-600 {
    animation-delay: 600ms;
  }

  .animation-delay-1000 {
    animation-delay: 1000ms;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }

  /* Print Styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    
    a, a:visited {
      text-decoration: underline;
    }
    
    img {
      max-width: 100% !important;
    }
    
    @page {
      margin: 0.5cm;
    }
  }
`;

export default GlobalStyles;
