<svelte:head>
  <title>Edelmore — a book of your own</title>
  <meta name="description" content="A cottage-core private diary for children — book-shaped, voice-first, kept on your own machine.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap" rel="stylesheet">
</svelte:head>

<div class="landing">

  <!-- ── Header ── -->
  <header>
    <div class="wrap hdr-inner">
      <a class="wordmark" href="/welcome">Edelmore</a>
      <nav>
        <a href="#what">what it is</a>
        <a href="#story">the diary</a>
        <a class="nav-cta" href="/login">open the diary →</a>
      </nav>
    </div>
  </header>

  <!-- ── Hero ── -->
  <section class="hero">
    <div class="wrap">
      <div class="medallion-wrap">
        <img src="/edelmore.png" alt="Edelmore — a book of your own" class="medallion">
      </div>
      <p class="label">A diary for the self</p>
      <h1>A book of your own.</h1>
      <p class="lead">Edelmore is a private diary shaped like a book. It opens to today's page. Pages turn. Voice transcription handles the writing for hands that struggle with the keyboard. It runs on a parent's homelab — and nobody reads it but the person who wrote it.</p>
      <div class="demo-box">
        <p class="demo-label">Demo access</p>
        <div class="demo-row"><span class="demo-key">username</span><span class="demo-val">TAYLOR</span></div>
        <div class="demo-row"><span class="demo-key">pin</span><span class="demo-val">1313</span></div>
      </div>
      <div class="cta-row">
        <a class="btn" href="/login">Open the diary <span class="arrow">→</span></a>
        <span class="cta-note">resets nightly · no account required</span>
      </div>
    </div>
  </section>

  <!-- ── First session ── -->
  <section class="quote-band">
    <div class="wrap">
      <blockquote>
        You open your laptop, navigate to edelmore, and a book is waiting on a wooden surface — your book, your cover, your name in serif type. You tap it. The cover lifts and the book falls open to today's page. The date is in the upper corner. The page is blank.
        <cite>— the first session</cite>
      </blockquote>
    </div>
  </section>

  <!-- ── What ── -->
  <section id="what">
    <div class="wrap">
      <p class="label">What Edelmore is</p>
      <h2>A diary shaped like a book.</h2>
      <p style="margin-top:1.2rem;">Each user has their own cover, their own pages, their own quiet space. Opening the book lands on today's page. Pages turn with an animation. A calendar overlay walks you backward through prior days. A table of contents on the first page lists every entry by date.</p>
      <div class="cards">
        <div class="card">
          <span class="card-glyph">📖</span>
          <h3>Book-shaped</h3>
          <p>Real page-turn animations, customizable covers, a table of contents, a calendar. It looks like a book because it is one.</p>
        </div>
        <div class="card">
          <span class="card-glyph">🎙</span>
          <h3>Voice-first</h3>
          <p>Press the mic, talk, press it again — your words appear at the cursor. Have a page read back aloud with per-word highlighting. Both are optional; everything else works without them.</p>
        </div>
        <div class="card">
          <span class="card-glyph">🔒</span>
          <h3>Yours alone</h3>
          <p>No cloud. No sharing. A 4-digit PIN keeps siblings out of each other's books. It runs on your homelab and travels with you over Tailscale.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Story (dark) ── -->
  <section id="story" class="dark">
    <div class="wrap">
      <p class="label">The story behind it</p>
      <h2>Built for a 13-year-old who wanted her own Anne Frank.</h2>
      <div class="story-grid">
        <div class="body">
          <p>Existing diary tools fail in different directions. Day One stores entries on someone else's server. Apple Notes and Google Docs are utilitarian — fine for a grocery list, wrong for an inner life. Paper journals are beautiful but ungenerous to anyone whose hands don't cooperate with a pen.</p>
          <p>Edelmore was built for a child who wanted to keep a diary on her own terms, in the shape of a thing that already meant something to her.</p>
          <p>Voice is the accessibility commitment behind the build: transcription (Whisper) and read-aloud narration (Kokoro TTS) are optional external services. Point the diary at them if you run them; leave them unconfigured and everything else works unchanged.</p>
          <div class="feature-row">
            <span class="chip">PIN auth</span>
            <span class="chip">page-turn animation</span>
            <span class="chip">voice transcription</span>
            <span class="chip">read-aloud narration</span>
            <span class="chip">calendar + TOC</span>
            <span class="chip">custom covers</span>
          </div>
        </div>
        <div class="not-list">
          <p class="not-title">What it is not</p>
          <ul>
            <li>A journal with prompts, mood tracking, or AI interlocution</li>
            <li>A sharing platform — no concept of sharing an entry</li>
            <li>A cloud service — runs on your homelab, full stop</li>
            <li>A tutorial product — meant to be picked up and used</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Final CTA ── -->
  <section class="final">
    <div class="wrap">
      <h2>Write the thing that happened today.</h2>
      <span class="tagline">This demo resets nightly. Taylor's diary is waiting.</span>
      <div class="demo-box demo-box-light">
        <div class="demo-row"><span class="demo-key">username</span><span class="demo-val">TAYLOR</span></div>
        <div class="demo-row"><span class="demo-key">pin</span><span class="demo-val">1313</span></div>
      </div>
      <div><a class="btn" href="/login">Open the diary <span class="arrow">→</span></a></div>
    </div>
  </section>

  <!-- ── Footer ── -->
  <footer>
    <div class="wrap ftr-inner">
      <span class="fnote">Edelmore — part of <a href="https://sageframe.net" target="_blank" rel="noopener">Sageframe</a> · built by <a href="https://atmarcus.net" target="_blank" rel="noopener">Andrew Todd Marcus</a></span>
      <span class="demo-pill">Demo · resets nightly</span>
    </div>
  </footer>

