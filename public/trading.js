/**
 * Trading JavaScript File
 */

// Global variables
let currentMarketData = [];
let selectedCoin = {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 0,
    change: 0
};
let priceChart = null;
let userPortfolio = [];
let userBalances = {
    usd: 0,
    crypto: {}
};
const FEE_PERCENTAGE = 0.003; // 0.3%
let currentPeriod = '1'; // Default to 1 day

document.addEventListener('DOMContentLoaded', function() {
    // Get coin ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('coin');
    
    if (coinId) {
        selectedCoin.id = coinId;
    }
    
    // Load initial data
    loadData();
    
    // Setup tab switching
    setupTabs();
    
    // Setup trading form inputs
    setupTradingForms();
    
    // Setup time period selectors
    setupTimePeriodSelector();
});

async function loadData() {
    try {
        // Load market data
        await loadMarketData();
        
        // Load user portfolio
        await loadUserPortfolio();
        
        // Load selected coin details
        await loadSelectedCoinDetails();
        
        // Load chart data
        await loadChartData();
        
        // Load recent transactions
        await loadRecentTransactions();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error', 'Failed to load data', 'error');
    }
}

async function loadMarketData() {
    try {
        const tableBody = document.getElementById('market-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-cell">
                    <div class="loading-spinner"></div>
                </td>
            </tr>
        `;
        
        // Load market data
        currentMarketData = await apiRequest('/crypto/markets');
        
        if (currentMarketData && currentMarketData.length > 0) {
            tableBody.innerHTML = '';
            
            currentMarketData.forEach(coin => {
                const row = createMarketRow(coin);
                tableBody.appendChild(row);
            });
            
            // If the selected coin is not found in the market data, default to the first coin
            if (!currentMarketData.find(coin => coin.id === selectedCoin.id)) {
                selectedCoin = {
                    id: currentMarketData[0].id,
                    symbol: currentMarketData[0].symbol,
                    name: currentMarketData[0].name,
                    price: currentMarketData[0].current_price,
                    change: currentMarketData[0].price_change_percentage_24h
                };
            }
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        No market data available
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Failed to load market data:', error);
        document.getElementById('market-table-body').innerHTML = `
            <tr>
                <td colspan="5" class="loading-cell">
                    Failed to load market data
                </td>
            </tr>
        `;
    }
}

function createMarketRow(coin) {
    const isPositive = coin.price_change_percentage_24h >= 0;
    const colorKey = coin.id.toLowerCase();
    const color = COIN_COLORS[colorKey] || '#6B7280';
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="coin-cell">
                <div class="coin-icon" style="background-color: ${color}20; color: ${color}">
                    ${coin.symbol.toUpperCase().substring(0, 2)}
                </div>
                <div class="coin-details">
                    <div class="coin-name">${coin.name}</div>
                    <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                </div>
            </div>
        </td>
        <td class="market-price">${formatCurrency(coin.current_price)}</td>
        <td>
            <span class="market-change ${isPositive ? 'positive' : 'negative'}">
                ${isPositive ? '+' : ''}${formatPercentage(coin.price_change_percentage_24h)}
            </span>
        </td>
        <td class="market-cap">${formatCurrency(coin.market_cap, true)}</td>
        <td>
            <div class="market-actions">
                <button class="market-action-btn btn btn-outline" onclick="selectCoin('${coin.id}')">Trade</button>
            </div>
        </td>
    `;
    
    return row;
}

async function loadUserPortfolio() {
    try {
        // Load user data to get USD balance
        const userData = await apiRequest('/user');
        userBalances.usd = userData.balance || 0;
        
        // Update available balance in trading forms
        document.getElementById('available-balance').textContent = formatCurrency(userBalances.usd);
        
        // Load portfolio assets
        const portfolioAssets = await apiRequest('/portfolio');
        userPortfolio = portfolioAssets;
        
        // Update crypto balances
        userPortfolio.forEach(asset => {
            userBalances.crypto[asset.coinId] = asset.amount;
        });
        
        // Update available crypto balance in trading form
        updateAvailableCrypto();
    } catch (error) {
        console.error('Failed to load user portfolio:', error);
        showToast('Error', 'Failed to load your portfolio data', 'error');
    }
}

function updateAvailableCrypto() {
    const amount = userBalances.crypto[selectedCoin.id] || 0;
    document.getElementById('available-crypto').textContent = `${formatNumber(amount, 8)} ${selectedCoin.symbol.toUpperCase()}`;
}

async function loadSelectedCoinDetails() {
    try {
        // Find selected coin in market data
        const coinData = currentMarketData.find(coin => coin.id === selectedCoin.id);
        
        if (coinData) {
            selectedCoin = {
                id: coinData.id,
                symbol: coinData.symbol,
                name: coinData.name,
                price: coinData.current_price,
                change: coinData.price_change_percentage_24h
            };
            
            // Update UI with selected coin details
            updateSelectedCoinUI();
        } else {
            // If coin not found in market data, try to get it directly
            const coinDetails = await apiRequest(`/crypto/${selectedCoin.id}`);
            
            if (coinDetails) {
                selectedCoin = {
                    id: coinDetails.id,
                    symbol: coinDetails.symbol,
                    name: coinDetails.name,
                    price: coinDetails.current_price,
                    change: coinDetails.price_change_percentage_24h || 0
                };
                
                updateSelectedCoinUI();
            }
        }
    } catch (error) {
        console.error('Failed to load selected coin details:', error);
        showToast('Error', 'Failed to load selected coin details', 'error');
    }
}

function updateSelectedCoinUI() {
    const colorKey = selectedCoin.id.toLowerCase();
    const color = COIN_COLORS[colorKey] || '#6B7280';
    const isPositive = selectedCoin.change >= 0;
    
    // Update coin icon
    const iconElement = document.getElementById('selected-coin-icon');
    iconElement.textContent = selectedCoin.symbol.toUpperCase().substring(0, 2);
    iconElement.style.backgroundColor = `${color}20`;
    iconElement.style.color = color;
    
    // Update coin name
    document.getElementById('selected-coin-name').textContent = selectedCoin.name;
    
    // Update coin price
    document.getElementById('selected-coin-price').textContent = formatCurrency(selectedCoin.price);
    
    // Update coin change
    const changeElement = document.getElementById('selected-coin-change');
    changeElement.textContent = isPositive ? 
        `+${formatPercentage(selectedCoin.change)}` : 
        formatPercentage(selectedCoin.change);
    changeElement.className = `coin-change ${isPositive ? 'positive' : 'negative'}`;
    
    // Update trading form currency labels
    document.getElementById('buy-currency').textContent = selectedCoin.symbol.toUpperCase();
    document.getElementById('sell-currency').textContent = selectedCoin.symbol.toUpperCase();
    
    // Update available crypto balance
    updateAvailableCrypto();
    
    // Update document title
    document.title = `${selectedCoin.symbol.toUpperCase()} - Trading - Trading Desk`;
}

async function loadChartData() {
    try {
        document.getElementById('chart-loading').style.display = 'block';
        
        // Load chart data for selected coin
        const chartData = await apiRequest(`/crypto/${selectedCoin.id}/chart?days=${currentPeriod}`);
        
        if (chartData && chartData.prices && chartData.prices.length > 0) {
            updatePriceChart(chartData);
        } else {
            // Handle empty chart data
            if (priceChart) {
                priceChart.destroy();
                priceChart = null;
            }
            
            showToast('Warning', 'No chart data available for this cryptocurrency', 'warning');
        }
        
        document.getElementById('chart-loading').style.display = 'none';
    } catch (error) {
        console.error('Failed to load chart data:', error);
        document.getElementById('chart-loading').style.display = 'none';
        
        if (priceChart) {
            priceChart.destroy();
            priceChart = null;
        }
        
        showToast('Error', 'Failed to load price chart data', 'error');
    }
}

function updatePriceChart(chartData) {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    // Prepare chart data
    const timestamps = chartData.prices.map(price => price[0]);
    const prices = chartData.prices.map(price => price[1]);
    
    // Get color based on price trend
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const priceIncreased = endPrice >= startPrice;
    
    const colorKey = selectedCoin.id.toLowerCase();
    const baseColor = COIN_COLORS[colorKey] || (priceIncreased ? '#10b981' : '#ef4444');
    
    // Destroy previous chart if exists
    if (priceChart) {
        priceChart.destroy();
    }
    
    // Create new chart
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: `${selectedCoin.name} Price`,
                data: prices,
                borderColor: baseColor,
                backgroundColor: `${baseColor}20`,
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const date = new Date(tooltipItems[0].parsed.x);
                            return formatDateTime(date);
                        },
                        label: function(context) {
                            return `${selectedCoin.name}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: getTimeUnitForPeriod(currentPeriod)
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 15
                    }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function getTimeUnitForPeriod(period) {
    switch (period) {
        case '1':
            return 'hour';
        case '7':
            return 'day';
        case '30':
            return 'day';
        case '90':
            return 'week';
        case '365':
            return 'month';
        default:
            return 'day';
    }
}

async function loadRecentTransactions() {
    try {
        const tableBody = document.getElementById('transactions-table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    <div class="loading-spinner"></div>
                </td>
            </tr>
        `;
        
        // Load transactions (filter for buy/sell only)
        const allTransactions = await apiRequest('/transactions');
        const tradingTransactions = allTransactions.filter(
            tx => tx.type === 'buy' || tx.type === 'sell'
        );
        
        if (tradingTransactions && tradingTransactions.length > 0) {
            tableBody.innerHTML = '';
            
            // Sort by timestamp, newest first
            tradingTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Display only the latest 10 transactions
            const recentTransactions = tradingTransactions.slice(0, 10);
            
            recentTransactions.forEach(transaction => {
                const row = createTransactionRow(transaction);
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-cell">
                        No trading transactions found
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Failed to load recent transactions:', error);
        document.getElementById('transactions-table-body').innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    Failed to load transaction history
                </td>
            </tr>
        `;
    }
}

function createTransactionRow(transaction) {
    const isBuy = transaction.type === 'buy';
    const totalValue = transaction.price * transaction.amount;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <span class="transaction-type ${transaction.type}">
                ${isBuy ? 'Buy' : 'Sell'}
            </span>
        </td>
        <td>
            <div class="coin-cell">
                <div class="coin-icon" style="background-color: ${COIN_COLORS[transaction.coinId] || '#6B7280'}20; color: ${COIN_COLORS[transaction.coinId] || '#6B7280'}">
                    ${transaction.coinSymbol.toUpperCase().substring(0, 2)}
                </div>
                <div class="coin-details">
                    <div class="coin-name">${transaction.coinName || transaction.coinSymbol.toUpperCase()}</div>
                    <div class="coin-symbol">${transaction.coinSymbol.toUpperCase()}</div>
                </div>
            </div>
        </td>
        <td class="transaction-amount">${formatNumber(transaction.amount, 8)} ${transaction.coinSymbol.toUpperCase()}</td>
        <td class="transaction-price">${formatCurrency(transaction.price)} per ${transaction.coinSymbol.toUpperCase()}</td>
        <td class="transaction-total">${formatCurrency(totalValue)}</td>
        <td class="transaction-date">${formatDateTime(transaction.timestamp)}</td>
    `;
    
    return row;
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active state for tab buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show the selected tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function setupTradingForms() {
    const buyAmountInput = document.getElementById('buy-amount');
    const buyTotalInput = document.getElementById('buy-total');
    const sellAmountInput = document.getElementById('sell-amount');
    const sellTotalInput = document.getElementById('sell-total');
    
    // Buy amount input change handler
    buyAmountInput.addEventListener('input', () => {
        if (buyAmountInput.value && selectedCoin.price) {
            const amount = parseFloat(buyAmountInput.value);
            const total = amount * selectedCoin.price;
            buyTotalInput.value = total.toFixed(2);
            updateBuyFees(total);
        } else {
            buyTotalInput.value = '';
            updateBuyFees(0);
        }
    });
    
    // Buy total input change handler
    buyTotalInput.addEventListener('input', () => {
        if (buyTotalInput.value && selectedCoin.price) {
            const total = parseFloat(buyTotalInput.value);
            const amount = total / selectedCoin.price;
            buyAmountInput.value = amount.toFixed(8);
            updateBuyFees(total);
        } else {
            buyAmountInput.value = '';
            updateBuyFees(0);
        }
    });
    
    // Sell amount input change handler
    sellAmountInput.addEventListener('input', () => {
        if (sellAmountInput.value && selectedCoin.price) {
            const amount = parseFloat(sellAmountInput.value);
            const total = amount * selectedCoin.price;
            sellTotalInput.value = total.toFixed(2);
            updateSellFees(total);
        } else {
            sellTotalInput.value = '';
            updateSellFees(0);
        }
    });
    
    // Sell total input change handler
    sellTotalInput.addEventListener('input', () => {
        if (sellTotalInput.value && selectedCoin.price) {
            const total = parseFloat(sellTotalInput.value);
            const amount = total / selectedCoin.price;
            sellAmountInput.value = amount.toFixed(8);
            updateSellFees(total);
        } else {
            sellAmountInput.value = '';
            updateSellFees(0);
        }
    });
    
    // Buy form submit handler
    document.getElementById('buy-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const amount = parseFloat(buyAmountInput.value);
        const total = parseFloat(buyTotalInput.value);
        const fee = total * FEE_PERCENTAGE;
        const totalWithFee = total + fee;
        
        // Validate inputs
        if (!amount || amount <= 0) {
            showToast('Error', 'Please enter a valid amount to buy', 'error');
            return;
        }
        
        if (totalWithFee > userBalances.usd) {
            showToast('Error', 'Insufficient balance for this purchase', 'error');
            return;
        }
        
        try {
            // Create transaction
            await apiRequest('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'buy',
                    coinId: selectedCoin.id,
                    coinSymbol: selectedCoin.symbol,
                    coinName: selectedCoin.name,
                    amount: amount,
                    price: selectedCoin.price
                })
            });
            
            showToast('Success', `Successfully purchased ${amount} ${selectedCoin.symbol.toUpperCase()}`, 'success');
            
            // Reset form
            buyAmountInput.value = '';
            buyTotalInput.value = '';
            updateBuyFees(0);
            
            // Reload data
            await loadUserPortfolio();
            await loadRecentTransactions();
        } catch (error) {
            console.error('Failed to execute buy order:', error);
            showToast('Error', 'Failed to execute buy order', 'error');
        }
    });
    
    // Sell form submit handler
    document.getElementById('sell-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const amount = parseFloat(sellAmountInput.value);
        const availableAmount = userBalances.crypto[selectedCoin.id] || 0;
        
        // Validate inputs
        if (!amount || amount <= 0) {
            showToast('Error', 'Please enter a valid amount to sell', 'error');
            return;
        }
        
        if (amount > availableAmount) {
            showToast('Error', 'Insufficient crypto balance for this sale', 'error');
            return;
        }
        
        try {
            // Create transaction
            await apiRequest('/transactions', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'sell',
                    coinId: selectedCoin.id,
                    coinSymbol: selectedCoin.symbol,
                    coinName: selectedCoin.name,
                    amount: amount,
                    price: selectedCoin.price
                })
            });
            
            showToast('Success', `Successfully sold ${amount} ${selectedCoin.symbol.toUpperCase()}`, 'success');
            
            // Reset form
            sellAmountInput.value = '';
            sellTotalInput.value = '';
            updateSellFees(0);
            
            // Reload data
            await loadUserPortfolio();
            await loadRecentTransactions();
        } catch (error) {
            console.error('Failed to execute sell order:', error);
            showToast('Error', 'Failed to execute sell order', 'error');
        }
    });
}

