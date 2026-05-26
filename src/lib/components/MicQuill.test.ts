import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MicQuill from './MicQuill.svelte';

describe('MicQuill', () => {
  it('renders a button in idle state with the start-recording label', () => {
    const { getByRole } = render(MicQuill, { props: { oninsert: vi.fn() } });
    const button = getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Start voice writing');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('renders an SVG quill icon', () => {
    const { container } = render(MicQuill, { props: { oninsert: vi.fn() } });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(container.querySelector('.quill-feather')).not.toBeNull();
    expect(container.querySelector('.quill-shaft')).not.toBeNull();
    expect(container.querySelector('.quill-nib')).not.toBeNull();
  });
});
