// // components/BettingSystem.tsx
// import { ethers } from 'ethers';
// import { useState } from 'react';

// interface BettingSystemProps {
//   battleId: string;
//   memeIndex: number;
// }

// const BettingSystem: React.FC<BettingSystemProps> = ({ battleId, memeIndex }) => {
//   const [betAmount, setBetAmount] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   const placeBet = async () => {
//     if (!window.ethereum) {
//       alert('Please install MetaMask to place bets!');
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();

//       // Replace with your actual smart contract address and ABI
//       const contractAddress = 'YOUR_CONTRACT_ADDRESS';
//       const contractABI = []; // Your contract ABI goes here
//       const contract = new ethers.Contract(contractAddress, contractABI, signer);

//       const tx = await contract.placeBet(battleId, memeIndex, {
//         value: ethers.utils.parseEther(betAmount)
//       });

//       await tx.wait();
//       alert('Bet placed successfully!');
//     } catch (error) {
//       console.error('Error placing bet:', error);
//       alert('Error placing bet. Please try again.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={betAmount}
//         onChange={(e) => setBetAmount(e.target.value)}
//         placeholder="Bet amount in ETH"
//       />
//       <button onClick={placeBet} disabled={isProcessing}>
//         {isProcessing ? 'Processing...' : 'Place Bet'}
//       </button>
//     </div>
//   );
// };

// export default BettingSystem;