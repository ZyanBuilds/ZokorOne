# ZokorOne

**Privacy-first browser extension that extracts contacts from any website and ranks them by contact quality.**

No data ever leaves your device. No account required. 100% local.

---

## ✨ Why ZokorOne

Most contact extractors give you a flat list of emails and phone numbers. Then you have to figure out which one is worth your time. Half the results are `info@`, `support@`, or generic inboxes that rarely get read.

ZokorOne does one thing differently: **it scores every contact by how personal and reachable it looks — so you know where to start and what to skip.**

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
- Export contacts to CSV (up to 15 per batch; watermark included)
- One‑click copy for any contact
- Dark mode (follows system preference)

### Pro Version *(coming soon)*
- Batch processing — extract contacts from multiple sites at once
- Unlimited CSV exports without watermark
- Advanced scoring breakdowns
- CRM integration *(planned)*
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

| Feature | ZokorOne | Cloud‑based email finder | All‑in‑one outreach tool | LinkedIn contact tool | Popular Chrome extractor |
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

MIT © 2026 ZyanBuilds — see [LICENSE](LICENSE) for full text.

---

## 🔗 Links

- GitHub: [github.com/ZyanBuilds/ZokorOne](https://github.com/ZyanBuilds/ZokorOne)
- Twitter: [@Zyan_builds](https://twitter.com/Zyan_builds)
- Chrome Web Store: *coming soon*

---

## ⚠️ Disclaimer

ZokorOne is a **code provider**, not a data processor or data controller under any privacy regulation (including GDPR, CCPA, or similar laws). All data extraction and processing occurs locally on the user's device. No data is transmitted to, stored on, or accessible by any third-party server operated by the developer.

**No warranty**: This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. The developer makes no guarantees regarding the accuracy, reliability, or availability of any contact information extracted by this tool.

**User responsibility**: Users are solely responsible for ensuring that their use of this extension complies with applicable laws, regulations, and the terms of service of any website they interact with. This includes, but is not limited to, data protection laws, anti-spam regulations, and website-specific terms. The developer assumes no liability for any damages, losses, or legal consequences arising from the use of this software.

**Contact scoring**: The contact priority scores and status labels (likely active, unknown, possibly inactive) are heuristic estimates based on publicly available page information. They do not constitute verification and should not be treated as guarantees of contact validity or deliverability.

**Acceptable use**: This tool is designed for legitimate business development, research, and personal productivity purposes. Any use for harassment, spamming, data scraping beyond what is visible on a public page, or accessing non-public information is explicitly not endorsed and is done at the user's own risk. The developer reserves the right to take any necessary action to prevent such misuse.

**Third-party content**: The developer does not claim ownership of any contact information extracted from third-party websites. Users should respect the intellectual property rights of the websites they visit.

For questions about this disclaimer or the privacy implications of using ZokorOne, please open a GitHub issue or contact the maintainer.
