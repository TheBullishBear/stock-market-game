// ==== Custom Stock Names ====
let stockNames = [
    "Reliance Industries",
    "Tata Consultancy Services",
    "HDFC Bank",
    "Infosys",
    "ICICI Bank",
    "Larsen & Toubro",
    "State Bank of India",
    "Bharti Airtel",
    "Hindustan Unilever",
    "ITC Ltd",
];

let teams = JSON.parse(localStorage.getItem("teams") || "[]");
let prices = JSON.parse(localStorage.getItem("prices") || "{}");
let currentRound = localStorage.getItem("currentRound") || 0;
let currentTeamIndex = null;

const reviewTradesBtn = document.getElementById("reviewTradesBtn");
const reviewSection = document.getElementById("reviewSection");
const pendingTradesTableBody = document.getElementById("pendingTradesTableBody");
const roundReview = document.getElementById("roundReview");

function saveData() {
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("prices", JSON.stringify(prices));
    localStorage.setItem("currentRound", currentRound);
}

// ===== TEAM REGISTRATION =====
function registerTeam() {
    teams.push({
        teamNumber: regTeamNumber.value.trim(),
        teamName: regTeamName.value.trim(),
        members: [
            { name: m1name.value, contact: m1contact.value },
            { name: m2name.value, contact: m2contact.value },
            { name: m3name.value, contact: m3contact.value },
            { name: m4name.value, contact: m4contact.value }
        ],
        password: regPassword.value.trim(),
        approved: false,
        cash: 2000000,
        holdings: {},
        pendingTrades: {}
    });
    saveData();
    alert("✅ Team registered! Await admin approval.");
}

// ===== TEAM LOGIN =====
function teamLogin() {
    let team = teams.find(t => t.teamNumber == teamNumber.value && t.password == teamPassword.value);
    if (!team) return alert("❌ Invalid credentials.");
    if (!team.approved) return alert("⏳ Wait for admin approval.");
    currentTeamIndex = teams.indexOf(team);
    loginSection.style.display = "none";
    registrationSection.style.display = "none";
    tradingSection.style.display = "block";
    roundDisplay.textContent = currentRound;
    roundReview.textContent = currentRound;
    loadStocks();
    updatePortfolio();
    updateReviewButton();
}

// ===== TRADING =====
function loadStocks() {
    stockList.innerHTML = "";
    let roundPrices = prices[currentRound] || {};
    for (let s = 1; s <= 20; s++) {
        let price = roundPrices[`stock${s}`] || 0;
        let stockLabel = stockNames[s - 1] || `Stock ${s}`;
        let opt = document.createElement("option");
        opt.value = `stock${s}`;
        opt.textContent = `${stockLabel} - ₹${price}`;
        stockList.appendChild(opt);
    }
}

function placeTrade() {
    let team = teams[currentTeamIndex];
    let type = tradeType.value;
    let stock = stockList.value;
    let qty = parseInt(tradeQty.value);

    if (qty <= 0) return alert("❌ Invalid quantity.");
    if (currentRound <= 3 && type == "SELL") return alert("🚫 Selling not allowed in rounds 1–3");

    if (!team.pendingTrades[currentRound]) {
        team.pendingTrades[currentRound] = [];
    }

    // Add trade to pending array
    team.pendingTrades[currentRound].push({
        type: type,
        stock: stock,
        qty: qty
    });

    saveData();
    alert("Trade added to pending list. You can review and submit later.");
    tradeQty.value = '';
    updateReviewButton();
}

// Review trades button visibility
function updateReviewButton() {
    let team = teams[currentTeamIndex];
    if (team.pendingTrades[currentRound] && team.pendingTrades[currentRound].length > 0) {
        reviewTradesBtn.style.display = 'inline-block';
    } else {
        reviewTradesBtn.style.display = 'none';
    }
}

function showReview() {
    reviewSection.style.display = 'block';
    loadPendingTradesTable();
}

