// src/app/[data_structure]/battle/[roomId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { OpponentProgressPayload } from "@/types/battle";
import QuestionPanelsClient from "@/components/practice/QuestionPanelsClient";

export default function BattleArena() {
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  const dataStructure = Array.isArray(params.data_structure) ? params.data_structure[0] : (params.data_structure || "arrays");

  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [opponent, setOpponent] = useState<OpponentProgressPayload>({
    senderId: "",
    passCount: 0,
    totalTests: 4,
    questionsSolved: 0,
    totalQuestions: 4,
    isCompleted: false,
    name: "Opponent",
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [matchOutcome, setMatchOutcome] = useState<{
    type: 'win' | 'loss';
    reason: string;
    message: string;
  } | null>(null);

  // Fetch 4 dynamic questions from database for 1.5 hr contest
  useEffect(() => {
    async function loadBattleQuestions() {
      try {
        const randomRes = await fetch("/api/questions/random");
        const randomData = await randomRes.json();
        
        if (randomData.success && randomData.questions && randomData.questions.length > 0) {
          setQuestionsList(randomData.questions);
        } else {
          const dsRes = await fetch(`/api/questions?dsSlug=${dataStructure}`);
          const dsData = await dsRes.json();
          if (dsData.success && dsData.questions) {
            setQuestionsList(dsData.questions.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Failed to load battle questions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBattleQuestions();
  }, [dataStructure]);

  // Socket connection & handlers for all 4 win/loss cases
  useEffect(() => {
    if (!roomId) return;
    
    socket.connect();
    socket.emit("joinBattleRoom", { roomId });

    socket.on("opponentProgress", (data: OpponentProgressPayload) => {
      setOpponent(data);
    });

    // Rule 2, 3, 4: Battle Ended Event
    socket.on("battleEnded", ({ winnerId, winnerName, reason, message }: any) => {
      setWinner(winnerName);
      const myUsername = (socket.auth as any)?.username;
      const isMe = (winnerName && myUsername && winnerName === myUsername) || socket.id === winnerId;
      if (isMe) {
        setMatchOutcome({
          type: 'win',
          reason: reason || 'completed_all_questions',
          message: message || `🏆 VICTORY! You won the match!`
        });
      } else {
        setMatchOutcome({
          type: 'loss',
          reason: reason || 'completed_all_questions',
          message: message || `❌ DEFEAT! ${winnerName || 'Opponent'} won the match.`
        });
      }
    });

    // Rule 1: Opponent Disconnection / Forfeit Handler
    socket.on("opponentDisconnected", ({ message, winnerId, winnerName, reason }: any) => {
      const myUsername = (socket.auth as any)?.username;
      const isMe = (winnerName && myUsername && winnerName === myUsername) || socket.id === winnerId;
      if (isMe) {
        setWinner(winnerName || "You (by forfeit)");
        setMatchOutcome({
          type: 'win',
          reason: 'opponent_forfeit',
          message: message || 'Opponent backed out or left the match! You win by forfeit!'
        });
      } else {
        setMatchOutcome({
          type: 'loss',
          reason: 'forfeit',
          message: 'You backed out of the match.'
        });
      }
    });

    return () => {
      socket.off("opponentProgress");
      socket.off("battleEnded");
      socket.off("opponentDisconnected");
    };
  }, [roomId]);

  // Handle browser back button / window close / pagehide away from battle page
  useEffect(() => {
    if (!roomId) return;

    const handleUnload = () => {
      socket.emit("leaveMatch", { roomId });
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [roomId]);

  const handleTestSubmit = (passed: number, total: number, questionsSolvedCount = 0) => {
    const isCompleted = questionsSolvedCount >= 4;
    socket.emit("submitAttempt", {
      roomId,
      passCount: passed,
      totalTests: total,
      questionsSolved: questionsSolvedCount,
      totalQuestions: 4,
      isCompleted,
    });
  };

  const handleTimeExpired = () => {
    socket.emit("timeExpired", { roomId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Preparing 1.5 Hr Contest & Matching Opponent...</span>
        </div>
      </div>
    );
  }

  return (
    <QuestionPanelsClient
      questionsList={questionsList}
      dataStructure={dataStructure}
      battleMode={true}
      opponent={opponent}
      winner={winner}
      matchOutcome={matchOutcome}
      roomId={roomId}
      onBattleSubmit={handleTestSubmit}
      onTimeExpired={handleTimeExpired}
    />
  );
}