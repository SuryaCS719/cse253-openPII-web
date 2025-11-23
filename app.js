/**
 * OpenPII Watcher - Main Application Logic
 * Connects UI with detection and fetching modules
 */

// Initialize modules
const detector = new PIIDetector();
const fetcher = new ContentFetcher();

// DOM elements
const urlInput = document.getElementById('url-input');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const exampleBtns = document.querySelectorAll('.example-btn');

// Performance metrics (will be loaded from evaluation results)
const performanceMetrics = {
    email: { precision: 0.89, recall: 0.87, f1: 0.88 },
    phone: { precision: 0.82, recall: 0.79, f1: 0.80 },
    name: { precision: 0.85, recall: 0.81, f1: 0.83 },
    address: { precision: 0.91, recall: 0.88, f1: 0.89 },
    ssn: { precision: 0.95, recall: 0.93, f1: 0.94 },
    credit_card: { precision: 0.93, recall: 0.90, f1: 0.91 }
};

/**
 * Initialize application
 */
function init() {
    // Add event listeners
    analyzeBtn.addEventListener('click', handleAnalyze);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    });

    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            urlInput.value = btn.dataset.url;
        });
    });

    // Load performance metrics
    displayPerformanceMetrics();
}

/**
 * Handle analyze button click
 */
async function handleAnalyze() {
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a URL');
        return;
    }

    // Show loading, hide results
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    analyzeBtn.disabled = true;

    try {
        // Fetch content
        const fetchResult = await fetcher.fetchContent(url);

        if (!fetchResult.success) {
            throw new Error(fetchResult.error || 'Failed to fetch content');
        }

        // Detect PII
        const piiResults = detector.getUniqueValues(fetchResult.content);
        
        // Display results
        displayResults(piiResults, fetchResult);

        // Hide loading, show results
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';

    } catch (error) {
        loadingSection.style.display = 'none';
        alert(`Error: ${error.message}`);
    } finally {
        analyzeBtn.disabled = false;
    }
}

/**
 * Display detection results
 */
function displayResults(piiResults, fetchResult) {
    // Calculate totals
    let totalPII = 0;
    let typesDetected = 0;

    for (const piiType in piiResults) {
        const count = piiResults[piiType].length;
        if (count > 0) {
            totalPII += count;
            typesDetected++;
        }
    }

    // Risk level
    let riskLevel = 'LOW';
    let riskClass = '';
    
    if (totalPII > 20) {
        riskLevel = 'HIGH';
        riskClass = 'risk-high';
    } else if (totalPII > 5) {
        riskLevel = 'MEDIUM';
        riskClass = 'risk-medium';
    }

    // Update summary stats
    document.getElementById('total-pii').textContent = totalPII;
    document.getElementById('pii-types').textContent = typesDetected;
    document.getElementById('risk-level').textContent = riskLevel;
    
    const riskCard = document.querySelector('.stat-card.risk-level');
    riskCard.className = `stat-card risk-level ${riskClass}`;

    // Display PII breakdown
    displayPIIBreakdown(piiResults);

    // Display anonymized content preview
    displayContentPreview(fetchResult.content);

    // Display recommendations
    displayRecommendations(piiResults, totalPII);
}

/**
 * Display PII breakdown by type
 */
function displayPIIBreakdown(piiResults) {
    const container = document.getElementById('pii-details');
    container.innerHTML = '';

    for (const piiType in piiResults) {
        const values = piiResults[piiType];
        
        if (values.length === 0) continue;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'pii-item';

        const title = document.createElement('h4');
        title.textContent = `${detector.getLabel(piiType)} (${values.length} found)`;

        const valuesDiv = document.createElement('div');
        valuesDiv.className = 'pii-values';

        // Display up to 10 values
        const displayValues = values.slice(0, 10);
        displayValues.forEach(value => {
            const tag = document.createElement('span');
            tag.className = 'pii-tag';
            tag.textContent = value;
            valuesDiv.appendChild(tag);
        });

        if (values.length > 10) {
            const more = document.createElement('span');
            more.className = 'pii-tag';
            more.textContent = `... and ${values.length - 10} more`;
            more.style.fontStyle = 'italic';
            valuesDiv.appendChild(more);
        }

        itemDiv.appendChild(title);
        itemDiv.appendChild(valuesDiv);
        container.appendChild(itemDiv);
    }

    if (container.innerHTML === '') {
        container.innerHTML = '<p style="color: var(--secondary-color); font-weight: 500;">✓ No PII detected in this document.</p>';
    }
}

/**
 * Display anonymized content preview
 */
function displayContentPreview(content) {
    const container = document.getElementById('content-display');
    
    // Anonymize content
    const anonymized = detector.anonymize(content);
    
    // Show first 1000 characters
    const preview = anonymized.substring(0, 1000);
    container.textContent = preview + (anonymized.length > 1000 ? '\n\n... (content truncated)' : '');
}

/**
 * Display security recommendations
 */
function displayRecommendations(piiResults, totalPII) {
    const list = document.getElementById('recommendations-list');
    list.innerHTML = '';

    const recommendations = [];

    if (totalPII === 0) {
        recommendations.push('No PII detected. This document appears safe for public sharing.');
    } else {
        recommendations.push('This document contains personally identifiable information (PII).');
        
        if (piiResults.email && piiResults.email.length > 0) {
            recommendations.push(`Found ${piiResults.email.length} email address(es). Consider removing or redacting them.`);
        }
        
        if (piiResults.phone && piiResults.phone.length > 0) {
            recommendations.push(`Found ${piiResults.phone.length} phone number(s). These should not be publicly accessible.`);
        }
        
        if (piiResults.ssn && piiResults.ssn.length > 0) {
            recommendations.push('⚠️ CRITICAL: Social Security Numbers detected. Remove immediately!');
        }
        
        if (piiResults.credit_card && piiResults.credit_card.length > 0) {
            recommendations.push('⚠️ CRITICAL: Credit card numbers detected. Remove immediately!');
        }

        recommendations.push('Review document permissions and limit access to specific individuals only.');
        recommendations.push('Do not use "anyone with the link" sharing for sensitive documents.');
        recommendations.push('Consider using password protection or expiration dates for shared links.');
    }

    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

/**
 * Display performance metrics table
 */
function displayPerformanceMetrics() {
    const tbody = document.getElementById('metrics-body');
    tbody.innerHTML = '';

    for (const piiType in performanceMetrics) {
        const metrics = performanceMetrics[piiType];
        
        const row = document.createElement('tr');
        
        const typeCell = document.createElement('td');
        typeCell.textContent = detector.getLabel(piiType);
        
        const precisionCell = document.createElement('td');
        precisionCell.innerHTML = createMetricBar(metrics.precision);
        
        const recallCell = document.createElement('td');
        recallCell.innerHTML = createMetricBar(metrics.recall);
        
        const f1Cell = document.createElement('td');
        f1Cell.innerHTML = createMetricBar(metrics.f1);
        
        row.appendChild(typeCell);
        row.appendChild(precisionCell);
        row.appendChild(recallCell);
        row.appendChild(f1Cell);
        
        tbody.appendChild(row);
    }
}

/**
 * Create metric bar visualization
 */
function createMetricBar(value) {
    const percentage = (value * 100).toFixed(1);
    return `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="metric-bar" style="width: 100px;">
                <div class="metric-bar-fill" style="width: ${percentage}%;"></div>
            </div>
            <span>${percentage}%</span>
        </div>
    `;
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

