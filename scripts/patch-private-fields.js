const fs = require('fs')
const path = require('path')

function patchFile(filePath, pkgName) {
  if (!fs.existsSync(filePath)) {
    return
  }

  let code = fs.readFileSync(filePath, 'utf8')

  // Collect all private field names (#foo) in class bodies
  const privateFields = new Set()
  const privateRe = /#(\w+)\s*[=;]/g
  let m
  while ((m = privateRe.exec(code)) !== null) {
    privateFields.add(m[1])
  }

  if (privateFields.size === 0) {
    return
  }

  // Replace #name with _name in all contexts (this.#foo → this._foo, #foo → _foo)
  for (const name of privateFields) {
    code = code.replace(new RegExp(`#${name}`, 'g'), '_' + name)
  }

  fs.writeFileSync(filePath, code, 'utf8')
  console.log(`[patch] ${pkgName}: replaced ${privateFields.size} private fields: ${[...privateFields].join(', ')}`)
}

// Find ALL JS files in node_modules (up to depth 8) that contain # fields
const nmDir = path.resolve(__dirname, '..', 'node_modules')

function walk(dirpath, depth) {
  if (depth > 8) return
  let entries
  try { entries = fs.readdirSync(dirpath, { withFileTypes: true }) } catch { return }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dirpath, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') walk(full, depth + 1)
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      if (fs.statSync(full).size > 500000) continue // skip large files (>500KB)
      try {
        let header = ''
        const fd = fs.openSync(full, 'r')
        const buf = Buffer.alloc(50000)
        const bytesRead = fs.readSync(fd, buf, 0, 50000, 0)
        fs.closeSync(fd)
        header = buf.toString('utf8', 0, bytesRead)
        if (/#\w+\s*[=;]/.test(header) || /#\w+\s*:/.test(header)) {
          const rel = path.relative(nmDir, full)
          patchFile(full, rel)
        }
      } catch { /* skip unreadable */ }
    }
  }
}
walk(nmDir, 0)