function updateBuyFees(total) {
    const fee = total * FEE_PERCENTAGE;
    const totalWithFee = total + fee;
    
    document.getElementById('buy-fee').textContent = formatCurrency(fee);
    document.getElementById('buy-total-with-fee').textContent = formatCurrency(totalWithFee);
}

function updateSellFees(total) {
    const fee = total * FEE_PERCENTAGE;
    const totalWithFee = total - fee;
    
    document.getElementById('sell-fee').textContent = formatCurrency(fee);
    document.getElementById('sell-total-with-fee').textContent = formatCurrency(totalWithFee);
}

function setupTimePeriodSelector() {
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const period = button.getAttribute('data-period');
            
            // Skip if same period is selected
            if (period === currentPeriod) return;
            
            // Update active state
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current period and reload chart
            currentPeriod = period;
            await loadChartData();
        });
    });
}

// Function to select a coin for trading
async function selectCoin(coinId) {
    if (coinId === selectedCoin.id) return;
    
    selectedCoin.id = coinId;
    
    // Update selected coin details
    await loadSelectedCoinDetails();
    
    // Load chart data for selected coin
    await loadChartData();
    
    // Reset trading forms
    document.getElementById('buy-amount').value = '';
    document.getElementById('buy-total').value = '';
    document.getElementById('sell-amount').value = '';
    document.getElementById('sell-total').value = '';
    updateBuyFees(0);
    updateSellFees(0);
    
    // Scroll to trading interface on mobile
    if (window.innerWidth <= 1024) {
        document.querySelector('.trading-interface').scrollIntoView({ behavior: 'smooth' });
    }
}