"use client";

import React from "react";
import AttestationTable from "./AttestationTable";
import Link from "next/link";
import { Zap, X, Menu, Loader2 } from "lucide-react";
import { useState } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "xai-RYmVRPidDgXtrmju5YGZ76aNBUk8CcvMG67SSmNwn9kyjGRhlg42swJU9Z585UV6swcJU88vZDR6rDLf",
  dangerouslyAllowBrowser: true ,
  baseURL: "https://api.x.ai/v1",
});

interface MemeAnalysis {
  score: number;
  description: string;
}

const UserProfile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [xUsername, setXUsername] = useState("");
  const [memeAnalysis, setMemeAnalysis] = useState<MemeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeMemeProfile = async () => {
    if (!xUsername) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "grok-beta",
        messages: [
          { 
            role: "system", 
            content: "You are an AI specialized in analyzing X (Twitter) profiles for meme potential and engagement. Provide analysis in JSON format with a meme score out of 100 and a detailed description." 
          },
          {
            role: "user",
            content: `Analyze the X profile @${xUsername} for their meme potential and engagement. Consider their posting style, engagement rates, and meme sharing behavior. Return a JSON object with a 'score' field (number out of 100) and a 'description' field (detailed analysis of their meme behavior).`
          }
        ],
      });

      const responseText = completion.choices[0].message.content;
      let analysisData: MemeAnalysis;

      try {
        analysisData = JSON.parse(responseText);
      } catch (e) {
        // If the response isn't valid JSON, try to extract score and description using regex
        const scoreMatch = responseText.match(/["']?score["']?\s*:\s*(\d+)/);
        const descriptionMatch = responseText.match(/["']?description["']?\s*:\s*["']([^"']+)["']/);
        
        if (scoreMatch && descriptionMatch) {
          analysisData = {
            score: parseInt(scoreMatch[1]),
            description: descriptionMatch[1]
          };
        } else {
          throw new Error('Invalid response format');
        }
      }

      setMemeAnalysis(analysisData);
    } catch (error) {
      console.error("Failed to analyze meme profile:", error);
      setError("Failed to analyze profile. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neon-blue">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="w-full h-fit py-3 sm:py-5 bg-black/50 backdrop-blur-xl border-2 border-neon-purple rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row justify-between items-center relative text-neon-blue px-4 sm:px-10">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <Link
              href={"/"}
              className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple animate-pulse cursor-pointer"
            >
              Meme Battles
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden text-neon-blue hover:text-neon-purple transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } sm:flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-7 w-full sm:w-auto mt-4 sm:mt-0`}
          >
            <Link
              href={"/battles"}
              className="text-neon-green hover:text-neon-blue font-semibold transition-all duration-300 cursor-pointer text-base sm:text-lg relative group"
            >
              Battle Page
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href={"/profile"}
              className="text-neon-green hover:text-neon-blue font-semibold transition-all duration-300 cursor-pointer text-base sm:text-lg relative group"
            >
              Profile
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 pt-32">
        <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          User Profile
        </h1>

        <div className="space-y-8">
          {/* X Username Analysis Section */}
          <div className="bg-black/50 border-2 border-neon-purple rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
            <h2 className="text-3xl font-semibold text-neon-blue mb-6 flex items-center">
              <Zap className="w-8 h-8 mr-2 text-neon-purple" />
              Meme Score Analysis
            </h2>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={xUsername}
                  onChange={(e) => setXUsername(e.target.value.replace('@', ''))}
                  placeholder="Enter your X (Twitter) username"
                  className="flex-1 px-4 py-2 bg-black/30 border-2 border-neon-purple rounded-xl text-neon-blue placeholder-neon-blue/50 focus:outline-none focus:border-neon-blue transition-colors"
                />
                <button
                  onClick={analyzeMemeProfile}
                  disabled={isAnalyzing || !xUsername}
                  className={`px-6 py-2 bg-neon-purple/20 border-2 border-neon-purple rounded-xl text-neon-blue font-semibold hover:bg-neon-purple/30 transition-all duration-300 ${
                    (isAnalyzing || !xUsername) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    'Analyze Profile'
                  )}
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              {memeAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-neon-purple">{memeAnalysis.score}</div>
                    <div className="text-xl text-neon-blue">Meme Score</div>
                  </div>
                  <p className="text-neon-green text-lg">{memeAnalysis.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Attestations Section */}
          <div className="bg-black/50 border-2 border-neon-purple rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
            <h2 className="text-3xl font-semibold text-neon-blue mb-6 flex items-center">
              <Zap className="w-8 h-8 mr-2 text-neon-purple" />
              Your Attestations
            </h2>
            <p className="text-neon-green text-lg mb-6">
              Here is a record of all your meme betting activities. Each
              attestation represents a bet you have made.
            </p>
            <AttestationTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
            
            
            
            