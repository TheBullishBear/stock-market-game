# 🧪 Stock Market Game - Testing Guide

## Test Scenario: Round Persistence & Stock Purchase

### Prerequisites
- Local server running on http://localhost:8000
- Clean browser (clear localStorage if needed)

### Test Steps

#### Phase 1: Admin Setup
1. **Open Admin Panel**: http://localhost:8000/admin.html
2. **Login**: Use password `admin123`
3. **Set Round 1**: Select "Round 1" from dropdown
4. **Set Stock Prices**: 
   - Set at least 3-4 stock prices (e.g., Stock 1: ₹100, Stock 2: ₹200, Stock 3: ₹150)
   - Click "Save Prices"

#### Phase 2: Team Registration & Round 1 Trading
1. **Open Main App**: http://localhost:8000/index.html
2. **Register Team**:
   - Team Number: TEST001
   - Team Name: Test Team Alpha
   - Fill member details (can be dummy data)
   - Password: test123
3. **Admin Approval**:
   - Go back to admin panel
   - Approve the test team
4. **Team Login**:
   - Team Number: TEST001
   - Password: test123
5. **Verify Initial State**:
   - ✅ Cash Balance: ₹20,00,000
   - ✅ Portfolio: Empty
   - ✅ Current Round: 1
6. **Make Stock Purchase**:
   - Select a stock (e.g., first stock)
   - Buy 100 shares
   - Click "Execute" → "Review Trades" → "Submit All Trades"
7. **Verify After Purchase**:
   - ✅ Cash should be reduced by (100 × stock_price + 1% brokerage)
   - ✅ Portfolio should show 100 shares of the stock
   - ✅ Total value should be cash + stock value

#### Phase 3: Round 2 Transition (Critical Test)
1. **Admin: Advance to Round 2**:
   - Go to admin panel
   - Change round to "Round 2"
   - Set new stock prices (different from Round 1)
   - Save prices
2. **Team: Verify Persistence**:
   - Refresh the main app page (or logout and login again)
   - ✅ **CRITICAL**: Cash balance should be the reduced amount from Round 1
   - ✅ **CRITICAL**: Portfolio should still show the 100 shares purchased in Round 1
   - ✅ **CRITICAL**: Round display should show "Round 2"
   - ✅ Stock valuation should use Round 2 prices if available, Round 1 prices as fallback

#### Phase 4: Round 2 Additional Trading
1. **Buy Different Stock**:
   - Purchase shares of a different stock in Round 2
   - Submit trades
2. **Verify Cumulative Holdings**:
   - ✅ Portfolio should show stocks from BOTH Round 1 and Round 2
   - ✅ Cash should reflect purchases from both rounds
   - ✅ Total value calculation should be accurate

#### Phase 5: Edge Case Testing
1. **Test Price Fallback**:
   - Admin: Set Round 3 but don't set prices for some stocks
   - Team: Check that portfolio still shows correct valuations using previous round prices
2. **Test Multiple Rounds**:
   - Continue buying stocks in different rounds
   - Verify all holdings persist across round changes

## Expected Results ✅

### Before Fix (Original Issues):
- ❌ Cash would reset to ₹20,00,000 each round
- ❌ Stock holdings would disappear when moving to new rounds
- ❌ Round number inconsistencies

### After Fix (Should Work Now):
- ✅ Cash persists and accumulates reductions from all purchases
- ✅ Stock holdings from all previous rounds remain visible
- ✅ Portfolio shows accurate valuations using latest available prices
- ✅ Round transitions work smoothly without data loss

## Browser Console Verification
Open browser Developer Tools (F12) and check console for:
- No JavaScript errors
- Successful localStorage operations
- Correct data structure persistence

## Automated Test Results
Check the test page at http://localhost:8000/test_functionality.html for automated verification of:
- Data persistence
- Round management
- Team creation
- Stock trading logic
- Portfolio calculation with price fallback
