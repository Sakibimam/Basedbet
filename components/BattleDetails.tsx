"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Link from "next/link";
import { ethers } from "ethers";
import { abi, contractAddress } from "../constant/abi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Clock, Trophy, Zap, AlertTriangle } from "lucide-react";

interface Meme {
  name: string;
  image: string;
  hashtag: string;
}

const BattleDetails: React.FC<{ battleId: string }> = ({ battleId }) => {
  const [battle, setBattle] = useState<any>(null);
  const [battleEndTime, setBattleEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [winningMemeIndex, setWinningMemeIndex] = useState<number | null>(null);
  const [showDeclareWinnerButton, setShowDeclareWinnerButton] = useState(false);

  useEffect(() => {
    const fetchBattleDetails = async () => {
      const battleDoc = await getDoc(doc(db, "battles", battleId));
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        setBattle(battleData);
        if (
          battleData.endTime &&
          typeof battleData.endTime.toDate === "function"
        ) {
          setBattleEndTime(battleData.endTime.toDate());
        }
      }
    };
    fetchBattleDetails();
  }, [battleId]);

  useEffect(() => {
    if (battle && battleEndTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = battleEndTime.getTime();
        const distance = endTime - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft("Battle Ended");
          if (battle.winningMeme === null) {
            setShowDeclareWinnerButton(true);
          }
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battle, battleEndTime]);

  const declareWinner = async () => {
    if (battle.winningMeme !== null) {
      toast.error("Winner has already been declared!");
      return;
    }

    try {
      const memeResults = await Promise.all(
        battle.memes.map(async (meme: Meme) => {
          if (!meme.hashtag) {
            console.error("Meme is missing hashtag:", meme);
            return { meme, mediaCount: 0 };
          }

          const url = `https://instagram-scraper-20231.p.rapidapi.com/searchtag/${encodeURIComponent(
            meme.hashtag
          )}`;
          const options = {
            method: "GET",
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY as string,
              "x-rapidapi-host": "instagram-scraper-20231.p.rapidapi.com",
            },
          };

          try {
            const response = await fetch(url, options);
            const result = await response.json();
            return { meme, mediaCount: result.data[0]?.media_count || 0 };
          } catch (error) {
            console.error("Error fetching hashtag data:", error);
            return { meme, mediaCount: 0 };
          }
        })
      );

      const winningMeme = memeResults.reduce((prev, current) =>
        prev.mediaCount > current.mediaCount ? prev : current
      );

      const winningIndex = battle.memes.findIndex(
        (meme: Meme) => meme.hashtag === winningMeme.meme.hashtag
      );

      if (winningIndex === -1) {
        console.error("Winning meme not found in battle memes");
        toast.error("Error determining the winner. Please try again.");
        return;
      }

      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          toast.info("Declaring winner on the blockchain...", {
            autoClose: false,
          });
          const tx = await contract.declareWinner(
            battleId,
            (winningIndex + 1) as BigInt
          );
          await tx.wait();
          toast.success("Winner declared on the blockchain!");
        } catch (error) {
          console.error("Error declaring winner on contract:", error);
          toast.error(
            "Error declaring winner on the blockchain. Please try again."
          );
          return;
        }
      } else {
        console.error(
          "Ethereum object not found, do you have MetaMask installed?"
        );
        toast.error(
          "MetaMask not detected. Please install MetaMask and try again."
        );
        return;
      }

      const battleRef = doc(db, "battles", battleId);
      await updateDoc(battleRef, {
        winningMeme: winningIndex,
      });

      setWinningMemeIndex(winningIndex);
      setBattle({ ...battle, winningMeme: winningIndex });
      setShowDeclareWinnerButton(false);
      toast.success(`Winner declared: ${battle.memes[winningIndex].name}`);
    } catch (error) {
      console.error("Error in declareWinner:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!battle)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-neon-blue">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-2xl font-bold">Battle not found or loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-neon-blue p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl md:text-6xl font-bold text-neon-purple mb-4 animate-pulse">
          {battle.name}
        </h1>
        <p className="text-xl text-neon-green mb-6">{battle.description}</p>
        <div className="flex items-center justify-between mb-8 bg-black/50 p-4 rounded-lg border border-neon-blue">
          <div className="flex items-center">
            <Clock className="w-6 h-6 mr-2 text-neon-pink" />
            <span className="text-lg font-semibold">{timeLeft}</span>
          </div>
          {showDeclareWinnerButton && (
            <button
              onClick={declareWinner}
              className="bg-neon-green text-black px-6 py-3 rounded-md hover:bg-neon-blue transition-colors duration-300 flex items-center"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Declare Winner
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
          {battle.memes.map((meme: Meme, index: number) => (
            <Link
              href={`/battles/${battleId}/memes/${index}`}
              key={index}
              className="group w-full max-w-sm"
            >
              <div className="battle-card bg-black/70 border-2 border-neon-purple p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon-purple/50 relative overflow-hidden h-full flex flex-col">
                <div className="absolute inset-0 bg-grid-neon-blue/10 animate-grid-flow pointer-events-none"></div>
                <img
                  src={meme.image}
                  alt={meme.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-2xl font-bold text-neon-blue mb-2">
                  {meme.name}
                </h2>
                <p className="text-neon-green mb-4 flex-grow">
                  #{meme.hashtag}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"></div>
              </div>
            </Link>
          ))}
        </div>
        {battle.winningMeme !== undefined && (
          <div className="mt-12 bg-black/70 border-2 border-neon-green p-6 rounded-lg max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-neon-green mb-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 mr-2" />
              Winner: {battle?.memes[battle.winningMeme]?.name}
            </h2>
            <div className="flex flex-col items-center justify-center">
              <img
                src={battle?.memes[battle.winningMeme]?.image}
                alt={battle?.memes[battle.winningMeme]?.name}
                className="w-64 h-64 object-cover rounded-md mb-4 md:mb-0 md:mr-6"
              />
              <div className="text-center w-full mt-4">
                <p className="text-xl text-neon-blue mb-2">
                  Hashtag: #{battle?.memes[battle.winningMeme]?.hashtag}
                </p>
                <p className="text-lg text-neon-pink">
                  Congratulations to the winner of this epic Cyber Battle!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        toastClassName="bg-black border-2 border-neon-purple text-neon-blue"
      />
    </div>
  );
};

export default BattleDetails;