</div>

<style>
  :global(body) { margin: 0; padding: 0; }

  .landing {
    --ink: #1a1a1a;
    --ink-light: #4a4a4a;
    --ink-muted: #7a7a7a;
    --ground: #f5f2ed;
    --ground-warm: #ebe6dd;
    --white: #faf8f4;
    --accent: #c45a2d;
    --rule: #d0c9be;
    --dark-bg: #1a1a1a;
    --dark-text: #c8c2b8;
    --dark-prose: #b0a99e;
    --dark-muted: #888;
    --dark-rule: #333;
    --display: 'DM Serif Display', Georgia, serif;
    --body: 'IBM Plex Sans', -apple-system, sans-serif;
    --mono: 'IBM Plex Mono', 'Courier New', monospace;
    --max: 1080px;
    --gutter: clamp(1.5rem, 5vw, 4rem);

    font-family: var(--body);
    background: var(--ground);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
    min-height: 100vh;
  }

  a { color: var(--accent); text-decoration: none; transition: color .2s ease; }
  a:hover { color: var(--ink); }

  .wrap { max-width: var(--max); margin: 0 auto; padding-left: var(--gutter); padding-right: var(--gutter); }

  /* ── Header ── */
  header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(245, 242, 237, .92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--rule);
  }
  .hdr-inner { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; padding-bottom: 1rem; }
  .wordmark { font-family: var(--mono); font-size: .85rem; font-weight: 500; letter-spacing: .02em; color: var(--ink); }
  nav { display: flex; align-items: center; gap: 1.75rem; }
  nav a { font-family: var(--mono); font-size: .78rem; letter-spacing: .04em; color: var(--ink-muted); }
  nav a:hover { color: var(--ink); }
  .nav-cta { color: var(--accent) !important; font-weight: 500; }

  /* ── Sections ── */
  section { padding: clamp(3.5rem, 9vh, 6.5rem) 0; }
  .label { font-family: var(--body); font-size: .8rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 1.1rem; }
  h1 { font-family: var(--display); font-weight: 400; font-size: clamp(2.6rem, 6vw, 4rem); line-height: 1.12; letter-spacing: -.01em; }
  h2 { font-family: var(--display); font-weight: 400; font-size: clamp(1.7rem, 3.2vw, 2.3rem); line-height: 1.22; }
  h3 { font-family: var(--display); font-weight: 400; font-size: 1.2rem; line-height: 1.3; }
  p { color: var(--ink-light); font-size: 1.05rem; max-width: 640px; }
  .lead { font-size: 1.18rem; }

  /* ── Hero ── */
  .hero { padding-top: clamp(3rem, 8vh, 5rem); text-align: center; }
  .medallion-wrap { margin-bottom: 2rem; }
  .medallion { width: clamp(180px, 28vw, 280px); height: auto; display: inline-block; }
  .hero .label { margin-bottom: .8rem; }
  .hero h1 { margin: 0 auto .5rem; max-width: 14ch; }
  .hero p { margin: 1.4rem auto 0; }
  .cta-row { margin-top: 2.4rem; display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; }
  .cta-note { font-family: var(--mono); font-size: .72rem; letter-spacing: .04em; color: var(--ink-muted); }

  /* ── Demo box ── */
  .demo-box {
    display: inline-block;
    margin: 2rem auto 0;
    background: var(--dark-bg);
    border-radius: 3px;
    padding: 1rem 1.6rem;
    text-align: left;
  }
  .demo-label { font-family: var(--mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--dark-muted); margin-bottom: .6rem; max-width: none; }
  .demo-row { display: flex; gap: 1.5rem; align-items: baseline; margin-bottom: .3rem; }
  .demo-row:last-child { margin-bottom: 0; }
  .demo-key { font-family: var(--mono); font-size: .72rem; letter-spacing: .04em; color: var(--dark-muted); min-width: 4.5rem; }
  .demo-val { font-family: var(--mono); font-size: 1rem; font-weight: 500; color: var(--dark-text); letter-spacing: .08em; }
  .demo-box-light {
    background: var(--ground-warm);
    border: 1px solid var(--rule);
    margin: 1.5rem auto 2rem;
  }
  .demo-box-light .demo-key { color: var(--ink-muted); }
  .demo-box-light .demo-val { color: var(--ink); }

  /* ── Button ── */
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    font-family: var(--mono); font-size: .85rem; font-weight: 500; letter-spacing: .02em;
    padding: .85rem 1.4rem; border-radius: 2px;
    background: var(--accent); color: var(--white);
    transition: transform .2s ease, background .2s ease;
  }
  .btn:hover { color: var(--white); background: #a84a22; transform: translateY(-1px); }
  .arrow { transition: transform .2s ease; }
  .btn:hover .arrow { transform: translateX(4px); }

  /* ── Quote band ── */
  .quote-band { background: var(--ground-warm); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
  blockquote { font-family: var(--display); font-size: clamp(1.2rem, 2.4vw, 1.6rem); line-height: 1.5; color: var(--ink); max-width: 720px; font-style: italic; }
  blockquote cite { display: block; margin-top: 1.2rem; font-family: var(--mono); font-style: normal; font-size: .75rem; letter-spacing: .04em; color: var(--ink-muted); }

  /* ── Cards ── */
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
  .card { background: var(--white); border: 1px solid var(--rule); border-radius: 2px; padding: 1.6rem; transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
  .card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
  .card-glyph { font-size: 1.3rem; display: block; margin-bottom: .5rem; }
  .card h3 { margin: .35rem 0 .7rem; }
  .card p { font-size: .9rem; color: var(--ink-muted); max-width: none; }

  /* ── Dark / story ── */
  .dark { background: var(--dark-bg); color: var(--dark-prose); }
  .dark .label { color: var(--dark-muted); }
  .dark h2 { color: var(--ground); }
  .dark p { color: var(--dark-prose); max-width: 560px; }
  .dark p + p { margin-top: 1.1rem; }
  .story-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(2rem, 5vw, 4rem); align-items: start; margin-top: 2rem; }
  @media (max-width: 760px) { .story-grid { grid-template-columns: 1fr; } }
  .feature-row { margin-top: 1.6rem; display: flex; flex-wrap: wrap; gap: .5rem; }
  .chip { font-family: var(--mono); font-size: .7rem; letter-spacing: .03em; color: var(--dark-text); border: 1px solid var(--dark-rule); border-radius: 2px; padding: .35rem .7rem; }
  .not-list { border-left: 1px solid var(--dark-rule); padding-left: 1.4rem; }
  .not-title { font-family: var(--body); font-size: .78rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--dark-muted); margin-bottom: 1rem; max-width: none; }
  .not-list ul { list-style: none; padding: 0; margin: 0; }
  .not-list li { font-size: .95rem; color: var(--dark-text); margin-bottom: .9rem; position: relative; padding-left: 1rem; }
  .not-list li::before { content: '—'; position: absolute; left: 0; color: var(--dark-muted); }

  /* ── Final CTA ── */
  .final { background: var(--ground-warm); border-top: 1px solid var(--rule); text-align: center; }
  .final h2 { margin-bottom: .5rem; }
  .tagline { font-family: var(--display); font-style: italic; color: var(--ink-muted); font-size: 1.15rem; display: block; margin-bottom: 1.5rem; }

  /* ── Footer ── */
  footer { border-top: 1px solid var(--rule); padding: 2.5rem 0; }
  .ftr-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .fnote { font-family: var(--mono); font-size: .72rem; color: var(--ink-muted); }
  .fnote a { font-size: inherit; }
  .demo-pill { font-family: var(--mono); font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); border: 1px solid var(--accent); border-radius: 2px; padding: .25rem .6rem; }
</style>
