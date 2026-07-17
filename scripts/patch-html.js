const fs = require('fs')
const path = require('path')

const distHtml = path.join(__dirname, '..', 'dist', 'index.html')
let html = fs.readFileSync(distHtml, 'utf-8')

// Phone-frame CSS
html = html.replace(
  /<style id="expo-reset">[\s\S]*?<\/style>/,
  `<style id="expo-reset">
      * { box-sizing: border-box; }
      html, body { height: 100%; margin: 0; padding: 0; background: radial-gradient(ellipse at 25% 15%, #c7d2fe 0%, #dbeafe 40%, #e0e7ff 100%); }
      body { overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: -apple-system, system-ui, sans-serif; }
      .phone-frame { display: flex; flex-direction: column; height: 844px; width: 390px; flex: 0 0 auto; border-radius: 52px; overflow: hidden; position: relative; box-shadow: 0 0 0 10px #1a1a1a, 0 0 0 13px #2d2d2d, 0 40px 80px rgba(10,34,64,0.28), 0 0 60px rgba(99,102,241,0.12); }
      .status-bar { background: linear-gradient(145deg, #0A2240 0%, #0D3060 100%); padding: 14px 28px 6px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; z-index: 5; }
      .status-bar .time { color: #fff; font-size: 14px; font-weight: 800; }
      .status-bar .island { width: 96px; height: 28px; background: #111; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; }
      .status-bar .island::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #333; }
      .status-bar .island::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #222; }
      .status-bar .icons { display: flex; gap: 5px; align-items: center; color: rgba(255,255,255,0.8); font-size: 12px; }
      #root { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
      .home-indicator { background: #fff; padding: 6px 0 10px; display: flex; justify-content: center; flex-shrink: 0; }
      .home-indicator::after { content: ''; width: 128px; height: 5px; background: #1E293B; border-radius: 4px; opacity: 0.18; }
      @media (max-width: 430px) { body { background: #fff; } .phone-frame { width: 100vw; height: 100vh; border-radius: 0; box-shadow: none; } }
    </style>`
)

// Relative paths
html = html.replace(/href="\//g, 'href="./')
html = html.replace(/src="\//g, 'src="./')

// Phone-frame wrapper
const bodyContent = html.match(/<body>[\s\S]*?<\/body>/)?.[0] || ''
if (!bodyContent.includes('phone-frame')) {
  html = html.replace(
    /<body>[\s\S]*?<\/body>/,
    `<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div class="phone-frame">
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="island"></div>
        <div class="icons"><span>&#9679;&#9679;&#9679;&#9679;</span> <span>&#128267;</span></div>
      </div>
      <div id="root"></div>
      <div class="home-indicator"></div>
    </div>
  <script src="./_expo/static/js/web/index-f6b0037b24c33c0fe12751c9de7f2ffc.js" defer></script>
  <script>document.addEventListener('click',function(){sessionStorage.setItem('_activity',Date.now())})</script>
</body>`
  )
}

// Fix JS hash if different
const jsMatch = html.match(/src="\.\/_expo\/static\/js\/web\/index-[\w\d]+\.js"/)
const bodyJsMatch = bodyContent.match(/src="\.\/_expo\/static\/js\/web\/index-[\w\d]+\.js"/)
if (jsMatch && bodyJsMatch && jsMatch[0] !== bodyJsMatch[0]) {
  html = html.replace(bodyJsMatch[0], jsMatch[0])
}

// Activity tracking (ensure it's there)
if (!html.includes('_activity')) {
  html = html.replace('</body>', '<script>document.addEventListener(\'click\',function(){sessionStorage.setItem(\'_activity\',Date.now())})</script>\n</body>')
}

fs.writeFileSync(distHtml, html)
console.log('patched dist/index.html')
