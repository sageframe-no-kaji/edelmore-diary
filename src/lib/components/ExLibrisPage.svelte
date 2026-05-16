<script lang="ts">
type Props = { username: string };
const { username }: Props = $props();
</script>

<div class="page">
  <!-- Parchment grain -->
  <svg class="abs-fill" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="parch-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65 0.55" numOctaves="4" seed="7" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#parch-grain)" opacity="0.06"/>
  </svg>

  <!-- Sepia border -->
  <svg
    class="abs-fill"
    viewBox="0 0 300 400"
    preserveAspectRatio="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="18" y="18" width="264" height="364" fill="none" stroke="#5c3d1e" stroke-width="1.1"/>
    <rect x="24" y="24" width="252" height="352" fill="none" stroke="#5c3d1e" stroke-width="0.5"/>

    <!-- Corner L-brackets -->
    <path d="M18,38 L18,18 L38,18"   fill="none" stroke="#5c3d1e" stroke-width="0.8" stroke-linecap="round"/>
    <path d="M282,38 L282,18 L262,18" fill="none" stroke="#5c3d1e" stroke-width="0.8" stroke-linecap="round"/>
    <path d="M18,362 L18,382 L38,382" fill="none" stroke="#5c3d1e" stroke-width="0.8" stroke-linecap="round"/>
    <path d="M282,362 L282,382 L262,382" fill="none" stroke="#5c3d1e" stroke-width="0.8" stroke-linecap="round"/>

    <!-- Mid-edge dots -->
    <circle cx="150" cy="18" r="2"   fill="#5c3d1e"/>
    <circle cx="150" cy="382" r="2"  fill="#5c3d1e"/>
    <circle cx="18"  cy="200" r="2"  fill="#5c3d1e"/>
    <circle cx="282" cy="200" r="2"  fill="#5c3d1e"/>
  </svg>

  <!-- Bookplate content -->
  <div class="plate">
    <p class="ex-libris">Ex Libris</p>
    <div class="rule"></div>
    <p class="owner">{username}</p>
    <img src="/edelweiss.svg" class="icon" width="38" height="38" alt="" aria-hidden="true" />
  </div>
</div>

<style>
  .page {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f0e5cc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .abs-fill {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .plate {
    position: relative;
    z-index: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    padding: 0 2.5rem;
  }

  .ex-libris {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(0.55rem, 1.3vw, 0.7rem);
    letter-spacing: 0.6em;
    font-style: italic;
    color: #5c3d1e;
    margin: 0;
    opacity: 0.75;
  }

  .rule {
    width: 4rem;
    height: 1px;
    background: #5c3d1e;
    opacity: 0.4;
  }

  .owner {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: clamp(1.2rem, 3.2vw, 1.9rem);
    font-weight: 500;
    color: #3d2a14;
    margin: 0;
    letter-spacing: 0.08em;
    text-align: center;
  }

  .icon {
    opacity: 0.6;
    margin-top: 0.2rem;
  }
</style>
