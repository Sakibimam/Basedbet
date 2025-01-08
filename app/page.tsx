"use client";

import Link from "next/link";
import picbet from "../public/crypto_meme_collage.webp";
import Image from "next/image";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { Cpu, Zap, Trophy } from "lucide-react";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen font-mono bg-black text-neon-blue">
      <header className="py-4 px-4 bg-black/50 backdrop-blur-sm border-b border-neon-pink/30">
        <div className="flex justify-end">
          <div className="wallet-container">
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6 ring-2 ring-neon-pink" />
                <Name className="text-neon-blue hidden sm:inline" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity
                  className="px-4 pt-3 pb-2 bg-black/80 backdrop-blur-md"
                  hasCopyAddressOnClick
                >
                  <Avatar className="ring-2 ring-neon-pink" />
                  <Name className="text-neon-blue" />
                  <Address className="text-neon-green" />
                  <EthBalance className="text-neon-purple" />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue hover:bg-neon-blue/20"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect className="text-neon-red hover:bg-neon-red/20" />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-black min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
          <div className="text-center lg:text-left flex flex-col justify-center col-span-1 lg:pl-8 xl:pl-20 z-10 order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple animate-pulse">
              BasedBets
            </h1>
            <div className="relative lg:left-64 text-neon-green mt-2">
              <span className="text-sm text-neon-blue">Powered by</span> Base
            </div>
            <p className="mt-6 text-base text-neon-blue sm:text-xl w-full sm:w-[90%]">
              Where memes become{" "}
              <span className="font-semibold text-neon-purple">legends</span>,{" "}
              <br className="hidden sm:inline" /> and your{" "}
              <span className="font-semibold text-neon-pink">bets</span> fuel
              the battle for ultimate internet glory.
            </p>

            <Link
              href="/battles"
              className="w-full sm:w-fit flex items-center justify-center px-4 py-3 mt-8 font-semibold text-black transition-all duration-200 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl border-2 border-transparent hover:border-neon-pink hover:from-neon-purple hover:to-neon-blue group"
            >
              Go to Dashboard
              <Zap className="w-6 h-6 ml-2 transform transition-transform duration-200 group-hover:translate-x-2" />
            </Link>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-neon-blue/30">
                <Cpu className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 text-neon-blue" />
                <p className="text-xs sm:text-sm text-neon-green">
                  Chat with other stakers online
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-neon-purple/30">
                <Trophy className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 text-neon-purple" />
                <p className="text-xs sm:text-sm text-neon-green">
                  Compete for top rankings
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-neon-pink/30">
                <Zap className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 text-neon-pink" />
                <p className="text-xs sm:text-sm text-neon-green">
                  Win exciting rewards
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center h-[50vh] sm:h-[70vh] lg:h-[100vh] relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-grid-neon-blue/20 animate-grid-flow"></div>
            <div className="col-span-1 h-[300px] w-[400px] sm:h-[500px] sm:w-[700px] lg:h-[700px] lg:w-[1000px] bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg shadow-2xl shadow-neon-purple/50 transform rotate-12 transition-transform duration-300 hover:rotate-6 hover:scale-105 lg:translate-x-8 xl:translate-x-32 -translate-y-8 lg:-translate-y-16 p-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-glitch opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center justify-center h-full">
                <Image
                  src={picbet}
                  alt=""
                  className="object-cover h-full w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
