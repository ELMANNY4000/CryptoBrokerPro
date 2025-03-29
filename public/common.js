// Common utility functions for vanilla JS implementation

/**
 * Makes an API request to the specified endpoint
 * @param {string} endpoint - The API endpoint to request
 * @param {Object} options - Request options (method, headers, body)
 * @returns {Promise<any>} - Promise that resolves to the response data
 */
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include'
    };

    if (options.body && typeof options.body === 'object') {
        defaultOptions.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(endpoint, defaultOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`API request error for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Loads user data from the API
 * @returns {Promise<Object>} - Promise that resolves to the user data
 */
async function loadUserData() {
    try {
        return await apiRequest('/api/user');
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
}

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {boolean} compact - Whether to use compact notation for large numbers
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, compact = false) {
    if (amount === null || amount === undefined) return '$0.00';
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        notation: compact ? 'compact' : 'standard',
        compactDisplay: 'short'
    });
    
    return formatter.format(amount);
}

/**
 * Formats a number with thousands separators
 * @param {number} number - The number to format
 * @param {number} decimal - Number of decimal places
 * @returns {string} - Formatted number string
 */
function formatNumber(number, decimal = 2) {
    if (number === null || number === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
    }).format(number);
}

/**
 * Formats a percentage value
 * @param {number} value - The percentage value
 * @returns {string} - Formatted percentage string
 */
function formatPercentage(value) {
    if (value === null || value === undefined) return '0.00%';
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero'
    }).format(value / 100);
}

/**
 * Shortens a blockchain address
 * @param {string} address - The address to shorten
 * @param {number} chars - Number of characters to keep at start and end
 * @returns {string} - Shortened address string
 */
function shortenAddress(address, chars = 4) {
    if (!address) return '';
    
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Formats a date string
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Formats a date string with time
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date and time string
 */
function formatDateTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Shows a toast notification
 * @param {string} title - The toast title
 * @param {string} message - The toast message
 * @param {string} type - The toast type ('success', 'error', 'warning', 'info')
 */
function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Set toast icon based on type
    let iconSvg = '';
    switch (type) {
        case 'success':
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            break;
        case 'error':
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            break;
        case 'warning':
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            break;
        case 'info':
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Creates a toast container if it doesn't exist
 * @returns {HTMLElement} - The toast container element
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Creates coin icon for cryptocurrency
 * @param {string} symbol - Coin symbol
 * @returns {string} - HTML for coin icon
 */
function createCoinIcon(symbol) {
    const colors = {
        BTC: '#f7931a',
        ETH: '#627eea',
        BNB: '#f3ba2f',
        SOL: '#00ffbd',
        XRP: '#23292f',
        ADA: '#0033ad',
        AVAX: '#e84142',
        DOT: '#e6007a',
        MATIC: '#8247e5',
        LINK: '#2a5ada',
        default: '#5f66f1'
    };
    
    const color = colors[symbol.toUpperCase()] || colors.default;
    
    return `
        <div style="
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: ${color}20;
            color: ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        ">
            ${symbol.slice(0, 1).toUpperCase()}
        </div>
    `;
}

/**
 * Creates a DOM element with specified attributes
 * @param {string} tag - Tag name for the element
 * @param {string} className - CSS class name
 * @param {Object} attributes - Additional attributes
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} - Created DOM element
 */
function createElement(tag, className = '', attributes = {}, innerHTML = '') {
    const element = document.createElement(tag);
    
    if (className) {
        element.className = className;
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    
    return element;
}

/**
 * Detects if the user is on a mobile device
 * @returns {boolean} - True if on mobile device
 */
function isMobile() {
    return window.innerWidth < 768;
}