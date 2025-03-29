// State management
const state = {
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    selectedCurrency: 'BTC',
    depositAmount: '',
    withdrawAmount: '',
    destAddress: '',
    depositMethod: 'crypto',
    cardDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: ''
    },
    transactions: [],
    portfolioAssets: [
        {
            userId: 1,
            coinId: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            amount: 0.05,
            id: 1,
            updatedAt: new Date().toISOString(),
            walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
        },
        {
            userId: 1,
            coinId: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            amount: 0.75,
            id: 2,
            updatedAt: new Date().toISOString(),
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
        }
    ]
};

// DOM Elements
const walletAddressInput = document.getElementById('walletAddressInput');
const displayWalletAddress = document.getElementById('displayWalletAddress');
const copyAddressBtn = document.getElementById('copyAddressBtn');
const depositAddressInput = document.querySelector('.deposit-address');
const cryptoDepositBtn = document.getElementById('cryptoDepositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const continuePaymentBtn = document.getElementById('continuePaymentBtn');
const completePaymentBtn = document.getElementById('completePaymentBtn');
const backToCardFormBtn = document.getElementById('backToCardFormBtn');
const cryptoCurrency = document.getElementById('cryptoCurrency');
const cardCurrency = document.getElementById('cardCurrency');
const withdrawCurrency = document.getElementById('withdrawCurrency');
const cryptoAmount = document.getElementById('cryptoAmount');
const cardAmount = document.getElementById('cardAmount');
const withdrawAmount = document.getElementById('withdrawAmount');
const destinationAddress = document.getElementById('destinationAddress');
const cryptoPrefix = document.getElementById('cryptoPrefix');
const cardPrefix = document.getElementById('cardPrefix');
const withdrawPrefix = document.getElementById('withdrawPrefix');
const availableAmount = document.getElementById('availableAmount');
const buyingAmount = document.getElementById('buyingAmount');
const totalAmount = document.getElementById('totalAmount');
const transactionsList = document.getElementById('transactionsList');
const toastContainer = document.getElementById('toastContainer');
const methodButtons = document.querySelectorAll('.method-button');
const tabButtons = document.querySelectorAll('.tab-button');

// Initialize the wallet page
function initWallet() {
    // Set up initial values based on state
    walletAddressInput.value = state.walletAddress;
    displayWalletAddress.textContent = state.walletAddress;
    depositAddressInput.value = state.walletAddress;
    
    // Load transactions
    loadTransactions();
    
    // Update portfolio data
    updatePortfolioDisplay();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Deposit method switching
    methodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const method = button.getAttribute('data-method');
            switchDepositMethod(method);
        });
    });
    
    // Wallet address inputs sync
    walletAddressInput.addEventListener('input', (e) => {
        state.walletAddress = e.target.value;
        displayWalletAddress.textContent = e.target.value;
        depositAddressInput.value = e.target.value;
    });
    
    depositAddressInput.addEventListener('input', (e) => {
        state.walletAddress = e.target.value;
        displayWalletAddress.textContent = e.target.value;
        walletAddressInput.value = e.target.value;
    });
    
    // Copy address button
    copyAddressBtn.addEventListener('click', copyWalletAddress);
    
    // Currency selection changes
    cryptoCurrency.addEventListener('change', (e) => {
        state.selectedCurrency = e.target.value;
        cryptoPrefix.textContent = e.target.value;
        updatePortfolioDisplay();
    });
    
    cardCurrency.addEventListener('change', (e) => {
        state.selectedCurrency = e.target.value;
        cardPrefix.textContent = e.target.value;
        updateTotalAmount();
    });
    
    withdrawCurrency.addEventListener('change', (e) => {
        state.selectedCurrency = e.target.value;
        withdrawPrefix.textContent = e.target.value;
        updatePortfolioDisplay();
    });
    
    // Amount input changes
    cryptoAmount.addEventListener('input', (e) => {
        state.depositAmount = e.target.value;
    });
    
    cardAmount.addEventListener('input', (e) => {
        state.depositAmount = e.target.value;
        updateTotalAmount();
    });
    
    withdrawAmount.addEventListener('input', (e) => {
        state.withdrawAmount = e.target.value;
    });
    
    destinationAddress.addEventListener('input', (e) => {
        state.destAddress = e.target.value;
    });
    
    // Deposit and withdraw buttons
    cryptoDepositBtn.addEventListener('click', handleCryptoDeposit);
    continuePaymentBtn.addEventListener('click', () => {
        if (validateCardAmount()) {
            showCardPayment();
        }
    });
    
    completePaymentBtn.addEventListener('click', handleCardDeposit);
    backToCardFormBtn.addEventListener('click', () => {
        document.querySelector('.card-payment').classList.remove('active');
        document.querySelector('.card-deposit').classList.add('active');
    });
    
    withdrawBtn.addEventListener('click', handleWithdrawal);
}

