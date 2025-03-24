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
        const target = link.getAttribute('data-section');
        displaySection(target);
        highlightActiveNav(link);
    });
});

function displaySection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
}

function highlightActiveNav(activeLink) {
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Expense Management
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
    saveExpensesToStorage();
    refreshUI();
    expenseForm.reset();
    displaySection('expenses');
});

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpensesToStorage();
    refreshUI();
}

function saveExpensesToStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// User Profile Management
function updateProfileDetails() {
    userName.textContent = userProfile.name;
    userEmail.textContent = userProfile.email;
    userNameInput.value = userProfile.name;
    userEmailInput.value = userProfile.email;
}

saveSettingsBtn.addEventListener('click', () => {
    userProfile.name = userNameInput.value;
    userProfile.email = userEmailInput.value;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateProfileDetails();
});

// Budget Management
setBudgetBtn.addEventListener('click', () => {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget >= 0) {
        monthlyBudget = newBudget;
        localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
        refreshUI();
        budgetInput.value = '';
    } else {
        alert('Please enter a valid budget amount');
    }
});

// UI Updates
function refreshUI() {
    populateExpensesList();
    updateSummaryData();
    renderCharts();
}

function populateExpensesList() {
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

function updateSummaryData() {
    const currentMonth = new Date().getMonth();
    const totalMonthlyExpenses = expenses
        .filter(expense => new Date(expense.date).getMonth() === currentMonth)
        .reduce((sum, expense) => sum + expense.amount, 0);

    const remainingBudget = monthlyBudget - totalMonthlyExpenses;

    document.getElementById('totalBalance').textContent = `₹${remainingBudget.toFixed(2)}`;
    document.getElementById('monthlyExpenses').textContent = `₹${totalMonthlyExpenses.toFixed(2)}`;
    monthlyBudgetDisplay.textContent = `₹${monthlyBudget.toFixed(2)}`;

    const balanceColor = totalMonthlyExpenses > monthlyBudget ? '#ff6b6b' : '#6c5ce7';
    monthlyBudgetDisplay.style.color = balanceColor;
    document.getElementById('totalBalance').style.color = balanceColor;
}

// Initialize the application
function initializeApp() {
    updateProfileDetails();
    refreshUI();
    displaySection('dashboard');
}

initializeApp();
