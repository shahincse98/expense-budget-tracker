/**
 * হিসাবখাতা — Smart Expense & Budget Tracker
 * Core Application Logic & State Management
 */

// ==========================================================================
// Category Definitions with Icons & Accent Colors
// ==========================================================================
const CATEGORIES = {
  expense: {
    Food: { name: 'খাদ্য ও রেস্তোরাঁ', icon: '🍔', color: '#f59e0b' },
    Housing: { name: 'বাসা ভাড়া ও ইউটিলিটি', icon: '🏠', color: '#3b82f6' },
    Transport: { name: 'যাতায়াত', icon: '🚗', color: '#06b6d4' },
    Shopping: { name: 'কেনাকাটা ও পোশাক', icon: '🛍️', color: '#ec4899' },
    Health: { name: 'স্বাস্থ্য ও ওষুধ', icon: '💊', color: '#10b981' },
    Entertainment: { name: 'বিনোদন ও সিনেমা', icon: '🎬', color: '#8b5cf6' },
    Education: { name: 'শিক্ষা ও বই', icon: '📚', color: '#6366f1' },
    Bills: { name: 'মোবাইল ও ওয়াইফাই বিল', icon: '📱', color: '#14b8a6' },
    Other_Exp: { name: 'অন্যান্য খরচ', icon: '📦', color: '#64748b' }
  },
  income: {
    Salary: { name: 'মাসিক বেতন', icon: '💼', color: '#10b981' },
    Freelance: { name: 'ফ্রিল্যান্সিং', icon: '💻', color: '#06b6d4' },
    Business: { name: 'ব্যবসা থেকে মুনাফা', icon: '📈', color: '#3b82f6' },
    Investment: { name: 'বিনিয়োগ ও ডিভিডেন্ড', icon: '🪙', color: '#f59e0b' },
    Gift: { name: 'উপহার ও বোনাস', icon: '🎁', color: '#ec4899' },
    Other_Inc: { name: 'অন্যান্য আয়', icon: '💰', color: '#8b5cf6' }
  }
};

const CURRENCY_SYMBOLS = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  INR: '₹'
};

// ==========================================================================
// Seed Data (Realistic initial sample data for instant WOW effect)
// ==========================================================================
function getInitialSampleData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 45000,
      category: 'Salary',
      date: `${year}-${month}-01`,
      paymentMethod: 'Bank',
      note: 'অফিসের মাসিক বেতন'
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 12000,
      category: 'Freelance',
      date: `${year}-${month}-05`,
      paymentMethod: 'bKash',
      note: 'ওয়েব ডিজাইন ক্লায়েন্ট প্রজেক্ট'
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 15000,
      category: 'Housing',
      date: `${year}-${month}-03`,
      paymentMethod: 'Bank',
      note: 'ফ্ল্যাট বাসা ভাড়া'
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 4500,
      category: 'Food',
      date: `${year}-${month}-07`,
      paymentMethod: 'Cash',
      note: 'সাপ্তাহিক সুপারশপ বাজার'
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 1200,
      category: 'Transport',
      date: `${year}-${month}-09`,
      paymentMethod: 'Cash',
      note: 'উবার ও সিএনজি ভাড়া'
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 1800,
      category: 'Bills',
      date: `${year}-${month}-10`,
      paymentMethod: 'Nagad',
      note: 'ইন্টারনেট ও বিদ্যুৎ বিল'
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 3200,
      category: 'Shopping',
      date: `${year}-${month}-12`,
      paymentMethod: 'Card',
      note: 'নতুন জুতো ও শার্ট'
    }
  ];
}

