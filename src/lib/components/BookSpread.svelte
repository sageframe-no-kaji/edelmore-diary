<script lang="ts">
import { goto } from '$app/navigation';
import { type BookflipInstance, bookflip } from '$lib/bookflip.js';
import type { EntryDatePreview } from '$lib/db.js';
import CalendarModal from './CalendarModal.svelte';
import TocPage from './TocPage.svelte';

type Props = {
  content: string;
  date: string;
  displayDate: string;
  prevDate: string;
  prevContent: string;
  prevDisplayDate: string;
  nextDate: string;
  saved: boolean;
  entryDatePreviews: EntryDatePreview[];
  onContentChange: (value: string) => void;
};

const {
  content,
  date,
  displayDate,
  prevDate,
  prevContent,
  prevDisplayDate,
  nextDate,
  saved,
  entryDatePreviews,
  onContentChange,
}: Props = $props();

let flipBook: BookflipInstance | null = null;
let showCalendar = $state(false);

function openCalendar() {
  showCalendar = true;
}
function closeCalendar() {
  showCalendar = false;
}

const entryDates = $derived(new Set(entryDatePreviews.map((e) => e.entry_date)));

function handleReady(instance: BookflipInstance) {
  flipBook = instance;
}

function navigatePrev() {
  if (flipBook) {
    flipBook.flipPrev();
    setTimeout(() => goto(`/${prevDate}`), 600);
  } else {
    goto(`/${prevDate}`);
  }
}

function navigateNext() {
  if (flipBook) {
    flipBook.flipNext();
    setTimeout(() => goto(`/${nextDate}`), 600);
  } else {
    goto(`/${nextDate}`);
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (showCalendar) return;
  if (e.key === 'ArrowLeft') navigatePrev();
  if (e.key === 'ArrowRight') navigateNext();
}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if showCalendar}
  <CalendarModal
    {entryDates}
    currentDate={date}
    onClose={closeCalendar}
  />
{/if}

<!-- Mobile: single page view -->
<div class="mobile-page paper md:hidden flex min-h-screen flex-col px-6 py-10">
  <div class="mx-auto w-full max-w-lg space-y-6">
    <div class="flex items-baseline justify-between">
      <button
        type="button"
        onclick={openCalendar}
        class="font-serif text-base text-cream-700 hover:text-ornament-gold transition-colors text-left"
        aria-label="Open calendar"
      >
        {displayDate}
      </button>
      <span
        class="font-serif text-xs text-cream-500 transition-opacity duration-700 {saved
          ? 'opacity-100'
          : 'opacity-0'}"
      >
        Saved
      </span>
    </div>
    <textarea
      value={content}
      oninput={(e) => onContentChange((e.currentTarget as HTMLTextAreaElement).value)}
      class="min-h-[70vh] w-full resize-none border-none bg-transparent font-serif text-base leading-loose text-ink-900 focus:outline-none"
      placeholder="Write something…"
      spellcheck="true"
    ></textarea>
    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        onclick={navigatePrev}
        class="font-serif text-xs text-cream-500 hover:text-ornament-gold"
        aria-label="Previous day"
      >
        ← {prevDisplayDate}
      </button>
      <a href="/logout" class="font-serif text-xs text-cream-500 hover:text-cream-700">Log out</a>
    </div>
  </div>
</div>

<!-- Desktop: StPageFlip book spread -->
<div class="hidden md:flex items-center justify-center min-h-screen bg-cream-200 px-4 py-8">
  <div class="book-wrap relative" style="width: min(900px, 96vw); height: min(620px, 80vh);">
    <button
      type="button"
      onclick={navigatePrev}
      class="absolute -left-10 top-1/2 -translate-y-1/2 text-cream-600 hover:text-ornament-gold transition-colors text-2xl select-none"
      aria-label="Previous day"
    >
      ‹
    </button>
    <button
      type="button"
      onclick={navigateNext}
      class="absolute -right-10 top-1/2 -translate-y-1/2 text-cream-600 hover:text-ornament-gold transition-colors text-2xl select-none"
      aria-label="Next day"
    >
      ›
    </button>

    <div
      class="book-container w-full h-full"
      use:bookflip={{ startPage: 2, onReady: handleReady }}
    >
      <!-- Page 0: blank (left side of TOC spread) -->
      <div data-page data-density="hard" class="page paper border-r border-cream-300">
        <div class="page-inner"></div>
      </div>

      <!-- Page 1: TOC (right side of first spread — visible when flipping back) -->
      <div data-page data-density="hard" class="page paper">
        <div class="page-inner h-full overflow-hidden">
          <TocPage entries={entryDatePreviews} />
        </div>
      </div>

      <!-- Page 2: Previous day (left of main spread) -->
      <div data-page class="page paper border-r border-cream-300">
        <div class="page-inner px-10 py-10">
          <p class="font-serif text-xs text-cream-600 mb-6 border-b border-cream-200 pb-3">
            {prevDisplayDate}
          </p>
          <div class="font-serif text-sm leading-loose text-ink-900 whitespace-pre-wrap opacity-80">
            {prevContent || ''}
          </div>
        </div>
      </div>

      <!-- Page 3: Current day (right of main spread — editable) -->
      <div data-page class="page paper">
        <div class="page-inner px-10 py-10 flex flex-col h-full">
          <div class="flex items-baseline justify-between mb-6 border-b border-cream-200 pb-3">
            <button
              type="button"
              onclick={openCalendar}
              class="font-serif text-xs text-cream-700 hover:text-ornament-gold transition-colors text-left"
              aria-label="Open calendar"
            >
              {displayDate}
            </button>
            <span
              class="font-serif text-xs text-cream-500 transition-opacity duration-700 {saved
                ? 'opacity-100'
                : 'opacity-0'}"
            >
              Saved
            </span>
          </div>
          <textarea
            value={content}
            oninput={(e) => onContentChange((e.currentTarget as HTMLTextAreaElement).value)}
            class="flex-1 w-full resize-none border-none bg-transparent font-serif text-sm leading-loose text-ink-900 focus:outline-none placeholder:text-cream-400"
            placeholder="Write something…"
            spellcheck="true"
          ></textarea>
          <div class="flex justify-end pt-4">
            <a href="/logout" class="font-serif text-xs text-cream-400 hover:text-cream-600"
              >Log out</a
            >
          </div>
        </div>
      </div>

      <!-- Pages 4-5: blanks so flipNext() has room to animate -->
      <div data-page data-density="hard" class="page paper border-r border-cream-300">
        <div class="page-inner"></div>
      </div>
      <div data-page data-density="hard" class="page paper">
        <div class="page-inner"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .book-container {
    position: relative;
  }

  .page {
    display: block;
    overflow: hidden;
  }

  .page-inner {
    width: 100%;
    height: 100%;
  }
</style>
