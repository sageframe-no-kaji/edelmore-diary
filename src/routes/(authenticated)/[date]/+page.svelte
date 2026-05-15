<script lang="ts">
import BookSpread from '$lib/components/BookSpread.svelte';
import { untrack } from 'svelte';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();

let content = $state(untrack(() => data.content));
let saved = $state(false);
let serverContent = untrack(() => data.content);

// When navigating to a new date, sync content from server without triggering autosave
$effect(() => {
  const incoming = data.content;
  const _date = data.date;
  untrack(() => {
    content = incoming;
    serverContent = incoming;
  });
});

// Autosave — only fires when content differs from what the server has
$effect(() => {
  const c = content;
  if (c === serverContent) return;
  const timer = setTimeout(async () => {
    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: data.date, content: c }),
    });
    serverContent = c;
    saved = true;
    setTimeout(() => {
      saved = false;
    }, 1000);
  }, 1500);
  return () => clearTimeout(timer);
});

function handleContentChange(value: string) {
  content = value;
}
</script>

<BookSpread
  {content}
  date={data.date}
  displayDate={data.displayDate}
  prevDate={data.prevDate}
  prevContent={data.prevContent}
  prevDisplayDate={data.prevDisplayDate}
  nextDate={data.nextDate}
  {saved}
  entryDatePreviews={data.entryDatePreviews}
  onContentChange={handleContentChange}
/>