function hideReview() {
    reviewSection.style.display = 'none';
}

// Load pending trades table
function loadPendingTradesTable() {
    let tbody = pendingTradesTableBody;
    tbody.innerHTML = '';
    let trades = teams[currentTeamIndex].pendingTrades[currentRound] || [];

    trades.forEach((trade, index) => {
        let tr = document.createElement('tr');

        let stockIdx = parseInt(trade.stock.replace('stock', '')) - 1;
        let stockName = stockNames[stockIdx] || trade.stock;

        tr.innerHTML = `
            <td>${trade.type}</td>
            <td>${stockName}</td>
            <td>${trade.qty}</td>
            <td>
                <button onclick="editTrade(${index})">Edit</button>
                <button onclick="deleteTrade(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit pending trade quantity
function editTrade(index) {
    let trades = teams[currentTeamIndex].pendingTrades[currentRound];
    let trade = trades[index];
    let newQty = prompt(`Edit quantity for ${trade.type} ${stockNames[parseInt(trade.stock.replace('stock', '')) - 1]}:`, trade.qty);
    let qtyNum = parseInt(newQty);
    if (!isNaN(qtyNum) && qtyNum > 0) {
        trades[index].qty = qtyNum;
        saveData();
        loadPendingTradesTable();
    } else {
        alert("❌ Invalid quantity.");
    }
}

// Delete pending trade
function deleteTrade(index) {
    let trades = teams[currentTeamIndex].pendingTrades[currentRound];
    if (confirm("Delete this trade?")) {
        trades.splice(index, 1);
        saveData();
        loadPendingTradesTable();
        updateReviewButton();
    }
}

// Submit all pending trades for the round
function submitAllTrades() {
    let team = teams[currentTeamIndex];
    let trades = team.pendingTrades[currentRound] || [];
    if (trades.length === 0) {
        alert("No pending trades to submit.");
        return;
    }

    let roundPrices = prices[currentRound] || {};

    // Validate trades first
    for (let trade of trades) {
        let price = roundPrices[trade.stock] || 0;
        let totalValue = trade.qty * price;
        let brokerage = (trade.type === "BUY" ? 0.01 : -0.01) * totalValue;
        let net = totalValue + brokerage;

        if (trade.type === "BUY" && team.cash < net) {
            alert(`Insufficient cash for ${trade.qty} shares of ${stockNames[parseInt(trade.stock.replace('stock', '')) - 1]}`);
            return;
        }

        if (trade.type === "SELL" && (!team.holdings[trade.stock] || team.holdings[trade.stock] < trade.qty)) {
            alert(`Insufficient holdings to sell ${trade.qty} shares of ${stockNames[parseInt(trade.stock.replace('stock', '')) - 1]}`);
            return;
        }
    }

    // Apply trades
    for (let trade of trades) {
        let price = roundPrices[trade.stock] || 0;
        let totalValue = trade.qty * price;
        let brokerage = (trade.type === "BUY" ? 0.01 : -0.01) * totalValue;
        let net = totalValue + brokerage;

        if (trade.type === "BUY") {
            team.cash -= net;
            team.holdings[trade.stock] = (team.holdings[trade.stock] || 0) + trade.qty;
        } else {
            team.holdings[trade.stock] -= trade.qty;
            team.cash += totalValue + brokerage;
        }
    }

    // Clear pending trades for current round
    team.pendingTrades[currentRound] = [];
    saveData();
    updatePortfolio();
    loadPendingTradesTable();
    updateReviewButton();
    hideReview();
    alert("✅ All trades submitted successfully.");
}

// ===== The rest of your existing functions for admin login, price setup, approvals, leaderboard etc. =====
// (Make sure you include or keep your adminLogin(), updateRound(), renderPriceSetup(), savePrices(), renderApprovalList(), approveTeam(), resetTeamPassword(), deleteTeam(), renderLeaderboard() functions untouched.)

// ... your existing code continues here ...

