{/* @ts-expect-error */}
import { render, screen } from '@testing-library/react';
import App from './App';

{/* @ts-expect-error */}
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  {/* @ts-expect-error */}
  expect(linkElement).toBeInTheDocument();
});
