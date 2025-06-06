import React from "react";
import { GameStats } from "../models/game-stats";

interface VirtualPetProps {
  stats: GameStats;
  getDifficultyRange: () => { min: number; max: number; label: string };
}

const VirtualPet: React.FC<VirtualPetProps> = ({ stats, getDifficultyRange }) => {
  const petEmoji =
    stats.petHappiness > 80
      ? "😻"
      : stats.petHappiness > 60
      ? "😸"
      : stats.petHappiness > 30
      ? "😺"
      : "😿";
  const petMood =
    stats.petHappiness > 80
      ? "Extremely Happy!"
      : stats.petHappiness > 60
      ? "Very Happy!"
      : stats.petHappiness > 30
      ? "Happy"
      : "Needs Care";

  return (
    <div className="text-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
      <div className="text-6xl mb-2 animate-bounce">{petEmoji}</div>
      <div className="text-sm font-bold text-purple-700">
        Fluffy the Math Cat
      </div>
      <div className="text-xs text-purple-600 mb-2">{petMood}</div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
        <div
          className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${stats.petHappiness}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Happiness: {stats.petHappiness}/100
      </div>
      <div className="text-xs text-blue-600 mt-1">
        Current Level: {stats.difficulty.toUpperCase()} (
        {getDifficultyRange().min}-{getDifficultyRange().max})
      </div>
    </div>
  );
};

export default VirtualPet;