// Switch tabs (deposit/withdraw)
function switchTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show corresponding tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // If switching to withdraw tab, show the withdraw form
    if (tabId === 'withdraw') {
        document.querySelector('.withdraw-form').style.display = 'block';
    }
}

// Switch deposit methods (crypto/card)
function switchDepositMethod(method) {
    state.depositMethod = method;
    
    // Update method buttons
    methodButtons.forEach(btn => {
        if (btn.getAttribute('data-method') === method) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show corresponding deposit form
    document.querySelectorAll('.deposit-form').forEach(form => {
        form.classList.remove('active');
    });
    
    if (method === 'crypto') {
        document.querySelector('.crypto-deposit').classList.add('active');
    } else {
        document.querySelector('.card-deposit').classList.add('active');
    }
}

// Copy wallet address to clipboard
function copyWalletAddress() {
    if (state.walletAddress) {
        navigator.clipboard.writeText(state.walletAddress)
            .then(() => {
                showToast('Address Copied', 'Wallet address copied to clipboard', 'success');
            })
            .catch(err => {
                showToast('Copy Failed', 'Could not copy wallet address', 'error');
            });
    }
}

// Update the total amount for card purchases
function updateTotalAmount() {
    if (!state.depositAmount) return;
    
    const amount = parseFloat(state.depositAmount);
    if (isNaN(amount)) return;
    
    const price = getPriceForCurrency(state.selectedCurrency);
    const total = amount * price;
    
    buyingAmount.textContent = `${amount} ${state.selectedCurrency}`;
    totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Get price for selected currency
function getPriceForCurrency(symbol) {
    switch (symbol) {
        case 'BTC': return 84000;
        case 'ETH': return 2000;
        case 'USDT': return 1;
        case 'BNB': return 400;
        default: return 1;
    }
}

// Update portfolio display
function updatePortfolioDisplay() {
    const asset = state.portfolioAssets.find(a => a.symbol === state.selectedCurrency);
    if (asset) {
        availableAmount.textContent = `${asset.amount.toFixed(8)} ${state.selectedCurrency}`;
    } else {
        availableAmount.textContent = `0.00000000 ${state.selectedCurrency}`;
    }
}

// Validate deposit amount
function validateDepositAmount() {
    if (!state.depositAmount || isNaN(parseFloat(state.depositAmount)) || parseFloat(state.depositAmount) <= 0) {
        showToast('Invalid Amount', 'Please enter a valid amount to deposit', 'error');
        return false;
    }
    return true;
}

// Validate card deposit amount
function validateCardAmount() {
    if (!validateDepositAmount()) return false;
    
    // Additional card validations could go here
    
    return true;
}

// Validate withdrawal
function validateWithdrawal() {
    if (!state.withdrawAmount || isNaN(parseFloat(state.withdrawAmount)) || parseFloat(state.withdrawAmount) <= 0) {
        showToast('Invalid Amount', 'Please enter a valid amount to withdraw', 'error');
        return false;
    }
    
    if (!state.destAddress) {
        showToast('Missing Address', 'Please enter a destination address', 'error');
        return false;
    }
    
    // Check if user has enough funds
    const asset = state.portfolioAssets.find(a => a.symbol === state.selectedCurrency);
    if (!asset || asset.amount < parseFloat(state.withdrawAmount)) {
        showToast('Insufficient Funds', 'You do not have enough funds for this withdrawal', 'error');
        return false;
    }
    
    return true;
}

// Show card payment form
function showCardPayment() {
    document.querySelector('.card-deposit').classList.remove('active');
    document.querySelector('.card-payment').classList.add('active');
    updateTotalAmount();
}

// Handle crypto deposit
function handleCryptoDeposit() {
    if (!validateDepositAmount()) return;
    
    // Show loading state
    cryptoDepositBtn.disabled = true;
    cryptoDepositBtn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>Processing...';
    
    // Simulate API call latency
    setTimeout(() => {
        // Create transaction
        const newTransaction = {
            id: Math.floor(Math.random() * 1000),
            type: 'deposit',
            amount: parseFloat(state.depositAmount),
            coinId: getCoinIdFromSymbol(state.selectedCurrency),
            symbol: state.selectedCurrency,
            price: getPriceForCurrency(state.selectedCurrency),
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        // Add to transactions list
        state.transactions.unshift(newTransaction);
        
        // Update portfolio asset
        updatePortfolioAsset(state.selectedCurrency, parseFloat(state.depositAmount));
        
        // Show success notification
        showToast('Deposit Successful', `${state.depositAmount} ${state.selectedCurrency} has been added to your wallet`, 'success');
        
        // Reset form
        state.depositAmount = '';
        cryptoAmount.value = '';
        
        // Reset button state
        cryptoDepositBtn.disabled = false;
        cryptoDepositBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7 7 7-7"/></svg>Simulate Deposit';
        
        // Refresh UI
        loadTransactions();
        updatePortfolioDisplay();
    }, 1500);
}

// Handle card deposit
function handleCardDeposit() {
    if (!validateCardAmount()) return;
    
    // Show loading state
    completePaymentBtn.disabled = true;
    completePaymentBtn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>Processing Payment...';
    
    // Simulate API call latency
    setTimeout(() => {
        // Create transaction
        const newTransaction = {
            id: Math.floor(Math.random() * 1000),
            type: 'deposit',
            amount: parseFloat(state.depositAmount),
            coinId: getCoinIdFromSymbol(state.selectedCurrency),
            symbol: state.selectedCurrency,
            price: getPriceForCurrency(state.selectedCurrency),
            timestamp: new Date().toISOString(),
            status: 'completed',
            method: 'card'
        };
        
        // Add to transactions list
        state.transactions.unshift(newTransaction);
        
        // Update portfolio asset
        updatePortfolioAsset(state.selectedCurrency, parseFloat(state.depositAmount));
        
        // Show success notification
        showToast('Purchase Successful', `${state.depositAmount} ${state.selectedCurrency} has been added to your wallet`, 'success');
        
        // Reset form
        state.depositAmount = '';
        cardAmount.value = '';
        state.cardDetails = {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            name: ''
        };
        
        // Reset UI
        document.querySelector('.card-payment').classList.remove('active');
        document.querySelector('.card-deposit').classList.add('active');
        
        // Reset button state
        completePaymentBtn.disabled = false;
        completePaymentBtn.innerHTML = 'Complete Purchase';
        
        // Refresh UI
        loadTransactions();
        updatePortfolioDisplay();
    }, 1500);
}

// Handle withdrawal
function handleWithdrawal() {
    if (!validateWithdrawal()) return;
    
    // Show loading state
    withdrawBtn.disabled = true;
    withdrawBtn.innerHTML = '<svg class="spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>Processing...';
    
    // Simulate API call latency
    setTimeout(() => {
        // Create transaction
        const newTransaction = {
            id: Math.floor(Math.random() * 1000),
            type: 'withdrawal',
            amount: -parseFloat(state.withdrawAmount),
            coinId: getCoinIdFromSymbol(state.selectedCurrency),
            symbol: state.selectedCurrency,
            price: getPriceForCurrency(state.selectedCurrency),
            timestamp: new Date().toISOString(),
            status: 'completed',
            address: state.destAddress
        };
        
        // Add to transactions list
        state.transactions.unshift(newTransaction);
        
        // Update portfolio asset
        updatePortfolioAsset(state.selectedCurrency, -parseFloat(state.withdrawAmount));
        
        // Show success notification
        showToast('Withdrawal Successful', `${state.withdrawAmount} ${state.selectedCurrency} has been sent to the specified address`, 'success');
        
        // Reset form
        state.withdrawAmount = '';
        withdrawAmount.value = '';
        state.destAddress = '';
        destinationAddress.value = '';
        
        // Reset button state
        withdrawBtn.disabled = false;
        withdrawBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12l7-7 7 7"/></svg>Simulate Withdrawal';
        
        // Refresh UI
        loadTransactions();
        updatePortfolioDisplay();
    }, 1500);
}

// Update portfolio asset
function updatePortfolioAsset(symbol, amount) {
    const asset = state.portfolioAssets.find(a => a.symbol === symbol);
    
    if (asset) {
        asset.amount += amount;
        asset.updatedAt = new Date().toISOString();
    } else {
        // Create new asset if it doesn't exist
        const newAsset = {
            userId: 1,
            coinId: getCoinIdFromSymbol(symbol),
            symbol: symbol,
            name: getNameFromSymbol(symbol),
            amount: amount,
            id: state.portfolioAssets.length + 1,
            updatedAt: new Date().toISOString(),
            walletAddress: symbol === 'BTC' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : state.walletAddress
        };
        
        state.portfolioAssets.push(newAsset);
    }
}

// Get coin ID from symbol
function getCoinIdFromSymbol(symbol) {
    const mapping = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin'
    };
    
    return mapping[symbol] || 'unknown';
}

// Get coin name from symbol
function getNameFromSymbol(symbol) {
    const mapping = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Tether',
        'BNB': 'Binance Coin'
    };
    
    return mapping[symbol] || 'Unknown';
}

// Load transactions and update the UI
function loadTransactions() {
    // Clear current transactions
    while (transactionsList.firstChild) {
        transactionsList.removeChild(transactionsList.firstChild);
    }
    
    if (state.transactions.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-transactions';
        emptyState.innerHTML = `
            <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            </div>
            <div class="empty-text">No transactions yet</div>
        `;
        transactionsList.appendChild(emptyState);
        return;
    }
    
    // Add transactions
    state.transactions.forEach(tx => {
        const txItem = document.createElement('div');
        txItem.className = 'transaction-item';
        
        const isDeposit = tx.type === 'deposit';
        const formattedDate = formatDate(tx.timestamp);
        const amountValue = Math.abs(tx.amount);
        const amountClass = isDeposit ? 'positive' : 'negative';
        const amountPrefix = isDeposit ? '+' : '-';
        const iconType = isDeposit ? 'deposit' : 'withdraw';
        const iconSvg = isDeposit 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7 7 7-7"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12l7-7 7 7"/></svg>';
        
        txItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon ${iconType}">
                    ${iconSvg}
                </div>
                <div class="transaction-details">
                    <h4>${isDeposit ? 'Deposit' : 'Withdrawal'}</h4>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
            </div>
            <div class="transaction-amount">
                <div class="transaction-value ${amountClass}">${amountPrefix}${amountValue} ${tx.symbol}</div>
                <div class="transaction-asset">$${(amountValue * tx.price).toFixed(2)}</div>
            </div>
        `;
        
        transactionsList.appendChild(txItem);
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initWallet();
    
    // Add spinner style for loading indicators
    const style = document.createElement('style');
    style.textContent = `
        .spinner {
            animation: rotate 2s linear infinite;
            width: 16px;
            height: 16px;
            margin-right: 8px;
        }
        .path {
            stroke: white;
            stroke-linecap: round;
            animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate {
            100% {
                transform: rotate(360deg);
            }
        }
        @keyframes dash {
            0% {
                stroke-dasharray: 1, 150;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -35;
            }
            100% {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: -124;
            }
        }
    `;
    document.head.appendChild(style);
});