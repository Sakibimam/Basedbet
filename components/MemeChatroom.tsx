"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { abi, contractAddress } from "../constant/abi";
import {
  db,
  getMemeDetails,
  placeBet,
  updateUserBet,
  getBattleStatus,
  addMemeToBattle,
  addUserBet,
} from "@/firebase";
import { ethers } from "ethers";
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  AttestationResult,
} from "@ethsign/sp-sdk";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Clock, Send, Zap, AlertTriangle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: any;
}

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

interface MemeChatroomProps {
  battleId: string;
  memeIndex: number;
}

const MemeChatroom: React.FC<MemeChatroomProps> = ({ battleId, memeIndex }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [meme, setMeme] = useState<Meme | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [attestationCreated, setAttestationCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const client = isClient
    ? new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.arbitrumSepolia,
      })
    : null;

  const betInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isClient) {
      connectWallet();
      fetchMemeDetails();
      fetchBattleDetails();
    }
  }, [isClient, battleId, memeIndex]);

  useEffect(() => {
    const checkBattleStatus = async () => {
      const status = await getBattleStatus(battleId);
      setIsBettingClosed(status !== "open");
    };
    checkBattleStatus();
  }, [battleId]);

  const connectWallet = async () => {
    if (isClient && typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x66eee" }],
        });
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const fetchMemeDetails = async () => {
    const memeData = await getMemeDetails(battleId, memeIndex);
    if (memeData) {
      setMeme(memeData);
    }
  };

  const fetchBattleDetails = async () => {
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      setBattleEndTime(battleData.endTime.toDate());
    }
  };

  useEffect(() => {
    if (battleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = battleEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft("Battle Ended");
          setIsBettingClosed(true);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          setIsBettingClosed(false);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battleEndTime]);

  useEffect(() => {
    if (!account) return;

    const memeMessagesRef = collection(
      db,
      `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
    );
    const q = query(memeMessagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Message)
      );
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [battleId, memeIndex, account]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!account || !newMessage.trim()) return;

    try {
      const memeMessagesRef = collection(
        db,
        `memeBattles/${battleId}/memes/${memeIndex}/chatMessages`
      );
      await addDoc(memeMessagesRef, {
        content: newMessage.trim(),
        sender: account,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handlePlaceBet = async () => {
    const currentBetAmount = betInputRef.current?.value;
    console.log(currentBetAmount);

    if (!account) {
      toast.error("Wallet not connected");
      return;
    }

    const betAmountWei = ethers.utils.parseEther(currentBetAmount || "0");
    const roomIdBigInt = BigInt(memeIndex);

    const UserAddress = account as `0x${string}`;

    if (!client) {
      console.error("SignProtocolClient is not initialized");
      toast.error("Error initializing bet. Please try again.");
      return;
    }

    const memeIdForContract = BigInt(memeIndex + 1);

    try {
      toast.info("Placing bet...", { autoClose: false });

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const createAttestationRes = await contract.placeBet(
        battleId,
        memeIdForContract,
        {
          value: betAmountWei,
        }
      );

      await createAttestationRes.wait();

      if (createAttestationRes) {
        setAttestationCreated(true);

        await addUserBet(
          UserAddress,
          battleId,
          memeIndex.toString(),
          Number(currentBetAmount),
          {
            name: String(3) || "",
            image: meme?.image || "",
            hashtag: meme?.hashtag || "",
          }
        );

        console.log(
          `Bet of ${betAmount} placed successfully on meme ${memeIndex} in battle ${battleId}`
        );
        setBetAmount("");
        toast.success(`Bet of ${currentBetAmount} ETH placed successfully!`);
      } else {
        toast.error("Failed to place bet. Please try again.");
      }
    } catch (error) {
      console.log("Error when running createAttestation function", error);
      toast.error("Error placing bet. Please try again.");
    }
  };

  if (!isClient) {
    return null; // or a loading indicator
  }

  if (!account) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <button
          onClick={connectWallet}
          className="text-neon-blue bg-black border-2 border-neon-blue hover:bg-neon-blue hover:text-black transition-all duration-300 font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-neon-blue/50"
        >
          Connect Wallet to proceed
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-black text-neon-blue min-h-screen max-w-7xl mx-auto">
      <div className="lg:w-1/3 mb-6 lg:mb-0">
        {meme && (
          <div className="mb-6 bg-black/50 p-6 rounded-lg border border-neon-purple">
            <h1
              className="text-4xl font-extrabold text-neon-purple mb-4 glitch-text"
              data-text={meme.name}
            >
              {meme.name}
            </h1>
            <div className="relative w-full pt-[75%] mb-4">
              <Image
                src={meme.image}
                alt={meme.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-lg absolute top-0 left-0"
              />
            </div>
            <p className="text-neon-green text-lg">#{meme.hashtag}</p>
          </div>
        )}
        {!isBettingClosed ? (
          <div className="mb-6 bg-black/50 p-6 rounded-lg border border-neon-blue">
            <h2 className="text-2xl font-bold mb-4 text-neon-blue">
              Place Your Bet
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="number"
                value={betAmount}
                ref={betInputRef}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full sm:w-2/3 border border-neon-purple bg-black/50 p-3 rounded-lg text-neon-blue outline-none focus:ring-2 focus:ring-neon-green"
                placeholder="Bet amount"
              />
              <button
                onClick={() => handlePlaceBet()}
                className="w-full sm:w-1/3 bg-neon-purple text-black font-bold py-3 px-4 rounded-lg hover:bg-neon-blue transition-colors duration-300"
              >
                <Zap className="inline-block mr-2" />
                Bet
              </button>
            </div>
          </div>
        ) : (
          <p className="text-neon-red text-xl font-bold mb-6">
            Betting is closed for this battle.
          </p>
        )}
        <div className="flex items-center justify-center mb-6 bg-black/50 p-4 rounded-lg border border-neon-pink">
          <Clock className="w-6 h-6 mr-2 text-neon-pink" />
          <span className="text-lg font-semibold text-neon-pink">
            {timeLeft}
          </span>
        </div>
      </div>
      <div className="lg:w-2/3 flex flex-col">
        <div className="flex-grow mb-6 h-[calc(100vh-20rem)] overflow-y-auto border border-neon-purple p-4 bg-black/50 rounded-lg shadow-lg">
          {messages.map((message) => (
            <div key={message.id} className="mb-4 flex items-start gap-2">
              <div className="w-10 h-10 bg-neon-purple rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-black font-bold">
                  {message.sender.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-neon-blue">
                  {message.sender.slice(0, 6)}...{message.sender.slice(-4)}
                </span>
                <span className="text-neon-green">{message.content}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleMessageSubmit} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow border bg-black/50 p-3 rounded-lg text-neon-blue outline-none border-neon-purple focus:ring-2 focus:ring-neon-green"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-neon-purple text-black font-bold py-2 px-4 rounded-lg hover:bg-neon-blue transition-colors duration-300 flex items-center"
          >
            <Send className="mr-2" />
            Send
          </button>
        </form>
      </div>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastClassName="bg-black border-2 border-neon-purple text-neon-blue"
      />
    </div>
  );
};

export default MemeChatroom;