// ==========================================================================
// State Manager
// ==========================================================================
const AppState = {
  transactions: [],
  monthlyBudget: 30000,
  currency: 'BDT',
  theme: 'dark',
  filter: {
    search: '',
    type: 'all',
    category: 'all',
    period: 'all_time'
  },
  charts: {
    categoryChart: null,
    trendsChart: null
  },

  init() {
    // Load theme
    this.theme = localStorage.getItem('fintrack_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcons();

    // Load currency
    this.currency = localStorage.getItem('fintrack_currency') || 'BDT';
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) currencySelect.value = this.currency;
    this.updateCurrencySymbols();

    // Load budget
    const savedBudget = localStorage.getItem('fintrack_budget');
    this.monthlyBudget = savedBudget ? parseFloat(savedBudget) : 30000;
    const budgetInput = document.getElementById('monthlyBudgetInput');
    if (budgetInput) budgetInput.value = this.monthlyBudget;

    // Load transactions
    const savedTx = localStorage.getItem('fintrack_transactions');
    if (savedTx) {
      try {
        this.transactions = JSON.parse(savedTx);
      } catch (e) {
        this.transactions = getInitialSampleData();
      }
    } else {
      this.transactions = getInitialSampleData();
      this.saveTransactions();
    }
  },

  saveTransactions() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(this.transactions));
  },

  saveBudget(amount) {
    this.monthlyBudget = amount;
    localStorage.setItem('fintrack_budget', amount.toString());
  },

  setCurrency(curr) {
    this.currency = curr;
    localStorage.setItem('fintrack_currency', curr);
    this.updateCurrencySymbols();
  },

  updateCurrencySymbols() {
    const symbol = CURRENCY_SYMBOLS[this.currency] || '৳';
    document.querySelectorAll('[data-currency-symbol]').forEach(el => {
      el.textContent = symbol;
    });
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('fintrack_theme', this.theme);
    this.updateThemeIcons();
    // Re-render charts for theme contrast
    renderCharts();
  },

  updateThemeIcons() {
    const darkIcon = document.getElementById('themeIconDark');
    const lightIcon = document.getElementById('themeIconLight');
    if (this.theme === 'dark') {
      darkIcon.classList.remove('hidden');
      lightIcon.classList.add('hidden');
    } else {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
    }
  }
};

