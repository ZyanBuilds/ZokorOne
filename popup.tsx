/// <reference types="chrome" />
import { useEffect, useState } from "react"

// ========== Types ==========
type ContactStatus = "likely_active" | "unknown" | "possibly_inactive"
interface Contact {
  value: string; type: string; score: number; reason: string
  status: ContactStatus; personName?: string; companyName?: string
}
interface HistoryEntry {
  id: string; url: string; title: string; timestamp: number; contacts: Contact[]
}

// ========== Constants ==========
const MAX_HISTORY = 50, MAX_EXPORT = 15, WATERMARK = "Exported with ZokorOne"

// ========== Utility functions ==========
const formatTime = (ts: number) => new Date(ts).toLocaleString()

const scoreColor = (s: number) =>
  s >= 7 ? { bg: "#f0fdf4", border: "#22c55e" } :
  s >= 4 ? { bg: "#fffbeb", border: "#f59e0b" } :
  { bg: "#fef2f2", border: "#ef4444" }

const statusDisplay = (status: ContactStatus) => {
  switch (status) {
    case "likely_active": return { icon: "🟢", hint: "Likely active: clickable link on an updated page" }
    case "possibly_inactive": return { icon: "🔴", hint: "Possibly inactive: no clickable link, or outdated page" }
    default: return { icon: "🟡", hint: "Status unknown: no strong signal either way" }
  }
}

