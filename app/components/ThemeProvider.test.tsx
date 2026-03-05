import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('should default to dark theme and toggle to light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    // Check initial state
    expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    
    // Click the toggle button
    fireEvent.click(screen.getByText('Toggle'));
    
    // Check updated state
    expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
  });
});
