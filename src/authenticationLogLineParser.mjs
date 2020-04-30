import peg from 'pegjs'
import path from 'path'
import fs from 'fs'
import url from 'url'

const grammarPath = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    './authenticationLogLine.pegjs'
)
const grammar = String(fs.readFileSync(grammarPath))
const parser = peg.generate(grammar)

export default parser
