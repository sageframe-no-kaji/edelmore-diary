import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Spread from './Spread.svelte';

afterEach(() => cleanup());

async function clickAndCompleteFlip(buttonName: string, container: HTMLElement): Promise<void> {
  // rAF must run synchronously so the transitionend listener gets attached.
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  await userEvent.click(screen.getByRole('button', { name: buttonName }));
  const leaf = container.querySelector('.leaf') as HTMLElement;
  leaf.dispatchEvent(new Event('transitionend'));
  vi.unstubAllGlobals();
}

describe('Spread click zones', () => {
  it('calls onFlipPrev when the prev zone button is clicked and animation completes', async () => {
    const onFlipPrev = vi.fn();
    const { container } = render(Spread, { props: { onFlipPrev, onFlipNext: vi.fn() } });
    await clickAndCompleteFlip('Previous page', container);
    expect(onFlipPrev).toHaveBeenCalledOnce();
  });

  it('calls onFlipNext when the next zone button is clicked and animation completes', async () => {
    const onFlipNext = vi.fn();
    const { container } = render(Spread, { props: { onFlipPrev: vi.fn(), onFlipNext } });
    await clickAndCompleteFlip('Next page', container);
    expect(onFlipNext).toHaveBeenCalledOnce();
  });

  it('disables the prev zone button when canFlipPrev is false', () => {
    render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), canFlipPrev: false },
    });
    expect(
      (screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('disables the next zone button when canFlipNext is false', () => {
    render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), canFlipNext: false },
    });
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  it('enables both zone buttons when canFlipPrev and canFlipNext are true', () => {
    render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), canFlipPrev: true, canFlipNext: true },
    });
    expect(
      (screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled
    ).toBe(false);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });
});

describe('Spread page-edge stacks', () => {
  it('renders no stack leaves when spreadIndex and spreadCount are 0', () => {
    const { container } = render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), spreadIndex: 0, spreadCount: 0 },
    });
    expect(container.querySelectorAll('.stack-leaf')).toHaveLength(0);
  });

  it('renders left stack leaves equal to spreadIndex (up to MAX_STACK)', () => {
    const { container } = render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), spreadIndex: 3, spreadCount: 10 },
    });
    expect(container.querySelectorAll('.stack-left .stack-leaf')).toHaveLength(3);
  });

  it('renders right stack leaves equal to remaining spreads', () => {
    const { container } = render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), spreadIndex: 3, spreadCount: 10 },
    });
    // 10 - 3 - 1 = 6 remaining
    expect(container.querySelectorAll('.stack-right .stack-leaf')).toHaveLength(6);
  });

  it('caps stack layers at MAX_STACK (12) regardless of spreadCount', () => {
    const { container } = render(Spread, {
      props: { onFlipPrev: vi.fn(), onFlipNext: vi.fn(), spreadIndex: 500, spreadCount: 1000 },
    });
    expect(container.querySelectorAll('.stack-left .stack-leaf')).toHaveLength(12);
    expect(container.querySelectorAll('.stack-right .stack-leaf')).toHaveLength(12);
  });
});