function generateCSV(contacts: Contact[]): string {
  const formatPhone = (phone: string) => {
    const d = phone.replace(/\D/g, "")
    if (d.startsWith("39") && d.length >= 11) { const l = d.substring(2); return l.startsWith("3") && l.length === 10 ? `+39 ${l.slice(0,3)} ${l.slice(3,6)} ${l.slice(6)}` : l.startsWith("0") && l.length === 10 ? `+39 ${l.slice(0,3)} ${l.slice(3,7)} ${l.slice(7)}` : `+39 ${l}` }
    if (d.startsWith("49") && d.length >= 10) { const l = d.substring(2); return l.startsWith("1") && l.length >= 10 ? `+49 ${l.slice(0,3)} ${l.slice(3,6)} ${l.slice(6)}` : l.length >= 9 ? `+49 ${l.slice(0,2)} ${l.slice(2,6)} ${l.slice(6)}` : `+49 ${l}` }
    if (d.startsWith("44") && d.length >= 11) { const l = d.substring(2); return l.startsWith("7") && l.length === 10 ? `+44 ${l.slice(0,4)} ${l.slice(4,7)} ${l.slice(7)}` : l.length >= 9 ? `+44 ${l.slice(0,2)} ${l.slice(2,6)} ${l.slice(6)}` : `+44 ${l}` }
    if (d.startsWith("1") && d.length === 11) { const l = d.substring(1); return `+1 (${l.slice(0,3)}) ${l.slice(3,6)}-${l.slice(6)}` }
    if (d.length >= 10) { const p: string[] = []; for (let i = 0; i < d.length; i += 3) p.push(d.slice(i, i + 3)); return p.join(" ") }
    return phone
  }
  const combine = (c: Contact) =>
    c.personName && c.companyName ? `${c.personName} / ${c.companyName}` : c.personName || c.companyName || ""
  const header = "Contact,Value,Type,Score,Reason,Status"
  const rows = contacts.map(c => {
    const display = c.type === "phone" ? formatPhone(c.value) : c.value
    const value = c.type === "phone" ? `"\t${display}"` : `"${display}"`
    return `"${combine(c)}",${value},"${c.type}",${c.score},"${c.reason}","${c.status}"`
  })
  return [header, ...rows, "", WATERMARK].join("\n")
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a"); a.href = url
  const now = new Date()
  const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}-${String(now.getMinutes()).padStart(2,"0")}`
  a.download = `zokorone-export-${ds}.csv`
  a.click(); URL.revokeObjectURL(url)
}

// ========== Main component ==========
export default function IndexPopup() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [view, setView] = useState<"extract" | "history">("extract")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    chrome.storage.local.get(["zokorone_history"], r => {
      if (r.zokorone_history) setHistory(r.zokorone_history)
    })
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) { setErrorMsg("Cannot get tab"); setLoading(false); return }

      const extractAndScore = () => {
        const pageText = document.body.innerText
        const results: Contact[] = []

        let company: string | undefined
        const og = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content")
        if (og) company = og
        else { const t = document.title; if (t) { const p = t.split(/\s[|-]\s/); company = p.length > 1 ? p[0].trim() : t.trim() } }

        const inferName = (email: string) => {
          const local = email.split("@")[0]
          if (!local || /^(info|support|hello|contact|sales|admin|help|team|office|hr|jobs|careers|marketing|media|press|webmaster|enquiries|enquiry|general|service|billing|accounts)$/i.test(local)) return
          const parts = local.split(/[._-]/)
          if (parts.length === 2) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + " " + parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
        }

        const isActive = (() => {
          const m = document.body.innerText.match(/©\s*(\d{4})/i)
          if (m) { const y = parseInt(m[1]); return y >= new Date().getFullYear() - 1 ? true : y < 2018 ? false : true }
          return true
        })()

        const visible = (el: Element) => { const rc = el.getBoundingClientRect(); return rc.width > 0 && rc.height > 0 }
        const hasNeg = (ctx: string) => ["former","old","closed","expired","non-valid","outdated","non piu valido"].some(k => ctx.toLowerCase().includes(k))

        const emailMap = new Map<string, { v: string; m: boolean }>()
        document.querySelectorAll('a[href^="mailto:"]').forEach((el: any) => {
          const email = el.getAttribute("href").replace("mailto:","").split("?")[0].trim()
          if (email) emailMap.set(email.toLowerCase(), { v: email, m: true })
        })
        const ereg = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; let em
        while ((em = ereg.exec(pageText)) !== null) {
          if (!emailMap.has(em[0].toLowerCase())) emailMap.set(em[0].toLowerCase(), { v: em[0], m: false })
        }
        emailMap.forEach(({ v, m }) => {
          const lo = v.toLowerCase(); let score = 5, reason = "Email"
          if (/^(info|support|hello|contact|sales|admin|help|team|office|hr|jobs|careers|marketing|media|press|webmaster|enquiries|enquiry|general|service|billing|accounts)@/.test(lo)) { score = 2; reason = "Generic email" }
          else if (/^[a-z]+\.[a-z]+@/.test(lo) || /^[a-z]+[a-z]+@/.test(lo)) { score = 9; reason = "Personal work email" }
          let status: ContactStatus = "unknown"
          if (m && isActive) status = "likely_active"
          else if (!m || hasNeg(v)) status = "possibly_inactive"
          results.push({ value: v, type: "email", score, reason, status, personName: inferName(v), companyName: company })
        })

        const phoneMap = new Map<string, { raw: string; tel: boolean }>()
        const isVAT = (d: string, ctx: string) =>
          d.length === 11 && /^\d{11}$/.test(d) && ["P.IVA","IVA","VAT","P.I.","PI"].some(k => ctx.toUpperCase().includes(k))
        const normalize = (input: string) => {
          let d = input.replace(/\D/g, "")
          if (d.startsWith("39") && d.length >= 11) d = d.substring(2)
          return d.length >= 9 && d.length <= 12 && /^(0|3)/.test(d) ? d : null
        }
        document.querySelectorAll('a[href^="tel:"]').forEach((el: any) => {
          if (!visible(el)) return
          const phone = el.getAttribute("href").replace("tel:","").trim()
          if (phone) { const n = normalize(phone); if (n) { const ctx = el.parentElement?.innerText || ""; if (!isVAT(n, ctx) && !phoneMap.has(n)) phoneMap.set(n, { raw: phone, tel: true }) } }
        })
        const preg = /(?:\+?\d{1,4}[-\s]?)?(?:\(?\d{1,4}\)?[-\s]?)?\d{2,4}[-\s]?\d{2,4}[-\s]?\d{2,6}/g; let ph
        while ((ph = preg.exec(pageText)) !== null) {
          const candidate = ph[0].trim(); const n = normalize(candidate)
          if (n) { const ctx = pageText.substring(Math.max(0, ph.index - 30), ph.index + candidate.length + 30); if (!isVAT(n, ctx) && !phoneMap.has(n)) phoneMap.set(n, { raw: candidate, tel: false }) }
        }
        const fmtPhone = (phone: string) => {
          const d = phone.replace(/\D/g, "")
          if (d.startsWith("39") && d.length >= 11) { const l = d.substring(2); return l.startsWith("3") && l.length === 10 ? `+39 ${l.slice(0,3)} ${l.slice(3,6)} ${l.slice(6)}` : l.startsWith("0") && l.length === 10 ? `+39 ${l.slice(0,3)} ${l.slice(3,7)} ${l.slice(7)}` : `+39 ${l}` }
          if (d.startsWith("49") && d.length >= 10) { const l = d.substring(2); return l.startsWith("1") && l.length >= 10 ? `+49 ${l.slice(0,3)} ${l.slice(3,6)} ${l.slice(6)}` : l.length >= 9 ? `+49 ${l.slice(0,2)} ${l.slice(2,6)} ${l.slice(6)}` : `+49 ${l}` }
          if (d.startsWith("44") && d.length >= 11) { const l = d.substring(2); return l.startsWith("7") && l.length === 10 ? `+44 ${l.slice(0,4)} ${l.slice(4,7)} ${l.slice(7)}` : l.length >= 9 ? `+44 ${l.slice(0,2)} ${l.slice(2,6)} ${l.slice(6)}` : `+44 ${l}` }
          if (d.startsWith("1") && d.length === 11) { const l = d.substring(1); return `+1 (${l.slice(0,3)}) ${l.slice(3,6)}-${l.slice(6)}` }
          if (d.length >= 10) { const p: string[] = []; for (let i = 0; i < d.length; i += 3) p.push(d.slice(i, i + 3)); return p.join(" ") }
          return phone
        }
        phoneMap.forEach(({ raw }, norm) => {
          const formatted = fmtPhone(raw); let score = 6, reason = "Phone number"
          if (norm.startsWith("3") && norm.length === 10) { score = 7; reason = "Mobile phone" }
          else if (norm.startsWith("0") && norm.length === 10) { score = 5; reason = "Landline" }
          let status: ContactStatus = "unknown"
          const hasTel = phoneMap.get(norm)?.tel || false
          if (hasTel && isActive) status = "likely_active"
          else if (!hasTel || hasNeg(raw)) status = "possibly_inactive"
          results.push({ value: formatted, type: "phone", score, reason, status, companyName: company })
        })

        const socialSet = new Set<string>()
        const socialDomains = ["linkedin.com","twitter.com","x.com","facebook.com","instagram.com","youtube.com","github.com"]
        document.querySelectorAll("a[href]").forEach((el: any) => {
          if (!visible(el)) return
          const href = el.getAttribute("href") || ""
          for (const d of socialDomains) if (href.includes(d)) { socialSet.add(href); break }
        })
        socialSet.forEach(link => {
          let status: ContactStatus = "unknown"
          if (link.startsWith("http") && link.includes("//")) status = "likely_active"
          results.push({ value: link, type: "social", score: 4, reason: "Social media link", status, companyName: company })
        })

        const seen = new Set<string>()
        const unique = results.filter(item => {
          const key = item.type === "phone" ? item.value.replace(/\D/g, "") : item.value
          if (seen.has(key)) return false; seen.add(key); return true
        })
        unique.sort((a, b) => b.score - a.score)
        return unique
      }

      chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractAndScore }, (res) => {
        if (chrome.runtime.lastError) {
          setErrorMsg("Injection failed: " + chrome.runtime.lastError.message)
          setLoading(false)
          return
        }
        if (res?.[0]?.result) {
          const extracted = res[0].result as Contact[]
          setContacts(extracted)
          saveToHistory(extracted, tab.url || "", tab.title || "")
        } else setContacts([])
        setLoading(false)
      })
    })
  }, [])

  const saveToHistory = (contacts: Contact[], url: string, title: string) => {
    if (!contacts.length) return
    setHistory(prev => {
      let ft = title
      const same = prev.filter(e => e.title === ft || e.title.startsWith(ft + " ("))
      if (same.length) ft = `${title} (${same.length})`
      const entry: HistoryEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        url, title: ft, timestamp: Date.now(), contacts
      }
      const updated = [entry, ...prev].slice(0, MAX_HISTORY)
      chrome.storage.local.set({ zokorone_history: updated })
      return updated
    })
  }

  const renameEntry = (id: string, newTitle: string) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, title: newTitle } : e)
      chrome.storage.local.set({ zokorone_history: updated })
      return updated
    })
  }

  const deleteSingle = (entryId: string, idx: number) => {
    setHistory(prev => {
      const updated = prev.map(e =>
        e.id === entryId ? { ...e, contacts: e.contacts.filter((_, i) => i !== idx) } : e
      ).filter(e => e.contacts.length)
      chrome.storage.local.set({ zokorone_history: updated })
      return updated
    })
    setSelected(prev => { const n = new Set(prev); n.delete(`${entryId}|${idx}`); return n })
  }

  const deleteEntry = (entryId: string) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== entryId)
      chrome.storage.local.set({ zokorone_history: updated })
      return updated
    })
    setSelected(prev => { const n = new Set(prev); for (const k of prev) if (k.startsWith(entryId)) n.delete(k); return n })
  }

  const deleteAll = () => {
    if (!history.length) return
    if (!confirm(`Delete all ${history.length} entries? This cannot be undone.`)) return
    setHistory([]); setSelected(new Set()); chrome.storage.local.remove("zokorone_history")
  }

  const selectedCount = selected.size

  const toggleContact = (entryId: string, idx: number) => {
    const key = `${entryId}|${idx}`
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  const toggleFolder = (entryId: string, contacts: Contact[]) => {
    const keys = contacts.map((_, i) => `${entryId}|${i}`)
    const all = keys.every(k => selected.has(k))
    setSelected(prev => { const n = new Set(prev); all ? keys.forEach(k => n.delete(k)) : keys.forEach(k => n.add(k)); return n })
  }

  const handleExport = () => {
    let exp: Contact[] = []
    for (const k of selected) {
      const [eid, istr] = k.split("|")
      const entry = history.find(e => e.id === eid)
      if (entry) { const c = entry.contacts[parseInt(istr)]; if (c) exp.push(c) }
    }
    if (!exp.length) return
    if (exp.length > MAX_EXPORT) {
      alert(`Only the first ${MAX_EXPORT} exported (you selected ${exp.length}). Upgrade to Pro for unlimited exports.`)
      exp = exp.slice(0, MAX_EXPORT)
    }
    if (confirm("Sort by score (highest first)?\nOK = by score, Cancel = folder order")) exp.sort((a, b) => b.score - a.score)
    downloadCSV(generateCSV(exp))
  }

  const batchDelete = () => {
    if (!selectedCount) return
    if (!confirm(`Delete ${selectedCount} selected contact${selectedCount > 1 ? "s" : ""}? This cannot be undone.`)) return
    const toDelete: { eid: string; idxs: number[] }[] = []
    for (const k of selected) {
      const [eid, istr] = k.split("|"); const idx = parseInt(istr)
      const existing = toDelete.find(d => d.eid === eid)
      existing ? existing.idxs.push(idx) : toDelete.push({ eid, idxs: [idx] })
    }
    setHistory(prev => {
      const updated = prev.map(e => {
        const del = toDelete.find(d => d.eid === e.id)
        if (del) { const sorted = [...del.idxs].sort((a, b) => b - a); const nc = [...e.contacts]; sorted.forEach(i => nc.splice(i, 1)); return { ...e, contacts: nc } }
        return e
      }).filter(e => e.contacts.length)
      chrome.storage.local.set({ zokorone_history: updated })
      return updated
    })
    setSelected(new Set())
  }

  const copy = (t: string) => navigator.clipboard.writeText(t)

  // ===== UI (Purple theme) =====
  return (
    <div style={{ width: 380, height: 520, display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f5f3ff" }}>
      {/* Top navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 10px", flexShrink: 0, background: "#fff", borderBottom: "1px solid #ede9fe" }}>
        <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, color: "#4c1d95" }}>ZokorOne</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setView("extract")}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "none", borderRadius: 8,
              background: view === "extract" ? "#7c3aed" : "#f5f3ff",
              color: view === "extract" ? "#fff" : "#6d28d9",
              cursor: "pointer", transition: "all 0.15s"
            }}>
            Extract
          </button>
          <button onClick={() => setView("history")}
            style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "none", borderRadius: 8,
              background: view === "history" ? "#7c3aed" : "#f5f3ff",
              color: view === "history" ? "#fff" : "#6d28d9",
              cursor: "pointer", transition: "all 0.15s"
            }}>
            History
          </button>
        </div>
      </div>

      {/* Extract view */}
      {view === "extract" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px" }}>
          <p style={{ fontSize: 11, color: "#7c3aed", marginBottom: 6, fontWeight: 500, letterSpacing: "0.02em" }}>
            CONTACTS RANKED BY PRIORITY · 100% LOCAL
          </p>
          {loading ? <p style={{ color: "#a78bfa", fontSize: 13 }}>Extracting...</p> :
           errorMsg ? <p style={{ color: "#ef4444", fontSize: 13 }}>{errorMsg}</p> :
           contacts.length === 0 ? <p style={{ color: "#a78bfa", fontSize: 13 }}>No contacts found on this page.</p> : (
            <>
              <p style={{ fontSize: 12, color: "#4c1d95", marginBottom: 10, fontWeight: 600 }}>
                Found {contacts.length} contact{contacts.length > 1 ? "s" : ""}
              </p>
              {contacts.map((item, i) => {
                const { bg, border } = scoreColor(item.score)
                const { icon, hint } = statusDisplay(item.status)
                return (
                  <div key={i} style={{
                    padding: 12, marginBottom: 8, borderRadius: 10, backgroundColor: "#fff",
                    borderLeft: `4px solid ${border}`,
                    boxShadow: "0 1px 3px rgba(124,58,237,0.06)",
                    display: "flex", alignItems: "center", gap: 10
                  }}>
                    <span style={{ fontSize: 10, color: "#a78bfa", minWidth: 16, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ fontWeight: 700, fontSize: 18, minWidth: 28, color: "#4c1d95" }}>{item.score}</span>
                    <div style={{ flex: 1 }}>
                      {item.personName && <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 2 }}>👤 {item.personName} <span style={{ color: "#a78bfa" }}>(inferred)</span></div>}
                      {item.companyName && !item.personName && <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 2 }}>🏢 {item.companyName}</div>}
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e1b4b" }}>{item.value}<span style={{ marginLeft: 6, fontSize: 13 }} title={hint}>{icon}</span></div>
                      <div style={{ fontSize: 10, color: "#7c3aed", marginTop: 2, opacity: 0.75 }}>{item.reason}</div>
                    </div>
                    <button onClick={() => copy(item.value)}
                      style={{
                        background: "#f5f3ff", border: "none", padding: "4px 10px", borderRadius: 6,
                        cursor: "pointer", fontSize: 11, fontWeight: 500, color: "#7c3aed",
                        transition: "all 0.15s"
                      }}>
                      Copy
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* History view */}
      {view === "history" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Fixed toolbar */}
          <div style={{
            padding: "10px 16px", borderBottom: "1px solid #ede9fe", background: "#fff",
            flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <p style={{ fontSize: 11, color: "#7c3aed", margin: 0, fontWeight: 600, letterSpacing: "0.02em" }}>
              {history.length} ENTR{history.length !== 1 ? "IES" : "Y"} (MAX {MAX_HISTORY})
            </p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: selectedCount > MAX_EXPORT ? "#ef4444" : "#7c3aed", fontWeight: 600 }}>
                {selectedCount}/{MAX_EXPORT}
              </span>
              <button onClick={() => selectedCount > 0 ? setSelected(new Set()) : setSelected(new Set(history.flatMap(e => e.contacts.map((_, i) => `${e.id}|${i}`))))}
                style={{
                  padding: "4px 8px", fontSize: 11, fontWeight: 500, border: "1px solid #ddd6fe", borderRadius: 6,
                  background: "#fff", color: "#6d28d9", cursor: "pointer", transition: "all 0.15s"
                }}>
                {selectedCount > 0 ? "✕ All" : "☐ All"}
              </button>
              <button onClick={handleExport}
                style={{
                  padding: "5px 12px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 6,
                  background: selectedCount > 0 ? "#7c3aed" : "#ede9fe",
                  color: selectedCount > 0 ? "#fff" : "#a78bfa",
                  cursor: selectedCount > 0 ? "pointer" : "not-allowed", transition: "all 0.15s"
                }}>
                Export CSV
              </button>
              <button onClick={batchDelete} disabled={selectedCount === 0}
                title="Delete selected"
                style={{
                  padding: "4px 8px", fontSize: 13, fontWeight: 500, border: "1px solid #fecaca",
                  borderRadius: 6, background: selectedCount > 0 ? "#fff" : "#f5f3ff",
                  color: selectedCount > 0 ? "#ef4444" : "#ddd6fe",
                  cursor: selectedCount > 0 ? "pointer" : "not-allowed", transition: "all 0.15s"
                }}>
                🗑️{selectedCount > 0 ? ` ${selectedCount}` : ""}
              </button>
              <button onClick={() => alert("Upgrade to Pro to remove watermarks.")}
                title="Remove watermark (Pro)"
                style={{
                  padding: "4px 8px", fontSize: 13, border: "1px solid #ddd6fe", borderRadius: 6,
                  background: "#fff", cursor: "pointer", transition: "all 0.15s"
                }}>
                💧
              </button>
              <button onClick={deleteAll} disabled={!history.length}
                title="Delete all history"
                style={{
                  padding: "4px 8px", fontSize: 13, border: "1px solid #fecaca",
                  borderRadius: 6, background: history.length ? "#fff" : "#f5f3ff",
                  color: history.length ? "#ef4444" : "#ddd6fe",
                  cursor: history.length ? "pointer" : "not-allowed", transition: "all 0.15s"
                }}>
                🗑️
              </button>
            </div>
          </div>

          {/* Scrollable folder list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
            {!history.length && <p style={{ color: "#a78bfa", fontSize: 13 }}>No history yet. Open a page and click "Extract".</p>}
            {history.map(entry => {
              const keys = entry.contacts.map((_, i) => `${entry.id}|${i}`)
              const allSelected = keys.every(k => selected.has(k)) && keys.length > 0
              return (
                <div key={entry.id} style={{
                  marginBottom: 8, border: "1px solid #ede9fe", borderRadius: 10,
                  overflow: "hidden", boxShadow: "0 1px 2px rgba(124,58,237,0.04)"
                }}>
                  <div style={{
                    padding: "10px 12px", background: "#faf9ff", display: "flex",
                    justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ flex: 1, cursor: "pointer", maxWidth: 150, overflow: "hidden" }}
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#4c1d95", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                        {entry.title}
                      </div>
                      <div style={{ fontSize: 10, color: "#a78bfa", marginTop: 2 }}>{formatTime(entry.timestamp)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleFolder(entry.id, entry.contacts) }}
                        title={allSelected ? "Deselect all" : "Select all"}
                        style={{
                          padding: "2px 4px", fontSize: 15, background: "transparent", border: "none",
                          cursor: "pointer", color: allSelected ? "#7c3aed" : "#ddd6fe",
                          fontWeight: 700, transition: "all 0.15s"
                        }}>
                        {allSelected ? "✓" : "☐"}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); const n = prompt("Rename:", entry.title); if (n?.trim()) renameEntry(entry.id, n.trim()) }}
                        title="Rename"
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          fontSize: 13, color: "#a78bfa", padding: 2, transition: "all 0.15s"
                        }}>
                        ✏️
                      </button>
                      <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600, marginLeft: 4 }}>
                        {entry.contacts.length}
                      </span>
                    </div>
                  </div>
                  {expandedId === entry.id && (
                    <div style={{ padding: "6px 8px 8px", background: "#fff" }}>
                      {entry.contacts.map((c, idx) => {
                        const key = `${entry.id}|${idx}`; const isSel = selected.has(key)
                        const { bg, border } = scoreColor(c.score); const { icon, hint } = statusDisplay(c.status)
                        return (
                          <div key={idx} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 4px", borderBottom: "1px solid #f5f3ff"
                          }}>
                            <input type="checkbox" checked={isSel} onChange={() => toggleContact(entry.id, idx)}
                              style={{ cursor: "pointer", accentColor: "#7c3aed" }} />
                            <span style={{ fontWeight: 700, fontSize: 13, minWidth: 22, color: "#4c1d95" }}>{c.score}</span>
                            <div style={{ flex: 1, fontSize: 11 }}>
                              {c.personName && <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 1 }}>👤 {c.personName} <span style={{ color: "#a78bfa" }}>(inferred)</span></div>}
                              {c.companyName && !c.personName && <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 1 }}>🏢 {c.companyName}</div>}
                              <div style={{ color: "#1e1b4b", fontWeight: 500 }}>{c.value}<span style={{ marginLeft: 6, fontSize: 12 }} title={hint}>{icon}</span></div>
                              <div style={{ color: "#7c3aed", fontSize: 9, marginTop: 1, opacity: 0.75 }}>{c.reason}</div>
                            </div>
                            <button onClick={() => copy(c.value)}
                              style={{
                                background: "#f5f3ff", border: "none", padding: "2px 8px", borderRadius: 4,
                                cursor: "pointer", fontSize: 10, fontWeight: 500, color: "#7c3aed"
                              }}>
                              Copy
                            </button>
                            <button onClick={() => deleteSingle(entry.id, idx)}
                              title="Delete contact"
                              style={{
                                background: "transparent", border: "none", cursor: "pointer",
                                fontSize: 13, color: "#a78bfa", padding: 2, transition: "all 0.15s"
                              }}>
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}