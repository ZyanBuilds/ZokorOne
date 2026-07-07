# ZokorOne

**Privacy-first browser extension that extracts contacts from any website and ranks them by reply likelihood.**

No data ever leaves your device. No account required. 100% local.

---

## ✨ Why ZokorOne

Most contact extractors give you a flat list of emails and phone numbers. Then you have to guess which one is worth your time.

ZokorOne does one thing differently: **it scores every contact by how likely you are to get a reply.**

- 🟢 **Start here** → Personal work email, most likely to reach a real person
- 🟡 **Try next** → Social media link, public channel
- 🔴 **Skip** → Generic inbox (info@, support@), rarely read

No more guessing. No more wasted time.

---

## 🔒 Privacy by Design

- **No server. No tracking. No data collection.**
- Everything runs locally in your browser.
- History is stored in `chrome.storage.local` — your data stays on your machine.
- Open source (MIT). Anyone can audit the code.

---

## 🚀 Features

### Free Version
- Extract emails, phone numbers, and social media links from any website
- Contact priority scoring (1-10)
- Status labels: 🟢 likely active, 🟡 unknown, 🔴 possibly inactive
- Auto-save history (up to 50 entries)
- Export selected contacts to CSV (up to 15 at a time)
- One-click copy for any contact
- Dark mode (follows system preference)

### Pro Version (coming soon)
- Batch URL processing
- Unlimited CSV exports without watermark
- Advanced scoring breakdowns
- CRM integration
- Custom scoring rules

---

## 📦 Installation

### Chrome Web Store *(coming soon)*
Link will be added once published.

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the `build/chrome-mv3-dev` folder
5. The extension is ready to use

### Development
```bash
npm install
npm run dev


🛠️ Tech Stack
Plasmo — Browser extension framework

React + TypeScript

chrome.scripting.executeScript for page injection

Regex-based extraction (emails, phones, social links)

Heuristic scoring engine (all local, no API calls)

chrome.storage.local for history persistence

📊 vs Competitors
Feature	               ZokorOne	Hunter.io	Snov.io	Lusha	Email Extractor
Extracts emails	          ✅    	✅    	✅    	✅     ✅
Extracts phones	          ✅	    ❌	    ✅	    ✅     ❌
Extracts social links   	✅    	❌	    ❌     	❌     ❌
Contact priority scoring	✅	    ❌    	❌	    ❌     ❌
100% local (no upload)	  ✅	    ❌    	❌    	❌     ✅
No account required     	✅	    ❌    	❌    	❌     ✅
Open source	              ✅	    ❌	    ❌    	❌     ❌
Free version            	✅  	Limited	Limited	Limited	Limited

📄 License
MIT © ZyanBuilds

⚠️ Disclaimer
ZokorOne is a code provider, not a data processor. All data extraction happens locally on the user's device. The developer assumes no responsibility for how users utilize this tool. Users are responsible for complying with the terms of service of any website they use this extension on.

🔗 Links
GitHub: github.com/ZyanBuilds/ZokorOne

Twitter: @Zyan_builds

Chrome Web Store: coming soon
