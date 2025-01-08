"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Zap, Loader2, PlusCircle, Clock } from "lucide-react";

interface MemeBattle {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  endTime: any;
  status: string;
  memes: Array<{ name: string; image: string; hashtag: string }>;
}

const BattlesList: React.FC = () => {
  const [memeBattles, setMemeBattles] = useState<MemeBattle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemeBattles();
  }, []);

  const fetchMemeBattles = async () => {
    try {
      setLoading(true);
      const battlesCollection = collection(db, "battles");
      const battleSnapshot = await getDocs(battlesCollection);
      const battleList = battleSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as MemeBattle)
      );
      setMemeBattles(battleList);
      console.log("Fetched meme battles:", battleList);
    } catch (error) {
      console.error("Error fetching meme battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-neon-blue">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <div className="text-xl font-bold animate-pulse">
          Loading Cyber Battles...
        </div>
      </div>
    );
  }

  if (memeBattles.length === 0) {
    return (
      <div className="text-center mt-10 p-8 bg-black/50 backdrop-blur-xl border-2 border-neon-purple rounded-xl">
        <h2 className="text-2xl font-bold text-neon-blue mb-4">
          No Cyber Battles Found
        </h2>
        <p className="text-neon-green mb-6">
          Initiate a new battle to start the cyber warfare!
        </p>
        <Link
          href="/battles/addMemeBattle"
          className="inline-flex items-center px-6 py-3 text-black bg-gradient-to-r from-neon-blue to-neon-purple rounded-md font-bold transition-all duration-300 hover:from-neon-purple hover:to-neon-blue hover:scale-105 hover:shadow-lg hover:shadow-neon-purple/50"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Cyber Battle
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {memeBattles.map((battle) => (
          <Link
            href={`/battles/${battle.id}`}
            key={battle.id}
            className="group"
          >
            <div className="bg-black/70 border-2 border-neon-blue backdrop-blur-xl p-6 rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-neon-blue/30 relative overflow-hidden h-64 flex flex-col justify-between">
              <div className="absolute inset-0 bg-grid-neon-blue/10 animate-grid-flow pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-neon-purple mb-2 truncate">
                  {battle.name}
                </h2>
                <p className="text-sm text-neon-green mb-4 line-clamp-2">
                  {battle.description}
                </p>
              </div>
              <div className="flex flex-col space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neon-blue flex items-center">
                    <Zap className="inline-block w-4 h-4 mr-1" />
                    {battle.memes.length} memes
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      battle.status === "active"
                        ? "text-neon-green border-neon-green"
                        : "text-neon-pink border-neon-pink"
                    }`}
                  >
                    {battle.status}
                  </span>
                </div>
                <div className="text-xs text-neon-blue flex items-center">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  {new Date(battle.endTime.seconds * 1000).toLocaleString()}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"></div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <Link
          href="/battles/addMemeBattle"
          className="inline-flex items-center px-6 py-3 text-black bg-gradient-to-r from-neon-blue to-neon-purple rounded-md font-bold transition-all duration-300 hover:from-neon-purple hover:to-neon-blue hover:scale-105 hover:shadow-lg hover:shadow-neon-purple/50"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Cyber Battle
        </Link>
      </div>
    </div>
  );
};

export default BattlesList;
