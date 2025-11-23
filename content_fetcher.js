/**
 * OpenPII Watcher - Content Fetcher (JavaScript)
 * Platform-specific URL processing and content fetching for the browser
 */

class ContentFetcher {
    constructor() {
        this.platformPatterns = {
            pastebin: /pastebin\.com\/([A-Za-z0-9]+)/,
            google_docs: /docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)/
        };

        this.corsProxy = 'https://api.allorigins.win/raw?url=';
    }

    /**
     * Detect platform type from URL
     * Returns: { platform, docId }
     */
    detectPlatform(url) {
        for (const [platform, pattern] of Object.entries(this.platformPatterns)) {
            const match = url.match(pattern);
            if (match) {
                return {
                    platform: platform,
                    docId: match[1]
                };
            }
        }
        return { platform: 'unknown', docId: null };
    }

    /**
     * Transform Pastebin URL to raw content endpoint
     */
    transformPastebinUrl(pasteId) {
        return `https://pastebin.com/raw/${pasteId}`;
    }

    /**
     * Transform Google Docs URL to plain text export endpoint
     */
    transformGoogleDocsUrl(docId) {
        return `https://docs.google.com/document/d/${docId}/export?format=txt`;
    }

    /**
     * Validate URL
     */
    validateUrl(url) {
        if (!url || !url.trim()) {
            return { valid: false, message: 'Empty URL' };
        }

        const { platform, docId } = this.detectPlatform(url);

        if (platform === 'unknown') {
            return { 
                valid: false, 
                message: 'Unsupported platform. Supported: Pastebin, Google Docs' 
            };
        }

        if (!docId) {
            return { 
                valid: false, 
                message: `Could not extract document ID from ${platform}` 
            };
        }

        return { valid: true, message: `Valid ${platform} URL`, platform, docId };
    }

    /**
     * Fetch content from Pastebin
     */
    async fetchPastebin(pasteId) {
        const url = this.transformPastebinUrl(pasteId);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            return {
                success: true,
                content: content,
                platform: 'pastebin',
                method: 'direct'
            };
        } catch (error) {
            return {
                success: false,
                content: null,
                platform: 'pastebin',
                error: error.message
            };
        }
    }

    /**
     * Fetch content from Google Docs with two-tier fallback
     */
    async fetchGoogleDocs(docId) {
        const primaryUrl = this.transformGoogleDocsUrl(docId);

        // Strategy 1: Try direct fetch
        try {
            const response = await fetch(primaryUrl);
            if (response.ok) {
                const content = await response.text();
                return {
                    success: true,
                    content: content,
                    platform: 'google_docs',
                    method: 'direct'
                };
            }
        } catch (error) {
            console.log('Direct fetch blocked by CORS, trying proxy...');
        }

        // Strategy 2: Fallback to CORS proxy
        const fallbackUrl = this.corsProxy + encodeURIComponent(primaryUrl);
        
        try {
            const response = await fetch(fallbackUrl);
            if (response.ok) {
                const content = await response.text();
                return {
                    success: true,
                    content: content,
                    platform: 'google_docs',
                    method: 'proxy'
                };
            } else {
                throw new Error(`Proxy fetch failed: ${response.status}`);
            }
        } catch (error) {
            return {
                success: false,
                content: null,
                platform: 'google_docs',
                error: 'Both direct and proxy fetch methods failed. The document may require authentication or may not exist.'
            };
        }
    }

    /**
     * Main fetch method - detects platform and fetches content
     */
    async fetchContent(url) {
        const validation = this.validateUrl(url);
        
        if (!validation.valid) {
            return {
                success: false,
                content: null,
                error: validation.message
            };
        }

        const { platform, docId } = validation;

        if (platform === 'pastebin') {
            return await this.fetchPastebin(docId);
        } else if (platform === 'google_docs') {
            return await this.fetchGoogleDocs(docId);
        } else {
            return {
                success: false,
                content: null,
                error: 'Unsupported platform'
            };
        }
    }

    /**
     * Get platform integration details for display
     */
    getPlatformDetails() {
        return {
            pastebin: {
                name: 'Pastebin',
                pattern: 'pastebin.com/{paste_id}',
                method: 'Direct fetch via /raw/ endpoint',
                cors: 'Native support',
                reliability: 'High (>95%)'
            },
            google_docs: {
                name: 'Google Docs',
                pattern: 'docs.google.com/document/d/{doc_id}',
                method: 'Two-tier fallback (direct + proxy)',
                cors: 'Mixed - uses proxy as backup',
                reliability: 'Medium (60-80%)'
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentFetcher;
}