// ==========================================================================
// Number & Date Formatters
// ==========================================================================
function formatCurrency(number) {
  const symbol = CURRENCY_SYMBOLS[AppState.currency] || '৳';
  const formatted = Math.abs(number).toLocaleString('bn-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return `${symbol} ${formatted}`;
}

function formatRawNumber(number) {
  return Math.abs(number).toLocaleString('bn-BD');
}

function formatDateBengali(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${monthsBn[mIndex] || month}, ${year}`;
}

// ==========================================================================
// Calculations & Summaries
// ==========================================================================
function calculateKPIs() {
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  // Current Month calculations for budget
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let thisMonthSpent = 0;

  AppState.transactions.forEach(tx => {
    const amt = parseFloat(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amt;
      incomeCount++;
    } else {
      totalExpense += amt;
      expenseCount++;

      // Check if transaction is within this month
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        thisMonthSpent += amt;
      }
    }
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const budgetPercent = AppState.monthlyBudget > 0 ? Math.round((thisMonthSpent / AppState.monthlyBudget) * 100) : 0;
  const budgetRemaining = AppState.monthlyBudget - thisMonthSpent;

  return {
    netBalance,
    totalIncome,
    totalExpense,
    incomeCount,
    expenseCount,
    savingsRate,
    thisMonthSpent,
    budgetPercent,
    budgetRemaining
  };
}

// ==========================================================================
// UI Updaters
// ==========================================================================
function updateDashboardUI() {
  const kpis = calculateKPIs();

  // Balance Card
  const balanceEl = document.getElementById('totalBalanceVal');
  balanceEl.textContent = formatRawNumber(kpis.netBalance);
  if (kpis.netBalance < 0) {
    balanceEl.classList.add('text-expense');
    balanceEl.classList.remove('text-income');
    document.getElementById('balanceStatusBadge').className = 'kpi-badge badge-danger';
    document.getElementById('balanceStatusBadge').textContent = 'ঘাটতি';
  } else {
    balanceEl.classList.remove('text-expense');
    balanceEl.classList.add('text-income');
    document.getElementById('balanceStatusBadge').className = 'kpi-badge badge-neutral';
    document.getElementById('balanceStatusBadge').textContent = 'সন্তোষজনক';
  }

  document.getElementById('netSavingsRate').textContent = `সঞ্চয় হার: ${kpis.savingsRate}%`;

  // Income & Expense
  document.getElementById('totalIncomeVal').textContent = formatRawNumber(kpis.totalIncome);
  document.getElementById('incomeCountText').textContent = `${kpis.incomeCount}টি লেনদেন`;

  document.getElementById('totalExpenseVal').textContent = formatRawNumber(kpis.totalExpense);
  document.getElementById('expenseCountText').textContent = `${kpis.expenseCount}টি লেনদেন`;

  // Budget Card
  document.getElementById('budgetSpentVal').textContent = formatCurrency(kpis.thisMonthSpent);
  document.getElementById('budgetLimitVal').textContent = `/ ${formatCurrency(AppState.monthlyBudget)}`;
  document.getElementById('budgetPercentText').textContent = `${kpis.budgetPercent}% ব্যয় হয়েছে`;

  const remainingEl = document.getElementById('budgetRemainingText');
  if (kpis.budgetRemaining >= 0) {
    remainingEl.textContent = `অবশিষ্ট ${formatCurrency(kpis.budgetRemaining)}`;
    remainingEl.style.color = '';
  } else {
    remainingEl.textContent = `বাজেট অতিক্রম: ${formatCurrency(Math.abs(kpis.budgetRemaining))}`;
    remainingEl.style.color = 'var(--color-expense)';
  }

  // Progress Bar styling
  const progressBar = document.getElementById('budgetProgressBar');
  const cappedWidth = Math.min(100, Math.max(0, kpis.budgetPercent));
  progressBar.style.width = `${cappedWidth}%`;
  progressBar.classList.remove('warning', 'danger');

  if (kpis.budgetPercent >= 100) {
    progressBar.classList.add('danger');
  } else if (kpis.budgetPercent >= 80) {
    progressBar.classList.add('warning');
  }

  // Budget Warning Banner
  const alertBanner = document.getElementById('budgetAlertBanner');
  if (kpis.budgetPercent >= 100) {
    alertBanner.classList.remove('hidden');
    document.getElementById('budgetAlertTitle').textContent = 'সতর্কতা: বাজেট অতিক্রম করেছে!';
    document.getElementById('budgetAlertDesc').textContent = `আপনি আপনার মাসিক বাজেট (${formatCurrency(AppState.monthlyBudget)}) অতিক্রম করে ফেলেছেন।`;
  } else if (kpis.budgetPercent >= 80) {
    alertBanner.classList.remove('hidden');
    document.getElementById('budgetAlertTitle').textContent = 'বাজেট সতর্কতা!';
    document.getElementById('budgetAlertDesc').textContent = `চলতি মাসে আপনি বাজেটের ${kpis.budgetPercent}% খরচ করে ফেলেছেন। সাবধানে ব্যয় করুন।`;
  } else {
    alertBanner.classList.add('hidden');
  }
}

// ==========================================================================
// Filtered Transactions & Table Rendering
// ==========================================================================
function getFilteredTransactions() {
  const { search, type, category, period } = AppState.filter;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return AppState.transactions.filter(tx => {
    // Type Filter
    if (type !== 'all' && tx.type !== type) return false;

    // Category Filter
    if (category !== 'all' && tx.category !== category) return false;

    // Search Query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const noteMatch = (tx.note || '').toLowerCase().includes(q);
      const catConfig = CATEGORIES[tx.type]?.[tx.category];
      const catNameMatch = catConfig && catConfig.name.toLowerCase().includes(q);
      const amountMatch = tx.amount.toString().includes(q);
      if (!noteMatch && !catNameMatch && !amountMatch) return false;
    }

    // Period Filter
    if (period !== 'all_time') {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      if (period === 'this_month') {
        if (txYear !== currentYear || txMonth !== currentMonth) return false;
      } else if (period === 'last_month') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (txYear !== lastMonthDate.getFullYear() || txMonth !== lastMonthDate.getMonth()) return false;
      } else if (period === 'this_year') {
        if (txYear !== currentYear) return false;
      }
    }

    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTransactionsTable() {
  const filtered = getFilteredTransactions();
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('emptyState');
  const countText = document.getElementById('showingCountText');

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    countText.textContent = '০টি লেনদেন দেখানো হচ্ছে';
    return;
  }

  emptyState.classList.add('hidden');
  countText.textContent = `${filtered.length}টি লেনদেন দেখানো হচ্ছে`;

  filtered.forEach(tx => {
    const isIncome = tx.type === 'income';
    const catConfig = CATEGORIES[tx.type]?.[tx.category] || {
      name: tx.category,
      icon: '📝',
      color: '#64748b'
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="category-cell">
          <div class="category-icon-wrapper" style="background: ${catConfig.color}20; color: ${catConfig.color};">
            ${catConfig.icon}
          </div>
          <div class="category-info">
            <span class="category-name">${catConfig.name}</span>
            <span class="transaction-note">${escapeHtml(tx.note || 'কোনো বিবরণ নেই')}</span>
          </div>
        </div>
      </td>
      <td>${formatDateBengali(tx.date)}</td>
      <td><span class="payment-tag">${tx.paymentMethod || 'Cash'}</span></td>
      <td>
        <span class="type-badge ${tx.type}">
          ${isIncome ? '↑ আয়' : '↓ ব্যয়'}
        </span>
      </td>
      <td class="text-right amount-cell ${isIncome ? 'amount-income' : 'amount-expense'}">
        ${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}
      </td>
      <td class="text-center">
        <div class="action-btns">
          <button class="action-btn edit" data-id="${tx.id}" title="সম্পাদনা করুন" aria-label="এডিট">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
          <button class="action-btn delete" data-id="${tx.id}" title="মুছে ফেলুন" aria-label="ডিলিট">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Safe string escaping
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==========================================================================
// Chart.js Visualizations
// ==========================================================================
function renderCharts() {
  renderCategoryDonutChart();
  renderTrendsBarChart();
}

function renderCategoryDonutChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  const isDark = AppState.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';

  // Aggregate expenses by category for current filter (or current month)
  const categoryTotals = {};
  let totalExpenseFiltered = 0;

  AppState.transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + parseFloat(tx.amount);
      totalExpenseFiltered += parseFloat(tx.amount);
    });

  const labels = [];
  const data = [];
  const bgColors = [];

  Object.keys(categoryTotals).forEach(catKey => {
    const config = CATEGORIES.expense[catKey] || { name: catKey, color: '#64748b' };
    labels.push(config.name);
    data.push(categoryTotals[catKey]);
    bgColors.push(config.color);
  });

  // Update center total
  const centerEl = document.getElementById('chartCenterTotal');
  if (centerEl) centerEl.textContent = formatCurrency(totalExpenseFiltered);

  if (AppState.charts.categoryChart) {
    AppState.charts.categoryChart.destroy();
  }

  // Handle empty chart
  if (data.length === 0) {
    labels.push('কোনো খরচ নেই');
    data.push(1);
    bgColors.push(isDark ? '#1e293b' : '#e2e8f0');
  }

  const ctx = canvas.getContext('2d');
  AppState.charts.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: isDark ? '#111827' : '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: "'Hind Siliguri', 'Outfit', sans-serif", size: 11 },
            boxWidth: 10,
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const pct = totalExpenseFiltered > 0 ? Math.round((val / totalExpenseFiltered) * 100) : 0;
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function renderTrendsBarChart() {
  const canvas = document.getElementById('trendsChart');
  if (!canvas) return;

  const isDark = AppState.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Build last 6 months bucket
  const monthLabels = [];
  const incomeData = [];
  const expenseData = [];

  const now = new Date();
  const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const labelKey = `${monthsBn[mo]} '${yr.toString().slice(-2)}`;
    monthLabels.push(labelKey);

    let inc = 0;
    let exp = 0;

    AppState.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === yr && txDate.getMonth() === mo) {
        if (tx.type === 'income') inc += parseFloat(tx.amount) || 0;
        else exp += parseFloat(tx.amount) || 0;
      }
    });

    incomeData.push(inc);
    expenseData.push(exp);
  }

  if (AppState.charts.trendsChart) {
    AppState.charts.trendsChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  AppState.charts.trendsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'আয়',
          data: incomeData,
          backgroundColor: '#10b981',
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'ব্যয়',
          data: expenseData,
          backgroundColor: '#f43f5e',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: "'Hind Siliguri', 'Outfit', sans-serif", size: 11 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: "'Outfit', sans-serif", size: 10 },
            callback: function(val) {
              return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val;
            }
          }
        }
      }
    }
  });
}

