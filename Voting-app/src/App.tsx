import { useState, useEffect } from 'react'
import "./App.css"
import leftlogo from "./assets/leftparty.jpg"
import rightlogo from "./assets/rightlogo.png"
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers'

const Contractaddress = "0xe74c80570Bfbd5F96d9Ae991B5F3950751Ee8B15"
const abi = [
  "function party1vote() public",
  "function party2vote() public",
  "function party1votereturn() public view returns (uint256)",
  "function party2votereturn() public view returns (uint256)",
  "function party1() public view returns (uint256)",
  "function party2() public view returns (uint256)",
  "function didVote(address) public view returns (bool)"
];

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>("");
  const [leftVotes, setLeftVotes] = useState<number>(0);
  const [rightVotes, setRightVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        console.log("Wallet Detected");

        const web3provider = new BrowserProvider(window.ethereum);
        const signer = await web3provider.getSigner();
        const address = await signer.getAddress();
        const contract = new Contract(Contractaddress, abi, signer);

        console.log("Connected account", address);

        setProvider(web3provider);
        setSigner(signer);
        setAccount(address);
        setContract(contract);

        await fetchVotes(contract);
        checkIfVoted(contract, address);
        
      } catch (err) {
        console.log("Error connecting wallet:", err);
        alert("Failed to connect wallet.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  }
  
  const leftvote = async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const tx = await contract.party1vote();
      await tx.wait();
      setHasVoted(true);
      await fetchVotes(contract);
    } catch (err) {
      console.error("Voting error:", err);
      alert("Voting failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const rightvote = async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      const tx = await contract.party2vote();
      await tx.wait();
      setHasVoted(true);
      await fetchVotes(contract);
    } catch (err) {
      console.error("Voting error:", err);
      alert("Voting failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const fetchVotes = async (c: Contract) => {
    try {
      const [left, right] = await Promise.all([
        c.party1votereturn(),
        c.party2votereturn()
      ]);
      setLeftVotes(Number(left));
      setRightVotes(Number(right));
    } catch (err) {
      console.error("Error fetching votes", err);
    }
  };

  const checkIfVoted = async (c: Contract, addr: string) => {
    try {
      const voted = await c.didVote(addr);
      setHasVoted(voted);
    } catch (err) {
      console.error("Error checking vote status", err);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    if (window.ethereum?.isConnected()) {
      connectWallet();
    }
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Decentralized Voting System</h1>
        <button 
          className={`connect-wallet ${provider ? 'connected' : ''}`} 
          onClick={connectWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : provider ? (
            <span className="wallet-address">
              <span className="wallet-icon">🦊</span>
              {shortenAddress(account)}
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </header>

      {showTooltip && (
        <div className="wallet-tooltip">
          Please install MetaMask or another Ethereum wallet
        </div>
      )}

      <main className="voting-container">
        <div className="party-card left-party">
          <div className="party-logo-container">
            <img src={leftlogo} alt="Left Party" className="party-logo" />
          </div>
          <div className="party-info">
            <h2 className="party-name">Left Party</h2>
            <div className="vote-count">{leftVotes} Votes</div>
          </div>
          <button 
            className={`vote-button ${hasVoted ? 'disabled' : ''}`}
            onClick={leftvote}
            disabled={!provider || hasVoted || isLoading}
          >
            {hasVoted ? 'Already Voted' : 'Vote Now'}
          </button>
        </div>

        <div className="divider">
          <span className="divider-text">VS</span>
        </div>

        <div className="party-card right-party">
          <div className="party-logo-container">
            <img src={rightlogo} alt="Right Party" className="party-logo" />
          </div>
          <div className="party-info">
            <h2 className="party-name">Right Party</h2>
            <div className="vote-count">{rightVotes} Votes</div>
          </div>
          <button 
            className={`vote-button ${hasVoted ? 'disabled' : ''}`}
            onClick={rightvote}
            disabled={!provider || hasVoted || isLoading}
          >
            {hasVoted ? 'Already Voted' : 'Vote Now'}
          </button>
        </div>
      </main>

      <div className="results-container">
        <div className="results-bar">
          <div 
            className="left-results" 
            style={{ width: `${leftVotes + rightVotes === 0 ? 50 : (leftVotes / (leftVotes + rightVotes)) * 100}%` }}
          >
            <span className="results-percentage">
              {leftVotes + rightVotes === 0 ? '0%' : `${Math.round((leftVotes / (leftVotes + rightVotes)) * 100)}%`}
            </span>
          </div>
          <div 
            className="right-results" 
            style={{ width: `${leftVotes + rightVotes === 0 ? 50 : (rightVotes / (leftVotes + rightVotes)) * 100}%` }}
          >
            <span className="results-percentage">
              {leftVotes + rightVotes === 0 ? '0%' : `${Math.round((rightVotes / (leftVotes + rightVotes)) * 100)}%`}
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <p>Processing transaction...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App