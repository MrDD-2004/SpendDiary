// Initialize state
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: 'User Name',
    email: 'user@email.com'
};
let monthlyBudget = JSON.parse(localStorage.getItem('monthlyBudget')) || 0;

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links li');
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userNameInput = document.getElementById('userNameInput');
const userEmailInput = document.getElementById('userEmailInput');
const saveSettingsBtn = document.getElementById('saveSettings');
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudget');
const monthlyBudgetDisplay = document.getElementById('monthlyBudget');

// Initialize charts
let categoryChart, trendChart;

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetSection = link.getAttribute('data-section');
        showSection(targetSection);
        updateActiveNav(link);
    });
});

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
}

function updateActiveNav(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Expense Managementssssss
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newExpense = {
        id: Date.now(),
        title: document.getElementById('expenseTitle').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value
    };

    expenses.push(newExpense);
    saveExpenses();
    updateUI();
    expenseForm.reset();
    showSection('expenses');
});

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    updateUI();
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// User Profile Management
function updateUserProfile() {
    userName.textContent = userProfile.name;
    userEmail.textContent = userProfile.email;
    userNameInput.value = userProfile.name;
    userEmailInput.value = userProfile.email;
}

saveSettingsBtn.addEventListener('click', () => {
    userProfile.name = userNameInput.value;
    userProfile.email = userEmailInput.value;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateUserProfile();
});

// Budget Management
setBudgetBtn.addEventListener('click', () => {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget >= 0) {
        monthlyBudget = newBudget;
        localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
        updateSummaryCards();
        budgetInput.value = '';
    } else {
        alert('Please enter a valid budget amount');
    }
});

// UI Updates
function updateUI() {
    updateExpensesList();
    updateSummaryCards();
    updateCharts();
}

function updateExpensesList() {
    expensesList.innerHTML = expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="expense-item">
                <div>
                    <h3>${expense.title}</h3>
                    <p>${expense.category} • ${new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div>
                    <span>₹${expense.amount.toFixed(2)}</span>
                    <i class="fas fa-trash delete-btn" onclick="deleteExpense(${expense.id})"></i>
                </div>
            </div>
        `).join('');
}

function updateSummaryCards() {
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses
        .filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate budget-expense difference
    const budgetExpenseDiff = monthlyBudget - monthlyExpenses;

    document.getElementById('totalBalance').textContent = `₹${budgetExpenseDiff.toFixed(2)}`;
    document.getElementById('monthlyExpenses').textContent = `₹${monthlyExpenses.toFixed(2)}`;
    monthlyBudgetDisplay.textContent = `₹${monthlyBudget.toFixed(2)}`;

    // Add visual feedback for budget status
    if (monthlyExpenses > monthlyBudget) {
        monthlyBudgetDisplay.style.color = '#ff6b6b';
        document.getElementById('totalBalance').style.color = '#ff6b6b';
    } else {
        monthlyBudgetDisplay.style.color = '#6c5ce7';
        document.getElementById('totalBalance').style.color = '#6c5ce7';
    }
}

// Charts
function updateCharts() {
    // Category Chart
    const ctx2 = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: getCategories(),
            datasets: [{
                data: getCategoryTotals(),
                backgroundColor: [
                    '#6c5ce7',
                    '#a8a4e6',
                    '#81ecec',
                    '#00cec9',
                    '#00b894',
                    '#55efc4'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        }
    });

    // Trend Chart
    const ctx3 = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: getLast6Months(),
            datasets: [{
                label: 'Monthly Expenses',
                data: getMonthlyExpenses(),
                backgroundColor: '#6c5ce7',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Expense Trends',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

// Helper Functions for Charts
function getCategories() {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    return categories.length > 0 ? categories : ['No expenses'];
}

function getCategoryTotals() {
    const categories = getCategories();
    if (categories[0] === 'No expenses') return [0];
    return categories.map(category =>
        expenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0)
    );
}

function getLast6Months() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return months;
}

function getMonthlyExpenses() {
    const last6Months = getLast6Months();
    return last6Months.map(month => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - last6Months.indexOf(month)));
        const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === date.getMonth() &&
                   expenseDate.getFullYear() === date.getFullYear();
        });
        return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });
}

// Initialize the application
function init() {
    updateUserProfile();
    updateUI();
    showSection('dashboard');
}
init(); 