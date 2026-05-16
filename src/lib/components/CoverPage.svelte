<script lang="ts">
import type { CoverConfig } from '$lib/covers.js';

type Props = {
  config: CoverConfig;
  username: string;
  showSettings?: boolean;
  showTitle?: boolean;
};

const { config, username, showSettings = false, showTitle = true }: Props = $props();
const a = $derived(config.palette.accent);
</script>

<div
  class="cover"
  style="background-color: {config.palette.background};"
>
  <!-- Leather depth: subtle radial variation that works on any dark base -->
  <div class="leather-sheen"></div>

  <!-- Fine grain texture -->
  <svg class="abs-fill" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="grain-{config.id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="linearRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.72 0.62" numOctaves="4" seed="5" stitchTiles="stitch" result="noise"/>
        <feColorMatrix in="noise" type="saturate" values="0" result="grey"/>
        <feBlend in="SourceGraphic" in2="grey" mode="soft-light" result="blended"/>
        <feComposite in="blended" in2="SourceGraphic" operator="in"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#grain-{config.id})" opacity="0.22"/>
  </svg>

  <!-- Gold tooled border: preserveAspectRatio="none" so rules always fill the page -->
  <svg
    class="abs-fill"
    viewBox="0 0 300 400"
    preserveAspectRatio="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Triple nested rule -->
    <rect x="14" y="14" width="272" height="372" fill="none" stroke="{a}" stroke-width="1.5"/>
    <rect x="20" y="20" width="260" height="360" fill="none" stroke="{a}" stroke-width="0.7"/>
    <rect x="26" y="26" width="248" height="348" fill="none" stroke="{a}" stroke-width="0.5"/>

    <!-- Corner diamonds on outer rule -->
    <path d="M14,8 L20,14 L14,20 L8,14Z"       fill="{a}"/>
    <path d="M286,8 L292,14 L286,20 L280,14Z"   fill="{a}"/>
    <path d="M14,380 L20,386 L14,392 L8,386Z"   fill="{a}"/>
    <path d="M286,380 L292,386 L286,392 L280,386Z" fill="{a}"/>

    <!-- Mid-edge marks -->
    <path d="M150,10 L153,14 L150,18 L147,14Z"  fill="{a}"/>
    <path d="M150,382 L153,386 L150,390 L147,386Z" fill="{a}"/>
    <path d="M10,200 L14,203 L18,200 L14,197Z"  fill="{a}"/>
    <path d="M282,200 L286,203 L290,200 L286,197Z" fill="{a}"/>

    <!-- Inner corner L-brackets -->
    <path d="M26,44 L26,26 L44,26"   fill="none" stroke="{a}" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M274,44 L274,26 L256,26" fill="none" stroke="{a}" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M26,356 L26,374 L44,374" fill="none" stroke="{a}" stroke-width="0.9" stroke-linecap="round"/>
    <path d="M274,356 L274,374 L256,374" fill="none" stroke="{a}" stroke-width="0.9" stroke-linecap="round"/>
  </svg>

  {#if showTitle}
    <div class="title-block">
      <p class="name" style="color: {config.palette.text};">{username}</p>
      <div class="rule" style="background: {config.palette.accent};"></div>
      <p class="diary" style="color: {config.palette.subtext};">D I A R Y</p>
      {#if showSettings}
        <a href="/settings" class="settings-link" aria-label="Choose cover">
          <img src="/edelweiss.svg" width="24" height="24" alt="" />
        </a>
      {/if}
    </div>
  {:else}
    <!-- Back cover: centred diamond motif only -->
    <svg class="back-motif" viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,2 L46,24 L24,46 L2,24Z"   fill="none" stroke="{a}" stroke-width="1.2"/>
      <path d="M24,9 L39,24 L24,39 L9,24Z"   fill="none" stroke="{a}" stroke-width="0.6"/>
      <circle cx="24" cy="24" r="2.5" fill="{a}"/>
    </svg>
  {/if}
</div>

<style>
  .cover {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .leather-sheen {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 80% 55% at 30% 25%, rgba(255, 220, 140, 0.07) 0%, transparent 55%),
      radial-gradient(ellipse 65% 70% at 68% 70%, rgba(0, 0, 0, 0.28) 0%, transparent 48%),
      radial-gradient(ellipse 45% 40% at 55% 48%, rgba(0, 0, 0, 0.09) 0%, transparent 40%),
      radial-gradient(ellipse 30% 25% at 18% 78%, rgba(255, 180, 80, 0.04) 0%, transparent 35%);
    pointer-events: none;
  }

  .abs-fill {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .title-block {
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .name {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(1rem, 3.2vw, 2rem);
    font-weight: 500;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin: 0;
    line-height: 1;
  }

  .rule {
    width: 2.5rem;
    height: 1px;
    opacity: 0.65;
  }

  .diary {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(0.5rem, 1.3vw, 0.75rem);
    letter-spacing: 0.55em;
    margin: 0;
    line-height: 1;
  }

  .settings-link {
    margin-top: 0.75rem;
    opacity: 0.45;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-link:hover {
    opacity: 0.9;
  }

  .back-motif {
    position: relative;
    z-index: 1;
    width: 44px;
    height: 44px;
    opacity: 0.55;
  }
</style>
