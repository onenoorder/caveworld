import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// The real World boots a WebGL renderer, which jsdom cannot provide —
// the app shell test only verifies rendering of the game chrome.
jest.mock('./World');

test('renders the game toolbar', () => {
  render(<App />);
  expect(screen.getByAltText('Dig')).toBeInTheDocument();
});