// ==========================================================================
// Modal & Form Handlers
// ==========================================================================
function populateCategorySelect(type, selectedCategory = '') {
  const select = document.getElementById('categoryInput');
  select.innerHTML = '';
  const cats = CATEGORIES[type] || {};

  Object.keys(cats).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${cats[key].icon}  ${cats[key].name}`;
    if (key === selectedCategory) opt.selected = true;
    select.appendChild(opt);
  });
}

function populateCategoryFilterDropdown() {
  const filterSelect = document.getElementById('categoryFilter');
  filterSelect.innerHTML = '<option value="all">সব ক্যাটাগরি</option>';

  const optGroupExp = document.createElement('optgroup');
  optGroupExp.label = '— ব্যয়ের খাত —';
  Object.keys(CATEGORIES.expense).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${CATEGORIES.expense[k].icon} ${CATEGORIES.expense[k].name}`;
    optGroupExp.appendChild(o);
  });
  filterSelect.appendChild(optGroupExp);

  const optGroupInc = document.createElement('optgroup');
  optGroupInc.label = '— আয়ের খাত —';
  Object.keys(CATEGORIES.income).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${CATEGORIES.income[k].icon} ${CATEGORIES.income[k].name}`;
    optGroupInc.appendChild(o);
  });
  filterSelect.appendChild(optGroupInc);
}

function openAddModal(type = 'expense') {
  const modal = document.getElementById('transactionModal');
  document.getElementById('modalTitle').textContent = 'নতুন লেনদেন যোগ করুন';
  document.getElementById('editTransactionId').value = '';
  document.getElementById('transactionForm').reset();

  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dateInput').value = today;

  // Set type buttons
  setFormType(type);
  modal.classList.remove('hidden');
  document.getElementById('amountInput').focus();
}

function openEditModal(txId) {
  const tx = AppState.transactions.find(t => t.id === txId);
  if (!tx) return;

  const modal = document.getElementById('transactionModal');
  document.getElementById('modalTitle').textContent = 'লেনদেন সম্পাদনা করুন';
  document.getElementById('editTransactionId').value = tx.id;
  document.getElementById('amountInput').value = tx.amount;
  document.getElementById('dateInput').value = tx.date;
  document.getElementById('paymentMethodInput').value = tx.paymentMethod || 'Cash';
  document.getElementById('noteInput').value = tx.note || '';

  setFormType(tx.type, tx.category);
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('transactionModal').classList.add('hidden');
}

function setFormType(type, selectedCategory = '') {
  const expenseBtn = document.getElementById('typeExpenseBtn');
  const incomeBtn = document.getElementById('typeIncomeBtn');

  if (type === 'income') {
    incomeBtn.classList.add('active');
    expenseBtn.classList.remove('active');
  } else {
    expenseBtn.classList.add('active');
    incomeBtn.classList.remove('active');
  }

  populateCategorySelect(type, selectedCategory);
}

function getSelectedFormType() {
  return document.getElementById('typeIncomeBtn').classList.contains('active') ? 'income' : 'expense';
}

// ==========================================================================
// Toast Notification
// ==========================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// CSV Export (with UTF-8 BOM for proper Bengali character display in Excel)
// ==========================================================================
function exportToCSV() {
  if (AppState.transactions.length === 0) {
    showToast('এক্সপোর্ট করার মতো কোনো লেনদেন নেই!', 'error');
    return;
  }

  const headers = ['আইডি', 'টাইপ', 'ক্যাটাগরি', 'পরিমাণ', 'তারিখ', 'পেমেন্ট মাধ্যম', 'নোট'];
  const rows = AppState.transactions.map(tx => {
    const catName = CATEGORIES[tx.type]?.[tx.category]?.name || tx.category;
    const typeBn = tx.type === 'income' ? 'আয়' : 'ব্যয়';
    return [
      `"${tx.id}"`,
      `"${typeBn}"`,
      `"${catName}"`,
      `"${tx.amount}"`,
      `"${tx.date}"`,
      `"${tx.paymentMethod || 'Cash'}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HishabKhata_Export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
}

