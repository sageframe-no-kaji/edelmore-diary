<script lang="ts">
import { formatDisplayDate } from '$lib/dates.js';
import type { EntryDatePreview } from '$lib/db.js';

type Props = {
  entries: EntryDatePreview[];
  onNavigate: (date: string) => void;
};

const { entries, onNavigate }: Props = $props();
</script>

<div class="px-8 py-10 h-full overflow-y-auto">
  <h2 class="font-serif text-xs text-ornament-gold uppercase tracking-widest mb-6 border-b border-cream-200 pb-3">
    Contents
  </h2>

  {#if entries.length === 0}
    <p class="font-serif text-xs text-cream-500 italic">No entries yet.</p>
  {:else}
    <ul class="space-y-3">
      {#each entries as entry}
        <li>
          <button
            type="button"
            onclick={() => onNavigate(entry.entry_date)}
            class="w-full text-left font-serif text-xs text-ink-900 hover:text-ornament-gold transition-colors"
          >
            {formatDisplayDate(entry.entry_date)}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
