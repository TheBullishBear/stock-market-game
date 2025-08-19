let stockNames = [
    "Reliance Industries", "Tata Consultancy Services", "HDFC Bank", "Infosys", "ICICI Bank",
    "Larsen & Toubro", "State Bank of India", "Bharti Airtel", "Hindustan Unilever", "ITC Ltd",
    "Asian Paints", "Kotak Mahindra Bank", "Bajaj Finance", "Wipro", "idea"
];

// == DOM ELEMENT REFERENCES ==
const regTeamNumber = document.getElementById("regTeamNumber");
const regTeamName = document.getElementById("regTeamName");
const m1name = document.getElementById("m1name");
const m1contact = document.getElementById("m1contact");
const m2name = document.getElementById("m2name");
const m2contact = document.getElementById("m2contact");
const m3name = document.getElementById("m3name");
const m3contact = document.getElementById("m3contact");
const m4name = document.getElementById("m4name");
const m4contact = document.getElementById("m4contact");
const regPassword = document.getElementById("regPassword");
const teamNumber = document.getElementById("teamNumber");
const teamPassword = document.getElementById("teamPassword");
const loginSection = document.getElementById("loginSection");
const registrationSection = document.getElementById("registrationSection");
const tradingSection = document.getElementById("tradingSection");
const roundDisplay = document.getElementById("roundDisplay");
const portfolioTable = document.getElementById("portfolioTable");
const cashDisplay = document.getElementById("cashDisplay");
const totalValueDisplay = document.getElementById("totalValueDisplay");
const tradeType = document.getElementById("tradeType");
const stockList = document.getElementById("stockList");
const tradeQty = document.getElementById("tradeQty");
const reviewTradesBtn = document.getElementById("reviewTradesBtn");
const reviewSection = document.getElementById("reviewSection");
const pendingTradesTableBody = document.getElementById("pendingTradesTableBody");
const roundReview = document.getElementById("roundReview");

let teams = JSON.parse(localStorage.getItem("teams") || "[]");
let prices = JSON.parse(localStorage.getItem("prices") || "{}");
let currentRound = localStorage.getItem("currentRound") || 0;
let currentTeamIndex = null;

function saveData() {
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("prices", JSON.stringify(prices));
    localStorage.setItem("currentRound", currentRound);
}

// = TEAM REGISTRATION =
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

// = TEAM LOGIN =
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

// = TRADING =
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

// = PENDING TRADES (REVIEW & CONFIRM) =
function updateReviewButton() {
    if (currentTeamIndex === null || currentTeamIndex === undefined) return;
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

function loadPendingTradesTable() {
    pendingTradesTableBody.innerHTML = '';
    if (currentTeamIndex === null || currentTeamIndex === undefined) return;
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
        pendingTradesTableBody.appendChild(tr);
    });
}

function editTrade(index) {
    if (currentTeamIndex === null || currentTeamIndex === undefined) return;
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

function deleteTrade(index) {
    if (currentTeamIndex === null || currentTeamIndex === undefined) return;
    let trades = teams[currentTeamIndex].pendingTrades[currentRound];
    if (confirm("Delete this trade?")) {
        trades.splice(index, 1);
        saveData();
        loadPendingTradesTable();
        updateReviewButton();
    }
}

// = TRADE SUBMISSION WITH BROKERAGE LOGIC =
function submitAllTrades() {
    if (currentTeamIndex === null || currentTeamIndex === undefined) return;
    let team = teams[currentTeamIndex];
    let trades = team.pendingTrades[currentRound] || [];
    if (trades.length === 0) {
        alert("No pending trades to submit.");
        return;
    }
    let roundPrices = prices[currentRound] || {};

    // Validate all trades first
    for (let trade of trades) {
        let price = roundPrices[trade.stock] || 0;
        let qty = trade.qty;
        if (trade.type ===
