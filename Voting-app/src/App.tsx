import { useState } from 'react'
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
  
  const connectWallet = async () => {
  if (window.ethereum) {
    try {
      console.log("Wallet Detected");

      const web3provider = new BrowserProvider(window.ethereum);
      const signer = await web3provider.getSigner();
      const address = await signer.getAddress();
      const contract = new Contract(Contractaddress, abi, signer);

      console.log("Connected account", account);

      setProvider(web3provider);
      setSigner(signer);
      setAccount(address);
      setContract(contract);

      fetchVotes(contract);
      
    }
    catch (err) {
      console.log("Error connecting wallet:", err);
      alert("Failed  to connect wallet.");
    } 
  }
  else {
      alert("Wallet not detected. Please install it.");
    }
  }
  
  const leftvote = async () => {
    if (contract) {
    const tx = await contract.party1vote();
    await tx.wait();
    alert("The vote has been conducted");
    fetchVotes(contract)
    }
  }

   const rightvote = async () => {
    if (contract) {
    const tx = await contract.party2vote();
    await tx.wait();
    alert("The vote has been conducted");
    fetchVotes(contract);
    }
  }

  const fetchVotes = async (c: Contract) => {
    try {
      const left = await c.party1votereturn();
      const right = await c.party2votereturn();
      setLeftVotes(Number(left));
      setRightVotes(Number(right))
    }
    catch (err) {
      console.error("Error fetching votes", err)
    }
  };

  console.log(signer);

    

  return (
    <>
      <div className='mainroot'>
        <button className="connectwallet" onClick={connectWallet}>{provider ? `Connected as ${account}` :  "Connect"}</button>
        <div className='middiv'>
          <div className='leftist'>
            <div className="left_div_up"><img src={leftlogo} alt="left_logo" className='left_party_logo' /></div>
            <div className="left_div_down"> <button className="left_vote" onClick={leftvote}>Vote</button></div>
          </div>
          <div className='rightist'>
            <div className="right_div_up"><img src={rightlogo} alt="right_logo" className='right_party_logo' /></div>
            <div className="right_div_down"><button className="right_vote" onClick={rightvote}>Vote</button></div>
          </div>
        </div>
        <div  className='scoreboard'>
          <div className="leftistscore">Left Votes: {leftVotes}</div>
          <div className="rightistscore">Right Votes: {rightVotes}</div>
        </div>

      </div>

    </>
  )
}

export default App
