/**
 * Format detection & pretty-printing for MQTT payloads.
 *
 * Detection cascade (most-specific / least-ambiguous first):
 *   JSON → XML → YAML → CSV → INI → Base64 → plain text
 */

import { parse as parseYAML, stringify as stringifyYAML } from "yaml"

export type PayloadFormat = "json" | "xml" | "yaml" | "csv" | "ini" | "base64" | "text"

export interface FormattedPayload {
  format: PayloadFormat
  pretty: string
}

// ---------------------------------------------------------------------------
// 1. JSON
// ---------------------------------------------------------------------------
function tryJson(payload: string): FormattedPayload | null {
  try {
    const parsed = JSON.parse(payload)
    // Only accept objects and arrays — bare scalars (numbers, booleans, strings)
    // don't benefit from being labelled "JSON".
    if (parsed === null || typeof parsed !== "object") {
      return null
    }
    return { format: "json", pretty: JSON.stringify(parsed, null, 2) }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// 2. XML
// ---------------------------------------------------------------------------
function tryXml(payload: string): FormattedPayload | null {
  const trimmed = payload.trimStart()
  if (!trimmed.startsWith("<")) {
    return null
  }
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(trimmed, "application/xml")
    if (doc.querySelector("parsererror")) {
      return null
    }
    // Pretty-print via XSLTProcessor (works in browsers; VSCode webview is
    // Chromium-based so this is fine).
    return { format: "xml", pretty: prettyXml(doc) }
  } catch {
    return null
  }
}

/** Serialize an XML Document with indentation. */
function prettyXml(doc: Document): string {
  const s = new XMLSerializer()
  const raw = s.serializeToString(doc)
  return indentXml(raw)
}

function indentXml(xml: string): string {
  let formatted = ""
  let indent = 0
  const tab = "  "
  // Split on tag boundaries while keeping the delimiters.
  const nodes = xml.replace(/>\s*</g, ">\n<").split("\n")
  for (const node of nodes) {
    const trimmed = node.trim()
    if (!trimmed) continue
    // Closing tag  → dedent before printing
    if (/^<\//.test(trimmed)) indent--
    formatted += tab.repeat(Math.max(0, indent)) + trimmed + "\n"
    // Opening (non-self-closing) tag → indent after printing
    if (/^<[^/?!][^>]*[^/]>$/.test(trimmed) || /^<[^/?!][^>]*>$/.test(trimmed)) {
      if (!/^<.*\/>$/.test(trimmed) && !/<\//.test(trimmed)) {
        indent++
      }
    }
  }
  return formatted.trim()
}

// ---------------------------------------------------------------------------
// 3. YAML
// ---------------------------------------------------------------------------

/**
 * Structural pre-check so that JSON / plain scalars are not relabelled as YAML
 * (YAML is a syntactic superset of both).
 *
 * We require at least one of:
 *  - a mapping entry:  "key: value" or "key:"
 *  - a sequence item:  "- item"
 *
 * at the start of a non-comment, non-blank line.
 */
const YAML_MAPPING_RE = /^[a-zA-Z_][a-zA-Z0-9_\- ]*\s*:/m
const YAML_SEQUENCE_RE = /^\s*-\s/m

function hasYamlStructure(payload: string): boolean {
  // Strip leading YAML document marker if present
  const s = payload.replace(/^---\s*\n?/, "")
  return YAML_MAPPING_RE.test(s) || YAML_SEQUENCE_RE.test(s)
}

function tryYaml(payload: string): FormattedPayload | null {
  if (!hasYamlStructure(payload)) {
    return null
  }
  try {
    // Use the `yaml` package (v1) which is a transitive dependency.
    // We import it lazily so the bundle only pays the cost when needed.
    const parsed = parseYAML(payload)
    if (parsed === null || typeof parsed !== "object") {
      return null
    }
    return { format: "yaml", pretty: stringifyYAML(parsed) }
  } catch (err) {
    return null
  }
}

// ---------------------------------------------------------------------------
// 4. CSV
// ---------------------------------------------------------------------------

/** Detect which delimiter a candidate CSV uses, or null if none qualifies. */
function detectCsvDelimiter(lines: string[]): string | null {
  const candidates = [",", ";", "\t"]
  for (const delim of candidates) {
    const counts = lines.map((l) => l.split(delim).length - 1)
    const first = counts[0]
    // Require every row to have the same count AND at least one delimiter per
    // row (so "a" alone on a line with no delimiter is not a 1-column CSV).
    if (first > 0 && counts.every((c) => c === first)) {
      return delim
    }
  }
  return null
}

function tryCSV(payload: string): FormattedPayload | null {
  const lines = payload.split(/\r?\n/).filter((l) => l.trim() !== "")
  if (lines.length < 2) {
    return null // single line is too ambiguous
  }
  const delim = detectCsvDelimiter(lines)
  if (!delim) {
    return null
  }
  // Column-align the output.
  const rows = lines.map((l) => l.split(delim))
  const colCount = rows[0].length
  const widths: number[] = Array(colCount).fill(0)
  for (const row of rows) {
    for (let i = 0; i < colCount; i++) {
      widths[i] = Math.max(widths[i], (row[i] ?? "").length)
    }
  }
  const pretty = rows.map((row) => row.map((cell, i) => cell.padEnd(widths[i])).join(" | ")).join("\n")
  return { format: "csv", pretty }
}

// ---------------------------------------------------------------------------
// 5. INI
// ---------------------------------------------------------------------------

const INI_SECTION_RE = /^\s*\[.+\]\s*$/
const INI_KV_RE = /^\s*[^=\s][^=]*=.*/
const INI_COMMENT_RE = /^\s*[;#]/

function tryIni(payload: string): FormattedPayload | null {
  const lines = payload.split(/\r?\n/)
  let sectionCount = 0
  let kvCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === "" || INI_COMMENT_RE.test(trimmed)) continue
    if (INI_SECTION_RE.test(trimmed)) {
      sectionCount++
    } else if (INI_KV_RE.test(trimmed)) {
      kvCount++
    } else {
      // Line doesn't match any valid INI syntax → bail out
      return null
    }
  }

  // Require either a section header OR 2+ key-value pairs to avoid
  // misclassifying a single "key=value" query-string as INI.
  if (sectionCount === 0 && kvCount < 2) {
    return null
  }
  if (sectionCount + kvCount === 0) {
    return null
  }

  // Pretty-print: normalise spacing around `=` and add blank lines between sections.
  const pretty = payload
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (INI_KV_RE.test(trimmed)) {
        // Ensure exactly one space around the `=`
        return trimmed.replace(/\s*=\s*/, " = ")
      }
      return trimmed
    })
    .join("\n")
    .replace(/(\[.+\])/g, "\n$1") // blank line before each section
    .trimStart()

  return { format: "ini", pretty }
}

