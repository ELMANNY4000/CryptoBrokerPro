// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Load common.js utility functions
    if (typeof apiRequest !== 'function') {
        const commonScript = document.createElement('script');
        commonScript.src = 'common.js';
        commonScript.onload = initDashboard;
        document.head.appendChild(commonScript);
    } else {
        initDashboard();
    }
});

function initDashboard() {
    // Update user info
    loadUserData()
        .then(user => {
            document.querySelector('.user-name').textContent = user.username;
            document.querySelector('.user-avatar').textContent = user.username.charAt(0).toUpperCase();
        })
        .catch(err => {
            console.error('Error loading user data:', err);
            showToast('Error', 'Failed to load user data. Please try again.', 'error');
        });

    // Load dashboard data
    loadDashboardData();

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Timeframe buttons for chart
    document.querySelectorAll('.timeframe-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const days = button.getAttribute('data-days');
            const coinId = document.getElementById('chartSymbol').textContent.toLowerCase();
            loadChartData(coinId, days);
        });
    });
}

async function loadDashboardData() {
    try {
        // Load all data in parallel
        const [marketData, portfolioData, transactionsData, miningWorkersData, miningRewardsData, userData] = await Promise.all([
            apiRequest('/api/crypto/markets'),
            apiRequest('/api/portfolio'),
            apiRequest('/api/transactions'),
            apiRequest('/api/mining/workers'),
            apiRequest('/api/mining/rewards'),
            apiRequest('/api/user')
        ]);
        
        // Process and display the data
        updateMarketOverview(marketData);
        updatePortfolioSummary(portfolioData, marketData);
        updateTransactionsList(transactionsData);
        updateMiningStats(miningWorkersData, miningRewardsData);
        
        // Load price chart for Bitcoin by default
        loadChartData('bitcoin', '1');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error', 'Failed to load dashboard data. Please try again.', 'error');
    }
}

function updateMarketOverview(marketData) {
    const tableBody = document.getElementById('marketTableBody');
    tableBody.innerHTML = '';
    
    if (!marketData || marketData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No market data available.</td>
            </tr>
        `;
        return;
    }
    
    marketData.forEach(coin => {
        const row = document.createElement('tr');
        
        // Format price change class
        const priceChangeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = coin.price_change_percentage_24h >= 0 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <img src="${coin.image}" alt="${coin.name}" style="width: 24px; height: 24px; margin-right: 8px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 600;">${coin.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${coin.symbol.toUpperCase()}</div>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-weight: 600;">${formatCurrency(coin.current_price)}</div>
            </td>
            <td>
                <div class="stat-change ${priceChangeClass}" style="display: flex; align-items: center;">
                    ${priceChangeIcon}
                    <span>${formatPercentage(coin.price_change_percentage_24h)}</span>
                </div>
            </td>
            <td>
                <div>${formatCurrency(coin.market_cap, true)}</div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="selectCoin('${coin.id}', '${coin.symbol}', ${coin.current_price})">
                    View
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updatePortfolioSummary(portfolioData, marketData) {
    const portfolioAssetsEl = document.getElementById('portfolioAssets');
    portfolioAssetsEl.innerHTML = '';
    
    if (!portfolioData || portfolioData.length === 0) {
        portfolioAssetsEl.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="margin-bottom: 1rem; color: var(--text-secondary);">No assets in your portfolio.</div>
                <button class="btn btn-primary">Add Asset</button>
            </div>
        `;
        return;
    }
    
    // Calculate total portfolio value
    let totalValue = 0;
    let totalChange = 0;
    
    portfolioData.forEach(asset => {
        const coin = marketData.find(c => c.id === asset.coinId);
        if (coin) {
            const assetValue = asset.amount * coin.current_price;
            totalValue += assetValue;
            totalChange += coin.price_change_percentage_24h * assetValue;
        }
    });
    
    // Calculate percentage change weighted by asset value
    const weightedChange = totalValue > 0 ? totalChange / totalValue : 0;
    
    // Update portfolio stats
    document.getElementById('portfolioValue').textContent = formatCurrency(totalValue);
    const portfolioChangeEl = document.getElementById('portfolioChange');
    portfolioChangeEl.textContent = formatPercentage(weightedChange);
    
    if (weightedChange >= 0) {
        portfolioChangeEl.parentElement.classList.add('positive');
        portfolioChangeEl.parentElement.classList.remove('negative');
    } else {
        portfolioChangeEl.parentElement.classList.add('negative');
        portfolioChangeEl.parentElement.classList.remove('positive');
    }
    
    // Create asset cards
    portfolioData.forEach(asset => {
        const coin = marketData.find(c => c.id === asset.coinId);
        if (coin) {
            const assetValue = asset.amount * coin.current_price;
            const assetCard = document.createElement('div');
            assetCard.className = 'asset-card';
            
            const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
            
            assetCard.innerHTML = `
                <div class="asset-icon">
                    <img src="${coin.image}" alt="${coin.name}" style="width: 24px; height: 24px; border-radius: 50%;">
                </div>
                <div class="asset-info">
                    <div class="asset-name">${coin.name}</div>
                    <div class="asset-amount">${formatNumber(asset.amount)} ${coin.symbol.toUpperCase()}</div>
                </div>
                <div class="asset-value">
                    <div class="asset-price">${formatCurrency(assetValue)}</div>
                    <div class="asset-change ${changeClass}">${formatPercentage(coin.price_change_percentage_24h)}</div>
                </div>
            `;
            
            portfolioAssetsEl.appendChild(assetCard);
        }
    });
}

