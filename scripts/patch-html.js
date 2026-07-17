const fs = require('fs')
const path = require('path')

const distHtml = path.join(__dirname, '..', 'dist', 'index.html')
let html = fs.readFileSync(distHtml, 'utf-8')

// Phone-frame CSS
html = html.replace(
  /<style id="expo-reset">[\s\S]*?<\/style>/,
  `<style id="expo-reset">
      * { box-sizing: border-box; }
      html, body { height: 100%; margin: 0; padding: 0; background: #14141f; }
      body { overflow: hidden; display: flex; align-items: center; justify-content: center; }
      #root { display: flex; height: 844px; width: 390px; flex: 0 0 auto; border-radius: 44px; overflow: hidden; position: relative; box-shadow: 0 0 0 8px #1e1e2e, 0 0 0 10px #2a2a3a, 0 20px 60px rgba(0,0,0,0.8); }
      @media (max-width: 430px) { body { background: #fff; } #root { width: 100vw; height: 100vh; border-radius: 0; box-shadow: none; } }
    </style>`
)

// Relative paths
html = html.replace(/href="\//g, 'href="./')
html = html.replace(/src="\//g, 'src="./')

// Activity tracking
if (!html.includes('_activity')) {
  html = html.replace('</body>', '<script>document.addEventListener(\'click\',function(){sessionStorage.setItem(\'_activity\',Date.now())})</script>\n</body>')
}

fs.writeFileSync(distHtml, html)
console.log('patched dist/index.html')
