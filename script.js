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
    "Asian Paints",
    "Kotak Mahindra Bank",
    "Bajaj Finance",
    "Wipro",
    "Adani Enterprises",
    "HCL Technologies",
    "Sun Pharma",
    "UltraTech Cement",
    "Axis Bank",
    "Power Grid Corporation"
];

// ==== Game Data ====
let teams = JSON.parse(localStorage.getItem("teams") || "[]");
let prices = JSON.parse(localStorage.getItem("prices") || "{}");
let currentRound = localStorage.getItem("currentRound") || 0;
let currentTeamIndex = null;

function saveData(){
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.setItem("prices", JSON.stringify(prices));
    localStorage.setItem("currentRound", currentRound);
}

// ===== TEAM REGISTRATION =====
function registerTeam(){
    teams.push({
        teamNumber: regTeamNumber.value,
        teamName: regTeamName.value,
        members: [
            {name: m1name.value, contact: m1contact.value},
            {name: m2name.value, contact: m2contact.value},
            {name: m3name.value, contact: m3contact.value},
            {name: m4name.value, contact: m4contact.value}
        ],
        password: regPassword.value,
        approved: false,
        cash: 2000000,
        holdings: {}
    });
    saveData();
    alert("✅ Team registered! Await admin approval.");
}

// ===== TEAM LOGIN =====
function teamLogin(){
    let team = teams.find(t=>t.teamNumber==teamNumber.value && t.password==teamPassword.value);
    if(!team) return alert("❌ Invalid credentials.");
    if(!team.approved) return alert("⏳ Wait for admin approval.");
    currentTeamIndex = teams.indexOf(team);
    loginSection.style.display="none";
    registrationSection.style.display="none";
    tradingSection.style.display="block";
    roundDisplay.textContent = currentRound;
    loadStocks();
    updatePortfolio();
}

// ===== TRADING =====
function loadStocks(){
    stockList.innerHTML="";
    let roundPrices = prices[currentRound] || {};
    for(let s=1; s<=20; s++){
        let price = roundPrices[`stock${s}`] || 0;
        let stockLabel = stockNames[s-1] || `Stock ${s}`;
        let opt = document.createElement("option");
        opt.value = `stock${s}`;
        opt.textContent = `${stockLabel} - ₹${price}`;
        stockList.appendChild(opt);
    }
}

function placeTrade(){
    let team = teams[currentTeamIndex];
    let type = tradeType.value;
    let stock = stockList.value;
    let qty = parseInt(tradeQty.value);
    let price = prices[currentRound]?.[stock] || 0;
    if(qty <= 0) return alert("❌ Invalid quantity.");
    if(currentRound <= 3 && type == "SELL") return alert("🚫 Selling not allowed in rounds 1-3");

    let totalValue = price * qty;
    let brokerage = (type=="BUY" ? 0.01 : -0.01) * totalValue;
    let net = totalValue + brokerage;

    if(type=="BUY"){
        if(team.cash < net) return alert("❌ Not enough cash.");
        team.cash -= net;
        team.holdings[stock] = (team.holdings[stock] || 0) + qty;
    } else {
        if(!team.holdings[stock] || team.holdings[stock] < qty) return alert("❌ Not enough stock to sell.");
        team.holdings[stock] -= qty;
        team.cash += (totalValue + brokerage);
    }
    saveData();
    updatePortfolio();
}

function updatePortfolio(){
    let team = teams[currentTeamIndex];
    let roundPrices = prices[currentRound] || {};
    portfolioTable.innerHTML = "";
    let totalStockValue = 0;
    for(let stock in team.holdings){
        if(team.holdings[stock] > 0){
            let val = team.holdings[stock] * (roundPrices[stock] || 0);
            totalStockValue += val;
            let stockIndex = parseInt(stock.replace('stock','')) - 1;
            let stockLabel = stockNames[stockIndex] || stock;
            portfolioTable.innerHTML += `<tr><td>${stockLabel}</td><td>${team.holdings[stock]}</td><td>₹${val.toLocaleString()}</td></tr>`;
        }
    }
    cashDisplay.textContent = team.cash.toLocaleString();
    totalValueDisplay.textContent = (team.cash + totalStockValue).toLocaleString();
}

// ===== ADMIN LOGIN =====
function adminLogin(){
    let p = adminPass.value;
    // 🔐 Set your password here
    if(true){ 
        adminControls.style.display="block";
        renderApprovalList();
        renderPriceSetup();
        document.getElementById("currentRound").value = currentRound;
    }
}

// ===== ADMIN FUNCTIONS =====
function updateRound(){
    currentRound = document.getElementById("currentRound").value;
    saveData();
    renderPriceSetup();
}

function renderPriceSetup(){
    let div = document.getElementById("priceSetup");
    if(!div) return;
    div.innerHTML="";
    for(let s=1; s<=20; s++){
        let stockLabel = stockNames[s-1] || `Stock ${s}`;
        div.innerHTML += `<div>${stockLabel}: <input type="number" id="stock${s}" value="${prices[currentRound]?.[`stock${s}`]||0}"></div>`;
    }
}

function savePrices(){
    if(!prices[currentRound]) prices[currentRound]={};
    for(let s=1;s<=20;s++){
        prices[currentRound][`stock${s}`] = parseFloat(document.getElementById(`stock${s}`).value) || 0;
    }
    saveData();
    alert("💾 Prices saved for Round " + currentRound);
}

function renderApprovalList(){
    let div = document.getElementById("approvalList");
    div.innerHTML="";
    teams.forEach((t,idx)=>{
        div.innerHTML += `<div>${t.teamNumber} - ${t.teamName} [${t.approved?"✅ Approved":"⏳ Pending"}] 
        <button onclick="approveTeam(${idx})">Approve</button></div>`;
    });
}

function approveTeam(idx){
    teams[idx].approved = true;
    saveData();
    renderApprovalList();
}

// ===== LEADERBOARD =====
function renderLeaderboard(){
    let tbody = document.querySelector("#leaderboardTable tbody");
    if(!tbody) return;
    let standings = teams.map(t=>{
        let totalStockValue = 0;
        for(let stock in t.holdings){
            totalStockValue += (t.holdings[stock] * (prices[currentRound]?.[stock]||0));
        }
        return {team: t.teamName, total: t.cash + totalStockValue};
    }).sort((a,b)=>b.total-a.total);
    tbody.innerHTML="";
    standings.forEach((s,i)=>{
        tbody.innerHTML += `<tr><td>${i+1}</td><td>${s.team}</td><td>₹${s.total.toLocaleString()}</td></tr>`;
    });
}