// ---------------------------------------------------------------------------
// 6. Base64
// ---------------------------------------------------------------------------

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/
/** Minimum payload length (characters) to attempt Base64 classification. */
const BASE64_MIN_LENGTH = 16

function isPrintable(bytes: Uint8Array): boolean {
  let printable = 0
  for (const b of bytes) {
    if ((b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d) {
      printable++
    }
  }
  return printable / bytes.length > 0.85
}

function bytesToHex(bytes: Uint8Array): string {
  const hex: string[] = []
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16)
    const offset = i.toString(16).padStart(8, "0")
    const hexPart = Array.from(chunk)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
    const asciiPart = Array.from(chunk)
      .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : "."))
      .join("")
    hex.push(`${offset}  ${hexPart.padEnd(47)}  ${asciiPart}`)
  }
  return hex.join("\n")
}

function tryBase64(payload: string): FormattedPayload | null {
  const trimmed = payload.trim()
  if (trimmed.length < BASE64_MIN_LENGTH) return null
  if (trimmed.length % 4 !== 0) return null
  if (!BASE64_RE.test(trimmed)) return null

  // Round-trip check: decode then re-encode and compare.
  let decoded: Uint8Array
  try {
    const binary = atob(trimmed)
    decoded = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      decoded[i] = binary.charCodeAt(i)
    }
    // Re-encode
    const reEncoded = btoa(String.fromCharCode(...decoded))
    if (reEncoded !== trimmed) return null
  } catch {
    return null
  }

  if (isPrintable(decoded)) {
    const text = new TextDecoder().decode(decoded)
    return { format: "base64", pretty: `[Base64 decoded]\n${text}` }
  } else {
    return { format: "base64", pretty: `[Base64 decoded — binary]\n${bytesToHex(decoded)}` }
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Detect the format of a raw MQTT payload string and return a pretty-printed
 * version alongside the detected format name.
 *
 * This function is pure and stateless — safe to call from any context.
 */
export function formatPayload(payload: string): FormattedPayload {
  if (!payload || payload.trim() === "") {
    return { format: "text", pretty: payload }
  }

  return (
    tryJson(payload) ??
    tryXml(payload) ??
    tryYaml(payload) ??
    tryCSV(payload) ??
    tryIni(payload) ??
    tryBase64(payload) ?? { format: "text", pretty: payload }
  )
}
