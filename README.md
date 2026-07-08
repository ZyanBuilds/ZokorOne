# ZokorOne

**Privacy-first browser extension that extracts contacts from any website and ranks them by reply likelihood.**

No data ever leaves your device. No account required. 100% local.

[![GitHub stars](https://img.shields.io/github/stars/ZyanBuilds/ZokorOne?style=flat-square)](https://github.com/ZyanBuilds/ZokorOne/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Twitter](https://img.shields.io/twitter/follow/Zyan_builds?style=flat-square&logo=twitter)](https://twitter.com/Zyan_builds)

---

## ✨ Why ZokorOne

Most contact extractors give you a flat list of emails and phone numbers. Then you have to figure out which one is worth your time. Half the results are `info@`, `support@`, or generic inboxes that rarely get read.

ZokorOne does one thing differently: **it scores every contact by how likely you are to get a reply.**

You open a company website, click the extension, and instantly see:

- 🟢 **Start here** → Personal work email, most likely to reach a real person
- 🟡 **Try next** → Social media link, public channel
- 🔴 **Skip** → Generic inbox (info@, support@), rarely read

No more guessing. No more wasted time.

---

## 🔒 Privacy by Design

- **No server. No tracking. No data collection.**
- Everything runs locally in your browser — the URL you're scanning never leaves your device.
- History is stored in `chrome.storage.local` and never transmitted anywhere.
- Open source (MIT). Anyone can audit the code and verify the privacy claims.
- GDPR‑friendly by design: ZokorOne is a **code provider**, not a data processor.

---

## 🚀 Features

### Free Version
- Extract emails, phone numbers, and social media links from any website
- Contact priority scoring (1–10)
- Status labels: 🟢 likely active, 🟡 unknown, 🔴 possibly inactive
- Person & company name inference from email and page metadata
- Auto‑save history (up to 50 entries)
- Export selected contacts to CSV (up to 15 at a time)
- One‑click copy for any contact
- Dark mode (follows system preference)

### Pro Version *(coming soon)*
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

*(Screenshots coming soon)*

### Development

    npm install
    npm run dev

---

## 🛠️ Tech Stack

- [Plasmo](https://www.plasmo.com/) — Browser extension framework
- React + TypeScript
- Regex‑based extraction (emails, phones, social links)
- Heuristic scoring engine (all local, no API calls)
- `chrome.storage.local` for history persistence

---

## 📊 vs Competitors

| Feature | ZokorOne | Hunter.io | Snov.io | Lusha | Email Extractor |
|---------|:---:|:---:|:---:|:---:|:---:|
| Extracts emails | ✅ | ✅ | ✅ | ✅ | ✅ |
| Extracts phones | ✅ | ❌ | ✅ | ✅ | ❌ |
| Extracts social links | ✅ | ❌ | ❌ | ❌ | ❌ |
| Contact priority scoring | ✅ | ❌ | ❌ | ❌ | ❌ |
| 100% local (no upload) | ✅ | ❌ | ❌ | ❌ | ✅ |
| No account required | ✅ | ❌ | ❌ | ❌ | ✅ |
| Open source | ✅ | ❌ | ❌ | ❌ | ❌ |
| Free version | ✅ | Limited | Limited | Limited | Limited |

---

## ❓ FAQ

**Does ZokorOne upload my data anywhere?**
No. Everything stays on your machine. There is no server, no backend, and no analytics. You can verify this by inspecting the source code or the network tab of your browser.

**How is the contact score calculated?**
The scoring engine checks whether a contact is a personal email (e.g. first.last@company.com) vs a generic one (info@, support@), whether it comes from a clickable `mailto:` or `tel:` link, how recently the website was updated, and whether there are any negative keywords nearby (e.g. "former", "expired"). No external APIs are called.

**Can I use ZokorOne for GDPR‑sensitive work?**
Yes. Because no data is ever transmitted, ZokorOne is naturally compliant with GDPR's data minimisation principles. You remain the sole controller of any extracted data.

**Will there be a paid version?**
A Pro version is planned with batch processing, unlimited exports, and advanced scoring. The free version will always remain available with the features listed above.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- **Bug reports**: Open an issue with clear steps to reproduce.
- **Feature requests**: Open an issue to discuss your idea before coding.
- **Pull requests**: Fork the repo, create a branch, and submit a PR. Keep changes focused and documented.
- **Documentation**: Improvements to the README, help guides, or inline code comments are always appreciated.

---

## 📄 License

MIT © ZyanBuilds — see [LICENSE](LICENSE) for full text.

---

## ⚠️ Disclaimer

ZokorOne is a code provider, not a data processor. All data extraction happens locally on the user's device. The developer assumes no responsibility for how users utilise this tool. Users are responsible for complying with the terms of service of any website they use this extension on.

---

## 🔗 Links

- GitHub: [github.com/ZyanBuilds/ZokorOne](https://github.com/ZyanBuilds/ZokorOne)
- Twitter: [@Zyan_builds](https://twitter.com/Zyan_builds)
- Chrome Web Store: *coming soon*
