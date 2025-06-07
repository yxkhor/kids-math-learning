import { useState, useEffect, useCallback } from "react";
import { Star, Trophy, Heart, Home, Volume2, VolumeX, Zap } from "lucide-react";
import { GameStats } from "./models/game-stats";
import VirtualPet from "./components/virtual-pet";
import { getPetName } from "./utils/get-pet-name";

interface Question {
  id: number;
  question: string;
  answer: number;
  options?: number[];
  type:
    | "addition"
    | "subtraction"
    | "multiplication"
    | "division"
    | "comparison";
}

const KidsMathGame = () => {
  // Game state
  const [currentScreen, setCurrentScreen] = useState("home");
  const [gameMode, setGameMode] = useState<
    "addition" | "subtraction" | "multiplication" | "division" | "comparison"
  >("addition");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game statistics
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem("stats");
    return saved
      ? JSON.parse(saved)
      : {
          petType: "cat",
          totalQuestions: 0,
          correctAnswers: 0,
          stars: 0,
          level: 1,
          achievements: [],
          petHappiness: 50,
          currentStreak: 0,
          bestStreak: 0,
          difficulty: "easy",
        };
  });

  useEffect(() => {
    localStorage.setItem("stats", JSON.stringify(stats));
  }, [stats]);

  const handleChangePetType = () => {
    const petTypes = ["cat", "dog", "hamster", "rabbit"];
    const currentIndex = petTypes.indexOf(stats.petType);
    const nextIndex = (currentIndex + 1) % petTypes.length;
    setStats({
      ...stats,
      petType: petTypes[nextIndex] as GameStats["petType"],
    });
  };

  // Get difficulty range based on level and stats
  const getDifficultyRange = useCallback(() => {
    const accuracy =
      stats.totalQuestions > 0
        ? stats.correctAnswers / stats.totalQuestions
        : 0;

    if (stats.level <= 2 || accuracy < 0.6) {
      return { min: 10, max: 30, label: "easy" };
    } else if (stats.level <= 5 || accuracy < 0.8) {
      return { min: 20, max: 60, label: "medium" };
    } else {
      return { min: 30, max: 100, label: "hard" };
    }
  }, [stats.level, stats.totalQuestions, stats.correctAnswers]);

  // Generate random math questions with expanded range
  const generateQuestion = useCallback(
    (
      type:
        | "addition"
        | "subtraction"
        | "multiplication"
        | "division"
        | "comparison"
    ): Question => {
      const id = Date.now();
      const range = getDifficultyRange();

      if (type === "addition") {
        const a =
          Math.floor(Math.random() * (range.max - range.min)) + range.min;
        const b = Math.floor(Math.random() * (range.max - a)) + range.min;
        const answer = a + b;
        const options = [
          answer,
          answer + Math.floor(Math.random() * 10) + 1,
          answer - Math.floor(Math.random() * 10) - 1,
          answer + Math.floor(Math.random() * 20) + 5,
        ].sort(() => Math.random() - 0.5);
        return {
          id,
          question: `${a} + ${b} = ?`,
          answer,
          options,
          type: "addition",
        };
      } else if (type === "subtraction") {
        const a =
          Math.floor(Math.random() * (range.max - range.min)) + range.min;
        const b = Math.floor(Math.random() * (a - 10)) + 10;
        const answer = a - b;
        const options = [
          answer,
          answer + Math.floor(Math.random() * 10) + 1,
          answer - Math.floor(Math.random() * 10) - 1,
          answer + Math.floor(Math.random() * 15) + 3,
        ]
          .filter((n) => n >= 0)
          .sort(() => Math.random() - 0.5);
        return {
          id,
          question: `${a} - ${b} = ?`,
          answer,
          options,
          type: "subtraction",
        };
      } else if (type === "multiplication") {
        // Keep multiplication factors reasonable for kids
        const a = Math.floor(Math.random() * 12) + 2; // 2-13
        const b = Math.floor(Math.random() * 12) + 2; // 2-13
        const answer = a * b;
        const options = [
          answer,
          answer + Math.floor(Math.random() * 20) + 5,
          answer - Math.floor(Math.random() * 15) - 3,
          answer + Math.floor(Math.random() * 30) + 10,
        ]
          .filter((n) => n > 0)
          .sort(() => Math.random() - 0.5);
        return {
          id,
          question: `${a} × ${b} = ?`,
          answer,
          options,
          type: "multiplication",
        };
      } else if (type === "division") {
        // Generate division that results in whole numbers
        const b = Math.floor(Math.random() * 12) + 2; // divisor 2-13
        const answer = Math.floor(Math.random() * 15) + 2; // quotient 2-16
        const a = b * answer; // dividend
        const options = [
          answer,
          answer + Math.floor(Math.random() * 5) + 1,
          answer - Math.floor(Math.random() * 3) - 1,
          answer + Math.floor(Math.random() * 8) + 3,
        ]
          .filter((n) => n > 0)
          .sort(() => Math.random() - 0.5);
        return {
          id,
          question: `${a} ÷ ${b} = ?`,
          answer,
          options,
          type: "division",
        };
      } else {
        let a = Math.floor(Math.random() * (range.max - range.min)) + range.min;
        let b = Math.floor(Math.random() * (range.max - range.min)) + range.min;

        if (a === b) b++;
        const isGreater = a > b;
        return {
          id,
          question: `Which is greater: ${a} OR ${b}`,
          answer: isGreater ? 1 : 0,
          options: [1, 0],
          type: "comparison",
        };
      }
    },
    [getDifficultyRange]
  );

  // Start game
  const startGame = (
    mode:
      | "addition"
      | "subtraction"
      | "multiplication"
      | "division"
      | "comparison"
  ) => {
    setGameMode(mode);
    setCurrentScreen("game");
    setCurrentQuestion(generateQuestion(mode));
    setUserAnswer(null);
    setShowResult(false);
  };

  // Submit answer
  const submitAnswer = (answer: number) => {
    if (!currentQuestion) return;

    setUserAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);

    const prevAnswers = JSON.parse(localStorage.getItem("answers") || "[]");
    prevAnswers.push({
      question: currentQuestion.question,
      answer,
      correct,
      correctAnswer: currentQuestion.answer,
      type: currentQuestion.type,
      timestamp: Date.now(),
    });
    localStorage.setItem("answers", JSON.stringify(prevAnswers));
    // Update statistics
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        currentStreak: correct ? prev.currentStreak + 1 : 0,
        stars: correct
          ? prev.stars +
            (currentQuestion.type === "multiplication" ||
            currentQuestion.type === "division"
              ? 2
              : 1)
          : prev.stars,
        petHappiness: Math.min(
          100,
          correct ? prev.petHappiness + 5 : Math.max(0, prev.petHappiness - 2)
        ),
        petType: prev.petType ?? "cat",
      };

      if (newStats.currentStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.currentStreak;
      }

      // Level up logic - now requires more stars
      if (newStats.stars >= newStats.level * 15) {
        newStats.level += 1;
      }

      // Update difficulty
      const accuracy =
        newStats.totalQuestions > 0
          ? newStats.correctAnswers / newStats.totalQuestions
          : 0;
      if (newStats.level <= 2 || accuracy < 0.6) {
        newStats.difficulty = "easy";
      } else if (newStats.level <= 5 || accuracy < 0.8) {
        newStats.difficulty = "medium";
      } else {
        newStats.difficulty = "hard";
      }

      return newStats;
    });

    // Show next question after 2.5 seconds (slightly longer for harder problems)
    setTimeout(() => {
      setCurrentQuestion(generateQuestion(gameMode));
      setShowResult(false);
      setUserAnswer(null);
    }, 2500);
  };

  const getDifficultyColor = () => {
    switch (stats.difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Home page
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🧮 Advanced Math Kingdom 🧮
          </h1>
          <p className="text-lg text-purple-600">
            Master numbers from 10 to 100!
          </p>
          <div className={`text-sm font-semibold mt-2 ${getDifficultyColor()}`}>
            Current Difficulty: {stats.difficulty.toUpperCase()}(
            {getDifficultyRange().min}-{getDifficultyRange().max} range)
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                My Achievements
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={soundEnabled ? "Turn off sound" : "Turn on sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                  <Star className="w-6 h-6" />
                  {stats.stars}
                </div>
                <div className="text-sm text-gray-600">Stars Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  <Trophy className="w-6 h-6" />
                  {stats.level}
                </div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalQuestions > 0
                    ? Math.round(
                        (stats.correctAnswers / stats.totalQuestions) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.bestStreak}
                </div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>
          <VirtualPet
            stats={stats}
            getDifficultyRange={getDifficultyRange}
            onChangePetType={handleChangePetType}
          />
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <button
            onClick={() => startGame("addition")}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-4xl mb-2">➕</div>
            <div className="text-lg font-bold">Addition</div>
            <div className="text-sm opacity-90">Add numbers</div>
            <div className="text-xs mt-1 bg-white/20 rounded px-2 py-1">
              +1 ⭐
            </div>
          </button>

          <button
            onClick={() => startGame("subtraction")}
            className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-4xl mb-2">➖</div>
            <div className="text-lg font-bold">Subtraction</div>
            <div className="text-sm opacity-90">Subtract numbers</div>
            <div className="text-xs mt-1 bg-white/20 rounded px-2 py-1">
              +1 ⭐
            </div>
          </button>

          <button
            onClick={() => startGame("multiplication")}
            className="bg-gradient-to-r from-red-400 to-orange-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-4xl mb-2">✖️</div>
            <div className="text-lg font-bold">Multiplication</div>
            <div className="text-sm opacity-90">Times tables</div>
            <div className="text-xs mt-1 bg-white/20 rounded px-2 py-1">
              +2 ⭐
            </div>
          </button>

          <button
            onClick={() => startGame("division")}
            className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-4xl mb-2">➗</div>
            <div className="text-lg font-bold">Division</div>
            <div className="text-sm opacity-90">Divide evenly</div>
            <div className="text-xs mt-1 bg-white/20 rounded px-2 py-1">
              +2 ⭐
            </div>
          </button>

          <button
            onClick={() => startGame("comparison")}
            className="bg-gradient-to-r from-indigo-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <div className="text-4xl mb-2">⚖️</div>
            <div className="text-lg font-bold">Compare</div>
            <div className="text-sm opacity-90">Which is bigger?</div>
            <div className="text-xs mt-1 bg-white/20 rounded px-2 py-1">
              +1 ⭐
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/50 rounded-xl p-4 inline-block">
            <p className="text-sm text-gray-700">
              🎯 Answer questions correctly to earn stars and make {getPetName(stats.petType)} happy!
              <br />
              🏆 Collect 15 stars to level up! Multiplication & Division give 2
              stars each!
              <br />
              📈 Your difficulty automatically adjusts based on your performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Game page
  const GamePage = () => {
    if (!currentQuestion) return null;

    const encouragementMessages = {
      correct: [
        "Outstanding! You're a math superstar! 🌟",
        "Perfect! Amazing calculation! ⭐",
        "Brilliant work! Keep it up! 🎉",
        "Excellent! You've got this! 👏",
        "Fantastic! Math genius in action! 🧠",
        "Incredible! You're unstoppable! 🚀",
        "Wonderful! Math mastery! 💫",
        "Superb! You're on fire! 🔥",
        "Awesome! Keep shining bright! ✨",
      ],
      incorrect: [
        "Good effort! Every mistake helps you learn! 😊",
        "Nice try! You're getting stronger! 💪",
        "Keep going! Practice makes perfect! 🌈",
        "Great attempt! Learning is a journey! 🚀",
        "Don't give up! You're improving! 📚",
        "Well tried! Next one will be easier! ⭐",
        "Good thinking! Math takes practice! 🎯",
        "Almost there! You're doing great! 🌟",
        "Oops! Mistakes are part of learning! Keep it up! 💖",
      ],
    };

    const randomEncouragement = isCorrect
      ? encouragementMessages.correct[
          Math.floor(Math.random() * encouragementMessages.correct.length)
        ]
      : encouragementMessages.incorrect[
          Math.floor(Math.random() * encouragementMessages.incorrect.length)
        ];

    const getGameModeTitle = () => {
      switch (gameMode) {
        case "addition":
          return "➕ Addition Challenge!";
        case "subtraction":
          return "➖ Subtraction Quest!";
        case "multiplication":
          return "✖️ Multiplication Master!";
        case "division":
          return "➗ Division Detective!";
        case "comparison":
          return "⚖️ Number Comparison!";
        default:
          return "🧮 Math Time!";
      }
    };

    const starsEarned =
      currentQuestion.type === "multiplication" ||
      currentQuestion.type === "division"
        ? 2
        : 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setCurrentScreen("home")}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              title="Go back home"
            >
              <Home className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold">{stats.stars}</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold">{stats.currentStreak}</span>
              </div>
              <div
                className={`text-xs font-bold px-2 py-1 rounded-full bg-white ${getDifficultyColor()}`}
              >
                {stats.difficulty.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {getGameModeTitle()}
              </h2>

              <div className="text-3xl font-bold text-purple-700 mb-6 p-4 bg-purple-50 rounded-2xl">
                {currentQuestion.question}
              </div>
            </div>

            {!showResult && (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => submitAnswer(option)}
                    className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-2xl font-bold p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {gameMode === "comparison"
                      ? option === 1
                        ? "Left <"
                        : "Right >"
                      : option}
                  </button>
                ))}
              </div>
            )}

            {showResult && (
              <div className="text-center">
                <div
                  className={`text-6xl mb-4 ${
                    isCorrect ? "animate-bounce" : "animate-pulse"
                  }`}
                >
                  {isCorrect ? "🎉" : "🌟"}
                </div>
                <div
                  className={`text-xl font-bold mb-4 ${
                    isCorrect ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {randomEncouragement}
                </div>
                <div className="text-lg text-gray-600 mb-2">
                  The correct answer is:{" "}
                  <span className="font-bold text-purple-600">
                    {currentQuestion.answer}
                  </span>
                </div>
                {isCorrect && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Star className="w-6 h-6 text-yellow-500 animate-spin" />
                    <span className="text-lg font-bold text-yellow-600">
                      +{starsEarned} Star{starsEarned > 1 ? "s" : ""}!
                    </span>
                    {starsEarned > 1 && (
                      <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
                    )}
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  Next question coming up...
                </div>
              </div>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 bg-white/50 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-700">
              Progress to next level: {stats.stars % 15}/15 stars
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((stats.stars % 15) / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentScreen === "home" && <HomePage />}
      {currentScreen === "game" && <GamePage />}
    </div>
  );
};

export default KidsMathGame;
