/**
 * OpenPII Watcher - PII Detector (JavaScript)
 * Client-side PII detection with improved regex patterns
 */

class PIIDetector {
    constructor() {
        // Improved regex patterns matching Python implementation
        this.patterns = {
            email: /\b[A-Za-z0-9][A-Za-z0-9._%+\-]*@[A-Za-z0-9][A-Za-z0-9.\-]*\.[A-Za-z]{2,}\b/g,
            phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
            name: /\b(?:(?:Dr|Mr|Ms|Mrs|Prof)\.?\s+)?([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)\s+(?:([A-Z]\.?\s+))?([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)\b/g,
            address: /\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/g,
            ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
            credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g
        };

        this.piiLabels = {
            email: 'Email Addresses',
            phone: 'Phone Numbers',
            name: 'Names',
            address: 'Street Addresses',
            ssn: 'Social Security Numbers',
            credit_card: 'Credit Card Numbers'
        };
    }

    /**
     * Detect specific PII type in text
     */
    detect(text, piiType) {
        if (!this.patterns[piiType]) {
            return [];
        }

        const pattern = this.patterns[piiType];
        const matches = [];
        let match;

        // Reset regex state
        pattern.lastIndex = 0;

        while ((match = pattern.exec(text)) !== null) {
            matches.push({
                value: match[0],
                start: match.index,
                end: match.index + match[0].length
            });
        }

        // Apply filters
        if (piiType === 'phone') {
            return this.filterPhoneFalsePositives(matches);
        } else if (piiType === 'name') {
            return this.filterNameFalsePositives(matches);
        }

        return matches;
    }

    /**
     * Filter phone number false positives (dates, etc.)
     */
    filterPhoneFalsePositives(matches) {
        return matches.filter(match => {
            const digits = match.value.match(/\d+/g);
            if (digits && digits.length === 3) {
                // Check if it looks like a date (month <= 12, day <= 31)
                const first = parseInt(digits[0]);
                const second = parseInt(digits[1]);
                if (first <= 12 && second <= 31) {
                    return false; // Likely a date
                }
            }
            return true;
        });
    }

    /**
     * Filter name false positives (common words, months)
     */
    filterNameFalsePositives(matches) {
        const commonWords = new Set([
            'The', 'This', 'That', 'Will', 'May', 'June', 'July',
            'August', 'March', 'April', 'January', 'February'
        ]);

        return matches.filter(match => {
            const words = match.value.split(/\s+/);
            return !words.some(word => commonWords.has(word));
        });
    }

    /**
     * Detect all PII types in text
     */
    detectAll(text) {
        const results = {};
        for (const piiType in this.patterns) {
            results[piiType] = this.detect(text, piiType);
        }
        return results;
    }

    /**
     * Get summary counts
     */
    getSummary(text) {
        const results = this.detectAll(text);
        const summary = {};
        for (const piiType in results) {
            summary[piiType] = results[piiType].length;
        }
        return summary;
    }

    /**
     * Get unique PII values
     */
    getUniqueValues(text) {
        const results = this.detectAll(text);
        const unique = {};
        
        for (const piiType in results) {
            unique[piiType] = [...new Set(results[piiType].map(m => m.value))];
        }
        
        return unique;
    }

    /**
     * Anonymize text by replacing PII with placeholders
     */
    anonymize(text) {
        let anonymized = text;
        const results = this.detectAll(text);

        // Sort all matches by position (descending) to avoid offset issues
        const allMatches = [];
        for (const piiType in results) {
            for (const match of results[piiType]) {
                allMatches.push({
                    ...match,
                    type: piiType
                });
            }
        }
        
        allMatches.sort((a, b) => b.start - a.start);

        // Replace from end to start
        for (const match of allMatches) {
            const placeholder = `[${this.piiLabels[match.type].toUpperCase()}]`;
            anonymized = anonymized.substring(0, match.start) + 
                        placeholder + 
                        anonymized.substring(match.end);
        }

        return anonymized;
    }

    /**
     * Get label for PII type
     */
    getLabel(piiType) {
        return this.piiLabels[piiType] || piiType;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PIIDetector;
}

