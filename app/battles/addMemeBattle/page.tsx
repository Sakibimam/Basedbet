"use client";

import React, { useState } from "react";
import { addMemeBattle } from "../../../firebase";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../../constant/abi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Zap, Plus, X } from "lucide-react";
import Image from "next/image";

const AddMemeBattle: React.FC = () => {
  const [battleName, setBattleName] = useState("");
  const [battleDescription, setBattleDescription] = useState("");
  const [memes, setMemes] = useState<
    Array<{ name: string; image: string; hashtag: string }>
  >([]);
  const [battleDuration, setbattleDuration] = useState(600000); // 600000 default
  const [currentMeme, setCurrentMeme] = useState({
    name: "",
    image: "",
    hashtag: "",
  });
  const [errors, setErrors] = useState({
    battleName: "",
    battleDescription: "",
    memeName: "",
    memeImage: "",
    memeHashtag: "",
    battleDuration: 0,
  });
  const router = useRouter();

  const validateMemeFields = () => {
    const newErrors = {
      memeName: currentMeme.name ? "" : "Enter this field",
      memeImage: currentMeme.image ? "" : "Enter this field",
      memeHashtag: currentMeme.hashtag ? "" : "Enter this field",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((error) => error === "");
  };

  const validateBattleFields = () => {
    const newErrors = {
      battleName: battleName ? "" : "Enter this field",
      battleDescription: battleDescription ? "" : "Enter this field",
    };
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleAddMeme = () => {
    if (validateMemeFields()) {
      setMemes([...memes, currentMeme]);
      setCurrentMeme({ name: "", image: "", hashtag: "" });
      setErrors({ ...errors, memeName: "", memeImage: "", memeHashtag: "" });
    }
  };

  const handleRemoveMeme = (index: number) => {
    setMemes(memes.filter((_, i) => i !== index));
  };

  const createBattleOnContract = async (
    battleId: string,
    memeNames: string[]
  ) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Minimum stake of 0.00001 ether
        const stake = ethers.utils.parseEther("0.00001");

        const tx = await contract.createBattle(
          battleId,
          memeNames,
          battleDuration,
          {
            value: stake,
          }
        );
        await tx.wait();
        console.log("Battle created on contract");
      } catch (error) {
        console.error("Error creating battle on contract:", error);
        throw error;
      }
    } else {
      throw new Error(
        "Ethereum object not found, do you have MetaMask installed?"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBattleFields() && memes.length > 0) {
      try {
        const battleId = await addMemeBattle({
          name: battleName,
          description: battleDescription,
          memes,
        });
        if (battleId) {
          const memeNames = memes.map((meme) => meme.name);
          await createBattleOnContract(battleId, memeNames);
          toast.success("Meme battle created successfully!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          router.push("/battles");
        } else {
          throw new Error("Failed to create meme battle");
        }
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        toast.error("An error occurred while creating the meme battle.");
      }
    } else {
      toast.error("Please fill all required fields and add at least one meme.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-black/70 border-2 border-neon-blue p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold text-neon-purple mb-8 text-center animate-pulse">
          Create New Cyber Battle
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="battleName"
                className="block mb-2 text-lg font-semibold text-neon-blue"
              >
                Battle Name:
              </label>
              <input
                type="text"
                id="battleName"
                value={battleName}
                onChange={(e) => setBattleName(e.target.value)}
                className={`w-full px-4 py-2 border-2 ${
                  errors.battleName ? "border-neon-red" : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300`}
              />
              {errors.battleName && (
                <p className="text-neon-red text-sm mt-1">
                  {errors.battleName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="battleDescription"
                className="block mb-2 text-lg font-semibold text-neon-blue"
              >
                Battle Description:
              </label>
              <textarea
                id="battleDescription"
                value={battleDescription}
                onChange={(e) => setBattleDescription(e.target.value)}
                className={`w-full p-4 border-2 ${
                  errors.battleDescription
                    ? "border-neon-red"
                    : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300 h-32 resize-none`}
              ></textarea>
              {errors.battleDescription && (
                <p className="text-neon-red text-sm mt-1">
                  {errors.battleDescription}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="battleDuration"
              className="block mb-2 text-lg font-semibold text-neon-blue"
            >
              Battle Duration (seconds):
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="battleDuration"
                value={battleDuration}
                // min={60} // Minimum 1 minute
                // max={1800} // Maximum 30 minutes
                onChange={(e) => setbattleDuration(Number(e.target.value))}
                className={`w-full px-4 py-2 border-2 ${
                  errors.battleDuration ? "border-neon-red" : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300`}
              />
              {/* <Timer className="ml-2 text-neon-blue" size={24} /> */}
            </div>
            <p className="text-sm text-neon-green mt-1">
              Duration between 1-30 minutes (60-1800 seconds)
            </p>
            {errors.battleDuration && (
              <p className="text-neon-red text-sm mt-1">
                {errors.battleDuration}
              </p>
            )}
          </div>

          <div className="border-2 border-neon-purple p-6 rounded-lg bg-black/30 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-neon-green mb-4">
              Add Memes to Battle
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Meme Name"
                value={currentMeme.name}
                onChange={(e) =>
                  setCurrentMeme({ ...currentMeme, name: e.target.value })
                }
                className={`w-full px-3 py-2 border-2 ${
                  errors.memeName ? "border-neon-red" : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300`}
              />
              <input
                type="url"
                placeholder="Meme Image URL"
                value={currentMeme.image}
                onChange={(e) =>
                  setCurrentMeme({ ...currentMeme, image: e.target.value })
                }
                className={`w-full px-3 py-2 border-2 ${
                  errors.memeImage ? "border-neon-red" : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300`}
              />
              <input
                type="text"
                placeholder="Meme Hashtag"
                value={currentMeme.hashtag}
                onChange={(e) =>
                  setCurrentMeme({ ...currentMeme, hashtag: e.target.value })
                }
                className={`w-full px-3 py-2 border-2 ${
                  errors.memeHashtag ? "border-neon-red" : "border-neon-blue"
                } bg-black/50 rounded-lg text-neon-green outline-none focus:ring-2 focus:ring-neon-purple transition-all duration-300`}
              />
            </div>
            {(errors.memeName || errors.memeImage || errors.memeHashtag) && (
              <p className="text-neon-red text-sm mt-2">
                Please fill all meme fields
              </p>
            )}
            <button
              type="button"
              onClick={handleAddMeme}
              className="mt-4 text-black bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 flex items-center justify-center"
            >
              <Plus className="mr-2" size={16} />
              Add Meme
            </button>
          </div>
          {memes.length > 0 && (
            <div className="mt-6 border-2 border-neon-green p-6 rounded-lg bg-black/30 backdrop-blur-sm">
              <h3 className="font-semibold text-xl text-neon-blue mb-4">
                Added Memes:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memes.map((meme, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border-2 border-neon-purple">
                      <Image
                        src={meme.image}
                        alt={meme.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-neon-green p-4">
                      <p className="font-bold text-lg mb-1">{meme.name}</p>
                      <p className="text-sm">#{meme.hashtag}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeme(index)}
                      className="absolute top-2 right-2 bg-neon-red text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full border-2 border-neon-purple bg-black hover:bg-neon-purple hover:text-black transition-all duration-300 text-neon-purple py-3 rounded-lg shadow-lg font-bold text-lg flex items-center justify-center"
          >
            <Zap className="mr-2" size={20} />
            Launch Cyber Battle
          </button>
        </form>
      </div>
      <ToastContainer theme="dark" />
    </div>
  );
};

export default AddMemeBattle;
