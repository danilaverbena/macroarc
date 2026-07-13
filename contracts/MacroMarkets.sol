// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MacroMarkets — multi-currency parimutuel prediction markets
///        for macro & FX outcomes, built for Arc (USDC/EURC settlement).
/// @notice MVP: owner-resolved markets. Roadmap: optimistic oracle resolution.
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract MacroMarkets {
    enum Outcome { Unresolved, Yes, No, Void }

    struct Market {
        string question;     // e.g. "Fed funds target >= 4.75% after Sept 2026 FOMC?"
        string category;     // "rates" | "inflation" | "fx"
        string resolutionSource; // e.g. "federalreserve.gov press release"
        address token;       // settlement token (USDC / EURC)
        uint64 closeTime;    // betting closes
        uint64 resolveTime;  // expected resolution date
        Outcome outcome;
        uint128 yesPool;
        uint128 noPool;
    }

    address public owner;
    address public treasury;
    uint16 public constant FEE_BPS = 100; // 1% fee on winnings (losing pool)
    Market[] private _markets;

    mapping(uint256 => mapping(address => uint128)) public yesStake;
    mapping(uint256 => mapping(address => uint128)) public noStake;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event MarketCreated(uint256 indexed id, string question, address token, uint64 closeTime);
    event BetPlaced(uint256 indexed id, address indexed user, bool yes, uint128 amount);
    event MarketResolved(uint256 indexed id, Outcome outcome);
    event Claimed(uint256 indexed id, address indexed user, uint256 payout);

    error NotOwner();
    error BettingClosed();
    error BettingOpen();
    error AlreadyResolved();
    error NotResolved();
    error NothingToClaim();
    error BadParams();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _treasury) {
        owner = msg.sender;
        treasury = _treasury == address(0) ? msg.sender : _treasury;
    }

    // ---------- admin ----------

    function createMarket(
        string calldata question,
        string calldata category,
        string calldata resolutionSource,
        address token,
        uint64 closeTime,
        uint64 resolveTime
    ) external onlyOwner returns (uint256 id) {
        if (token == address(0) || closeTime <= block.timestamp || resolveTime < closeTime) revert BadParams();
        _markets.push(Market(question, category, resolutionSource, token, closeTime, resolveTime, Outcome.Unresolved, 0, 0));
        id = _markets.length - 1;
        emit MarketCreated(id, question, token, closeTime);
    }

    function resolve(uint256 id, Outcome outcome) external onlyOwner {
        Market storage m = _markets[id];
        if (m.outcome != Outcome.Unresolved) revert AlreadyResolved();
        if (block.timestamp < m.closeTime) revert BettingOpen();
        if (outcome == Outcome.Unresolved) revert BadParams();
        m.outcome = outcome;
        emit MarketResolved(id, outcome);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    // ---------- user ----------

    function bet(uint256 id, bool yes, uint128 amount) external {
        Market storage m = _markets[id];
        if (block.timestamp >= m.closeTime || m.outcome != Outcome.Unresolved) revert BettingClosed();
        if (amount == 0) revert BadParams();
        require(IERC20(m.token).transferFrom(msg.sender, address(this), amount), "transfer failed");
        if (yes) {
            m.yesPool += amount;
            yesStake[id][msg.sender] += amount;
        } else {
            m.noPool += amount;
            noStake[id][msg.sender] += amount;
        }
        emit BetPlaced(id, msg.sender, yes, amount);
    }

    function claim(uint256 id) external {
        Market storage m = _markets[id];
        if (m.outcome == Outcome.Unresolved) revert NotResolved();
        if (claimed[id][msg.sender]) revert NothingToClaim();
        claimed[id][msg.sender] = true;

        uint256 payout;
        if (m.outcome == Outcome.Void) {
            payout = uint256(yesStake[id][msg.sender]) + noStake[id][msg.sender];
        } else {
            bool yesWon = m.outcome == Outcome.Yes;
            uint256 stake = yesWon ? yesStake[id][msg.sender] : noStake[id][msg.sender];
            if (stake > 0) {
                uint256 winPool = yesWon ? m.yesPool : m.noPool;
                uint256 losePool = yesWon ? m.noPool : m.yesPool;
                uint256 winningsGross = (losePool * stake) / winPool;
                uint256 fee = (winningsGross * FEE_BPS) / 10_000;
                payout = stake + winningsGross - fee;
                if (fee > 0) require(IERC20(m.token).transfer(treasury, fee), "fee transfer failed");
            }
        }
        if (payout == 0) revert NothingToClaim();
        require(IERC20(m.token).transfer(msg.sender, payout), "payout failed");
        emit Claimed(id, msg.sender, payout);
    }

    // ---------- views ----------

    function marketCount() external view returns (uint256) {
        return _markets.length;
    }

    function getMarket(uint256 id) external view returns (Market memory) {
        return _markets[id];
    }

    /// @notice implied YES probability in basis points (0 if empty)
    function impliedYesBps(uint256 id) external view returns (uint256) {
        Market storage m = _markets[id];
        uint256 total = uint256(m.yesPool) + m.noPool;
        if (total == 0) return 0;
        return (uint256(m.yesPool) * 10_000) / total;
    }
}