// ==========================================================================
// Event Listeners & Wiring
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  AppState.init();

  // 2. Populate Dropdowns
  populateCategoryFilterDropdown();

  // 3. Render Dashboard, Tables, and Charts
  updateDashboardUI();
  renderTransactionsTable();
  renderCharts();

  // 4. Modal Triggers
  document.getElementById('openAddModalBtn').addEventListener('click', () => openAddModal('expense'));
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

  // Type Switch buttons inside modal
  document.getElementById('typeExpenseBtn').addEventListener('click', () => setFormType('expense'));
  document.getElementById('typeIncomeBtn').addEventListener('click', () => setFormType('income'));

  // Quick Amount Chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const addVal = parseFloat(e.target.dataset.chip) || 0;
      const input = document.getElementById('amountInput');
      const cur = parseFloat(input.value) || 0;
      input.value = cur + addVal;
    });
  });

  // Transaction Form Submit (Add or Edit)
  document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('editTransactionId').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    const category = document.getElementById('categoryInput').value;
    const date = document.getElementById('dateInput').value;
    const paymentMethod = document.getElementById('paymentMethodInput').value;
    const note = document.getElementById('noteInput').value.trim();
    const type = getSelectedFormType();

    if (!amount || amount <= 0) {
      showToast('দয়া করে সঠিক টাকার পরিমাণ লিখুন!', 'error');
      return;
    }
    if (!date) {
      showToast('দয়া করে তারিখ নির্বাচন করুন!', 'error');
      return;
    }

    if (editId) {
      // Edit existing
      const index = AppState.transactions.findIndex(t => t.id === editId);
      if (index !== -1) {
        AppState.transactions[index] = {
          ...AppState.transactions[index],
          type,
          amount,
          category,
          date,
          paymentMethod,
          note
        };
        showToast('লেনদেন সফলভাবে আপডেট করা হয়েছে!', 'success');
      }
    } else {
      // Add new
      const newTx = {
        id: 'tx-' + Date.now(),
        type,
        amount,
        category,
        date,
        paymentMethod,
        note
      };
      AppState.transactions.unshift(newTx);
      showToast('নতুন লেনদেন সফলভাবে যুক্ত হয়েছে!', 'success');
    }

    AppState.saveTransactions();
    closeModal();
    updateDashboardUI();
    renderTransactionsTable();
    renderCharts();
  });

  // Table Row Action Clicks (Edit & Delete delegation)
  document.getElementById('transactionsTableBody').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.action-btn.edit');
    if (editBtn) {
      const id = editBtn.dataset.id;
      openEditModal(id);
      return;
    }

    const deleteBtn = e.target.closest('.action-btn.delete');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('আপনি কি সত্যিই এই লেনদেনটি মুছে ফেলতে চান?')) {
        AppState.transactions = AppState.transactions.filter(t => t.id !== id);
        AppState.saveTransactions();
        updateDashboardUI();
        renderTransactionsTable();
        renderCharts();
        showToast('লেনদেন মুছে ফেলা হয়েছে!', 'info');
      }
    }
  });

  // Budget Modal Handlers
  const budgetModal = document.getElementById('budgetModal');
  document.getElementById('openBudgetModalBtn').addEventListener('click', () => {
    document.getElementById('monthlyBudgetInput').value = AppState.monthlyBudget;
    budgetModal.classList.remove('hidden');
  });
  document.getElementById('closeBudgetModalBtn').addEventListener('click', () => {
    budgetModal.classList.add('hidden');
  });
  document.getElementById('cancelBudgetBtn').addEventListener('click', () => {
    budgetModal.classList.add('hidden');
  });

  document.getElementById('budgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newBudget = parseFloat(document.getElementById('monthlyBudgetInput').value);
    if (newBudget && newBudget > 0) {
      AppState.saveBudget(newBudget);
      budgetModal.classList.add('hidden');
      updateDashboardUI();
      showToast(`মাসিক বাজেট ${formatCurrency(newBudget)} নির্ধারণ করা হয়েছে!`, 'success');
    }
  });

  // Search & Filter Events
  document.getElementById('searchInput').addEventListener('input', (e) => {
    AppState.filter.search = e.target.value;
    renderTransactionsTable();
  });

  document.getElementById('typeFilter').addEventListener('change', (e) => {
    AppState.filter.type = e.target.value;
    renderTransactionsTable();
  });

  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    AppState.filter.category = e.target.value;
    renderTransactionsTable();
  });

  document.getElementById('periodFilter').addEventListener('change', (e) => {
    AppState.filter.period = e.target.value;
    const periodBadge = document.getElementById('chartPeriodBadge');
    const labelMap = {
      this_month: 'চলতি মাস',
      last_month: 'বিগত মাস',
      this_year: 'চলতি বছর',
      all_time: 'সব সময়'
    };
    if (periodBadge) periodBadge.textContent = labelMap[e.target.value] || 'চলতি মাস';
    renderTransactionsTable();
  });

  // Theme & Currency Toggles
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    AppState.toggleTheme();
  });

  document.getElementById('currencySelect').addEventListener('change', (e) => {
    AppState.setCurrency(e.target.value);
    updateDashboardUI();
    renderTransactionsTable();
    renderCharts();
  });

  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);

  // Reset / Demo Data button
  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    if (confirm('আপনি কি ডেমো ডাটা পুনরায় লোড করতে চান? আপনার বর্তমান ট্রানজ্যাকশন রিসেট হয়ে যাবে।')) {
      AppState.transactions = getInitialSampleData();
      AppState.saveTransactions();
      updateDashboardUI();
      renderTransactionsTable();
      renderCharts();
      showToast('ডেমো ডেটা রিলোড করা হয়েছে!', 'info');
    }
  });

  // Dismiss Alert
  const dismissBtn = document.getElementById('dismissAlertBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      document.getElementById('budgetAlertBanner').classList.add('hidden');
    });
  }

  // Backdrop click to close modals
  window.addEventListener('click', (e) => {
    const txModal = document.getElementById('transactionModal');
    if (e.target === txModal) closeModal();

    const bgModal = document.getElementById('budgetModal');
    if (e.target === bgModal) bgModal.classList.add('hidden');
  });
});
