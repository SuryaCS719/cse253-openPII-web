# OpenPII Watcher - Live Web Demo 🔍

**Detect PII in Publicly Shared Documents**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://suryacs719.github.io/cse253-openPII-web/)

---

## 🌐 Try It Now

**→ [Launch Web Demo](https://suryacs719.github.io/cse253-openPII-web/)**

Simply paste a Google Docs or Pastebin URL to detect exposed PII instantly.

---

## ✨ Features

- 🔍 **Real-time PII Detection** - Analyze documents in seconds
- 🛡️ **Privacy-First** - All processing happens in your browser
- 📊 **Risk Assessment** - Automatic HIGH/MEDIUM/LOW risk classification
- 💡 **Security Recommendations** - Actionable advice for each document
- 🎯 **6 PII Types** - Emails, phones, names, addresses, SSN, credit cards
- 🌐 **Multi-Platform** - Supports Google Docs and Pastebin

---

## 🎯 How to Use

### 1. Open the Demo
Click the link above or open `index.html` locally

### 2. Enter a URL
Paste a public Google Docs or Pastebin URL

### 3. Click Analyze
The system will:
- Fetch the document content
- Detect all PII types
- Show detailed results
- Provide security recommendations

### 4. Review Results
- See exactly what PII was found
- Check the risk level
- Read security recommendations
- View anonymized content preview

---

## 📊 Detection Accuracy

Based on evaluation with 16 synthetic test documents:

| PII Type | Precision | Recall | F1-Score |
|----------|-----------|--------|----------|
| **Email** | 100% | 100% | 1.000 |
| **Address** | 100% | 100% | 1.000 |
| **SSN** | 100% | 100% | 1.000 |
| **Name** | 58.7% | 94.1% | 0.723 |
| **Phone** | 62.8% | 74.2% | 0.681 |
| **Overall** | **84.3%** | **87.6%** | **85.9%** |

**+84.3% improvement over baseline**

---

## 🧪 Try With Test Data

### Quick Test - Contact List
```
Project Team:
1. Alice Johnson - alice.j@example.com - (555) 123-4567
2. Bob Smith - bob.smith@company.com - 555-987-6543
```

**Create a Google Doc:**
1. Go to https://docs.google.com
2. Create new document
3. Paste test content
4. Share → Anyone with link → Viewer
5. Copy the link
6. Paste into our demo

---

## 🏗️ How It Works

### Platform Integration

**Pastebin**
- Direct fetch via `/raw/` endpoint
- Native CORS support
- 95%+ success rate
- ~200-300ms latency

**Google Docs**
- Two-tier fallback strategy:
  1. Direct fetch from `/export?format=txt`
  2. CORS proxy fallback if needed
- 60-80% success rate
- ~500-800ms latency

### Detection Engine

**Regex-Based Pattern Matching**
- Enhanced patterns with edge case handling
- False positive filtering
- Luhn algorithm for credit card validation
- Support for multiple formats (phone numbers, emails with +, hyphenated names)

**Client-Side Processing**
- All detection happens in your browser
- No data sent to external servers (except CORS proxy for some Google Docs)
- Complete privacy preservation

---

## 🎓 Academic Project

**Course:** CSE 253 - Network Security (Graduate)  
**Institution:** UC Santa Cruz  
**Team:**
- Suryakiran Valavala (suvalava@ucsc.edu)
- Arsh Advani (agadvani@ucsc.edu)
- Vijay Arvind Ramamoorthy (viramamo@ucsc.edu)

**Research Question:** Can we systematically detect PII exposed through publicly accessible sharing links?

**Answer:** Yes! Our system achieves 84.3% precision and 87.6% recall across 6 PII types.

---

## 📁 Files

```
index.html           - Main web application
style.css            - Modern, responsive styling
app.js               - Application logic and UI control
pii_detector.js      - Client-side PII detection engine
content_fetcher.js   - Platform-specific content fetching
```

**Total:** 1,254 lines of code

---

## 🔒 Privacy & Security

### What We Do ✅
- Process all content locally in your browser
- Use client-side JavaScript for detection
- Provide transparent, auditable regex patterns

### What We DON'T Do ❌
- Store any analyzed content
- Send data to our servers (we don't have any!)
- Track users or collect analytics
- Require registration or login

### CORS Proxy Note ⚠️
For some Google Docs, we use `api.allorigins.win` as a fallback proxy. Document content passes through this service if direct fetch fails. Use with caution for highly sensitive documents.

---

## 🚀 Local Development

### Run Locally
```bash
# Clone the repository
git clone https://github.com/SuryaCS719/cse253-openPII-web.git

# Open in browser
cd cse253-openPII-web
open index.html

# No build process, no dependencies!
```

### File Structure
```
.
├── index.html              # Main page
├── style.css               # Styling
├── app.js                  # Main app logic
├── pii_detector.js         # Detection engine
├── content_fetcher.js      # Content fetching
└── README.md               # This file
```

---

## 📊 Performance

- **Detection Speed:** < 1 second per document
- **Supported PII Types:** 6 (email, phone, name, address, SSN, credit card)
- **Browser Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Friendly:** Responsive design works on all screen sizes

---

## 🤝 Contributing

This is an academic project, but feedback and suggestions are welcome!

**Found a bug?** Open an issue  
**Have a suggestion?** Start a discussion  
**Want to improve detection?** Check the patterns in `pii_detector.js`

---

## 📝 Citation

If you use this tool in your research, please cite:

```bibtex
@misc{openpii-watcher-2024,
  title={OpenPII Watcher: Detecting PII in Publicly Shared Documents},
  author={Valavala, Suryakiran and Advani, Arsh and Ramamoorthy, Vijay Arvind},
  year={2024},
  institution={UC Santa Cruz},
  course={CSE 253: Network Security}
}
```

---

## ⚖️ License

Educational project for CSE 253 at UC Santa Cruz.

---

## 🔗 Links

- **Live Demo:** https://suryacs719.github.io/cse253-openPII-web/
- **GitHub Repository:** https://github.com/SuryaCS719/cse253-openPII-web
- **Institution:** https://www.ucsc.edu
- **Course:** CSE 253 - Network Security

---

## 📧 Contact

For questions about this project:
- Suryakiran Valavala: suvalava@ucsc.edu
- Arsh Advani: agadvani@ucsc.edu
- Vijay Arvind Ramamoorthy: viramamo@ucsc.edu

---

**Made with ❤️ at UC Santa Cruz**

*Protecting privacy, one document at a time* 🛡️