function updateTransactionsList(transactionsData) {
    const transactionsListEl = document.getElementById('transactionsList');
    transactionsListEl.innerHTML = '';
    
    if (!transactionsData || transactionsData.length === 0) {
        transactionsListEl.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="color: var(--text-secondary);">No transactions yet.</div>
            </div>
        `;
        return;
    }
    
    // Show only the most recent 5 transactions
    const recentTransactions = transactionsData.slice(0, 5);
    
    recentTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        let iconType = '';
        let iconSvg = '';
        
        switch (transaction.type) {
            case 'buy':
                iconType = 'buy';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
                break;
            case 'sell':
                iconType = 'sell';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
                break;
            case 'deposit':
                iconType = 'deposit';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>';
                break;
            case 'withdraw':
                iconType = 'withdraw';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>';
                break;
            case 'mining_reward':
                iconType = 'mining';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.23"/><path d="M21 3v9h-9"/></svg>';
                break;
            default:
                iconType = 'deposit';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>';
        }
        
        const formattedType = transaction.type.replace('_', ' ');
        const capitalizedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
        
        transactionItem.innerHTML = `
            <div class="transaction-icon ${iconType}">
                ${iconSvg}
            </div>
            <div class="transaction-info">
                <div class="transaction-type">${capitalizedType}</div>
                <div class="transaction-date">${formatDateTime(transaction.timestamp)}</div>
            </div>
            <div class="transaction-amount">
                ${transaction.type === 'sell' || transaction.type === 'withdraw' ? '-' : '+'}${formatNumber(transaction.amount)} ${transaction.symbol}
            </div>
        `;
        
        transactionsListEl.appendChild(transactionItem);
    });
}

function updateMiningStats(workers, rewards) {
    // Update mining stats
    const activeWorkerCount = workers.filter(worker => worker.isActive).length;
    document.getElementById('activeWorkers').textContent = `${activeWorkerCount}/${workers.length}`;
    
    // Calculate total hashrate
    const totalHashrate = workers.reduce((sum, worker) => {
        return sum + (worker.isActive ? worker.hashrate : 0);
    }, 0);
    
    document.getElementById('totalHashrate').textContent = `${formatNumber(totalHashrate)} MH/s`;
    
    // Calculate daily rewards (most recent day)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentRewards = rewards.filter(reward => {
        const rewardDate = new Date(reward.timestamp);
        return rewardDate > oneDayAgo;
    });
    
    const dailyRewardAmount = recentRewards.reduce((sum, reward) => sum + reward.amount, 0);
    document.getElementById('dailyRewards').textContent = `${dailyRewardAmount.toFixed(6)} BTC`;
    
    // Calculate trading volume from transactions
    // This would typically come from another API endpoint in a real application
    document.getElementById('tradingVolume').textContent = formatCurrency(25000);
    document.getElementById('volumeChange').textContent = '+5.2%';
    
    // Update mining rewards stat
    const totalMiningRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
    document.getElementById('miningRewards').textContent = `${totalMiningRewards.toFixed(6)} BTC`;
    document.getElementById('rewardsChange').textContent = '+2.8%';
    
    // Display workers
    const workersContainer = document.getElementById('miningWorkers');
    workersContainer.innerHTML = '';
    
    workers.forEach(worker => {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker-card';
        
        const dailyReward = (worker.hashrate / 1000) * 0.00001 * (worker.isActive ? 1 : 0);
        
        workerCard.innerHTML = `
            <div class="worker-header">
                <div class="worker-name">${worker.name}</div>
                <div class="worker-status ${worker.isActive ? 'active' : 'inactive'}">
                    ${worker.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div class="worker-info">
                <div class="worker-stat">
                    <div class="worker-stat-title">Hashrate:</div>
                    <div class="worker-stat-value">${formatNumber(worker.hashrate)} MH/s</div>
                </div>
                <div class="worker-stat">
                    <div class="worker-stat-title">Daily Est.:</div>
                    <div class="worker-stat-value">${dailyReward.toFixed(6)} BTC</div>
                </div>
            </div>
        `;
        
        workersContainer.appendChild(workerCard);
    });
}

async function loadChartData(coinId = 'bitcoin', days = '1') {
    const chartLoadingEl = document.getElementById('chartLoading');
    chartLoadingEl.style.display = 'flex';
    
    try {
        const chartData = await apiRequest(`/api/crypto/${coinId}/chart?days=${days}`);
        const marketData = await apiRequest('/api/crypto/markets');
        
        // Find the current coin data
        const coinData = marketData.find(coin => coin.id === coinId) || {
            symbol: 'BTC',
            current_price: 0,
            price_change_percentage_24h: 0
        };
        
        // Update chart symbol and price info
        document.getElementById('chartSymbol').textContent = coinData.symbol.toUpperCase();
        document.getElementById('chartPrice').textContent = formatCurrency(coinData.current_price);
        
        const chartPriceChangeEl = document.getElementById('chartPriceChange');
        const changeValue = chartPriceChangeEl.querySelector('.change-value');
        changeValue.textContent = formatPercentage(coinData.price_change_percentage_24h);
        
        if (coinData.price_change_percentage_24h >= 0) {
            chartPriceChangeEl.classList.add('positive');
            chartPriceChangeEl.classList.remove('negative');
        } else {
            chartPriceChangeEl.classList.add('negative');
            chartPriceChangeEl.classList.remove('positive');
        }
        
        // Render chart
        renderChart(chartData, coinData.symbol.toUpperCase(), days);
    } catch (error) {
        console.error('Error loading chart data:', error);
        showToast('Error', 'Failed to load chart data. Please try again.', 'error');
    } finally {
        chartLoadingEl.style.display = 'none';
    }
}

function renderChart(chartData, symbol, days) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.priceChart instanceof Chart) {
        window.priceChart.destroy();
    }
    
    // Format the time labels based on selected time period
    const timeUnit = getTimeUnitForPeriod(days);
    
    // Prepare data
    const timestamps = chartData.prices.map(dataPoint => new Date(dataPoint[0]));
    const prices = chartData.prices.map(dataPoint => dataPoint[1]);
    
    // Calculate gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(95, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(95, 102, 241, 0)');
    
    // Create chart
    window.priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: `${symbol}/USD`,
                data: prices,
                borderColor: '#5f66f1',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHitRadius: 10,
                backgroundColor: gradient,
                fill: true
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
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1a1a1a',
                    titleColor: '#ffffff',
                    bodyColor: '#a0a0a0',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        title: (tooltipItems) => {
                            const date = new Date(tooltipItems[0].parsed.x);
                            return formatDate(date);
                        },
                        label: (tooltipItem) => {
                            return `Price: ${formatCurrency(tooltipItem.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeUnit,
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MMM d',
                            week: 'MMM d',
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        callback: (value) => formatCurrency(value, true)
                    }
                }
            }
        }
    });
}

function getTimeUnitForPeriod(days) {
    const daysNum = parseInt(days);
    if (daysNum <= 1) return 'hour';
    if (daysNum <= 7) return 'day';
    if (daysNum <= 30) return 'week';
    return 'month';
}

function selectCoin(coinId, symbol, price) {
    // Update chart with selected coin
    loadChartData(coinId, document.querySelector('.timeframe-btn.active').getAttribute('data-days'));
    
    // Scroll to chart section
    document.querySelector('.chart-card').scrollIntoView({ behavior: 'smooth' });
}