// src/app/[data_structure]/battle/[roomId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { socket } from "@/lib/socket";
import { OpponentProgressPayload } from "@/types/battle";
import QuestionPanelsClient from "@/components/practice/QuestionPanelsClient";

export default function BattleArena() {
  const params = useParams();
  const router = useRouter();
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
  const [matchResult, setMatchResult] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [endReason, setEndReason] = useState<'forfeit' | 'timeout' | 'score' | string | null>(null);
  const [matchOutcome, setMatchOutcome] = useState<{
    type: 'win' | 'loss' | 'draw';
    reason: string;
    message: string;
    finalScores?: any[];
  } | null>(null);

  const [reconnectingNotification, setReconnectingNotification] = useState<string | null>(null);
  const [matchEndTime, setMatchEndTime] = useState<number | null>(null);

  // Ensure userId and username are registered in socket.auth and localStorage
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let storedId = localStorage.getItem("dsasaga_user_id");
      if (!storedId) {
        storedId = "usr_" + Math.floor(Math.random() * 1000000);
        localStorage.setItem("dsasaga_user_id", storedId);
      }
      return storedId;
    }
    return "";
  });

  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  // Socket connection & handlers (Server-Authoritative)
  useEffect(() => {
    if (!roomId) return;

    // Ensure socket auth is attached before connect
    if (typeof window !== "undefined") {
      let storedId = localStorage.getItem("dsasaga_user_id");
      if (!storedId) {
        storedId = "usr_" + Math.floor(Math.random() * 1000000);
        localStorage.setItem("dsasaga_user_id", storedId);
      }
      let storedName = localStorage.getItem("dsasaga_username") || "Player_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("dsasaga_username", storedName);

      setCurrentUserId(storedId);
      socket.auth = { userId: storedId, username: storedName };
    }

    socket.connect();
    socket.emit("joinBattleRoom", { roomId });

    // Invalid / Expired Room Redirection Guard
    const handleInvalidRoom = (data: any) => {
      toast.error(data?.message || "Invalid or Expired Room", { id: "invalid-room-toast" });
      router.push(`/${dataStructure}/battle`);
    };

    // Unauthorized Room Access Redirection Guard
    const handleRoomUnauthorized = (data: any) => {
      toast.error(data?.message || "Unauthorized Room Access", { id: "room-unauthorized-toast" });
      router.push(`/${dataStructure}/battle`);
    };

    // Submission Failed Handler ("Done" button clicked on incomplete solution)
    const handleSubmissionFailed = (data: any) => {
      setIsSubmittingDone(false);
      toast.error(data?.message || "Incomplete! Please complete your question first.", {
        id: "sub-failed-toast",
        icon: "⚠️",
      });
    };

    socket.off("invalidRoom");
    socket.off("roomUnauthorized");
    socket.off("submissionFailed");
    socket.on("invalidRoom", handleInvalidRoom);
    socket.on("roomUnauthorized", handleRoomUnauthorized);
    socket.on("submissionFailed", handleSubmissionFailed);

    // Initial match questions & server-authoritative endTime from server match start
    socket.on("battleStart", (payload: any) => {
      if (payload.questions && Array.isArray(payload.questions)) {
        setQuestionsList(payload.questions);
        setLoading(false);
      }
      const targetEndTime = payload.endTime || payload.contestEndTime;
      if (targetEndTime) {
        setMatchEndTime(targetEndTime);
      }
    });

    // Time synchronization from server
    socket.on("timeSync", (payload: any) => {
      const targetEndTime = payload.endTime || payload.contestEndTime;
      if (targetEndTime) {
        setMatchEndTime(targetEndTime);
      }
    });

    // Opponent progress update diff
    socket.on("opponentProgress", (data: any) => {
      setOpponent({
        senderId: data.userId,
        passCount: data.totalPassCount || 0,
        totalTests: 1,
        questionsSolved: data.questionsSolved || 0,
        totalQuestions: 1,
        isCompleted: data.isCompleted || false,
        name: data.username || "Opponent"
      });
    });

    // Match Ended Event (authoritative server outcome for matchEnded & battleEnded)
    const handleEndMatch = (payload: any) => {
      console.log("[Match Finalized]:", payload);
      setIsSubmittingDone(false);
      setWinner(payload.winnerName || null);

      const storedId = typeof window !== "undefined" ? localStorage.getItem("dsasaga_user_id") : null;
      const myUserId = (socket.auth as any)?.userId || storedId || currentUserId;
      const targetWinnerId = payload.winnerId || payload.winnerUserId;
      const isMe = Boolean(myUserId && targetWinnerId && myUserId === targetWinnerId);
      const isDraw = !targetWinnerId || payload.winnerName === 'Tie' || payload.rawReason === 'exact_tie' || payload.reason === 'draw' || payload.rawReason === 'double_disconnect';

      let outcomeType: 'win' | 'loss' | 'draw' = 'loss';
      if (isDraw) outcomeType = 'draw';
      else if (isMe) outcomeType = 'win';

      const stdReason = payload.reason || (payload.rawReason === 'opponent_forfeit' ? 'forfeit' : payload.rawReason === 'opponent_abandoned' ? 'timeout' : 'score');

      setMatchResult(outcomeType);
      setEndReason(stdReason);

      let msg = payload.message;
      if (!msg) {
        if (outcomeType === 'win') {
          msg = stdReason === 'forfeit' ? '🏆 VICTORY! Your opponent surrendered!' : stdReason === 'timeout' ? '🏆 VICTORY! Your opponent disconnected!' : '🏆 VICTORY! You completed the question first!';
        } else if (outcomeType === 'draw') {
          msg = '🤝 DRAW! The match ended in an exact tie!';
        } else {
          msg = stdReason === 'forfeit' ? '❌ DEFEAT! You surrendered the match.' : stdReason === 'timeout' ? '❌ DEFEAT! You were disconnected.' : `❌ DEFEAT! ${payload.winnerName || 'Opponent'} solved the question first!`;
        }
      }

      setMatchOutcome({
        type: outcomeType,
        reason: stdReason,
        message: msg,
        finalScores: payload.finalScores || payload.finalScoreboard
      });
    };

    socket.on("matchEnded", handleEndMatch);
    socket.on("battleEnded", handleEndMatch);

    // Reconnection Grace Period Handlers
    socket.on("opponentReconnecting", ({ username, gracePeriodSeconds, message }: any) => {
      setReconnectingNotification(message || `${username} lost connection. Reconnecting (${gracePeriodSeconds || 60}s)...`);
    });

    socket.on("opponentReconnected", ({ username, message }: any) => {
      setReconnectingNotification(null);
    });

    // Full match state recovery upon client reconnect / reload
    socket.on("battleStateRestore", (restorePayload: any) => {
      console.log("[State Restored]:", restorePayload);
      if (restorePayload.questions && Array.isArray(restorePayload.questions)) {
        setQuestionsList(restorePayload.questions);
        setLoading(false);
      }
      const targetEndTime = restorePayload.endTime || restorePayload.contestEndTime;
      if (targetEndTime) {
        setMatchEndTime(targetEndTime);
      }
      if (restorePayload.players) {
        const storedId = typeof window !== "undefined" ? localStorage.getItem("dsasaga_user_id") : null;
        const myUserId = (socket.auth as any)?.userId || storedId;
        const opp = restorePayload.players.find((p: any) => p.userId !== myUserId);
        if (opp) {
          setOpponent({
            senderId: opp.userId,
            passCount: opp.totalPassCount || 0,
            totalTests: 1,
            questionsSolved: opp.questionsSolved || 0,
            totalQuestions: 1,
            isCompleted: opp.questionsSolved >= 1,
            name: opp.username || "Opponent"
          });
        }
      }
    });

    return () => {
      socket.off("invalidRoom", handleInvalidRoom);
      socket.off("roomUnauthorized", handleRoomUnauthorized);
      socket.off("submissionFailed", handleSubmissionFailed);
      socket.off("battleStart");
      socket.off("timeSync");
      socket.off("opponentProgress");
      socket.off("matchEnded");
      socket.off("battleEnded");
      socket.off("opponentReconnecting");
      socket.off("opponentReconnected");
      socket.off("battleStateRestore");
    };
  }, [roomId, dataStructure, router, currentUserId]);

  const handleSurrender = useCallback(() => {
    socket.emit("leaveMatch", { roomId });
  }, [roomId]);

  // Done button handler: emits submitSolution for server evaluation
  const handleBattleDone = useCallback((payload: any) => {
    setIsSubmittingDone(true);
    socket.emit("submitSolution", {
      roomId,
      questionId: payload.questionId,
      code: payload.code,
      language: payload.language,
      passCount: payload.passCount,
      totalTests: payload.totalTests,
    });
  }, [roomId]);

  // Continuous auto-save & execution tracking
  const handleTestSubmit = useCallback((passed: number, total: number, questionsSolvedCount = 0, questionId = "q1", code = "") => {
    // 1. Send continuous state update to server
    socket.emit("autoSaveProgress", {
      roomId,
      questionId,
      passCount: passed,
      totalTests: total,
      code
    });

    // 2. Perform 6-stage transactional submission flow with idempotency key
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    socket.emit("submitCode", {
      roomId,
      submissionId,
      questionId,
      passCount: passed,
      totalTests: total,
      code
    });
  }, [roomId]);

  const handleTimeExpired = () => {
    // Timer is authoritative on server side, but client can request sync check
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Preparing 1v1 Race & Matching Opponent...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {reconnectingNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex justify-center w-full max-w-lg px-4">
          <div className="bg-amber-500 text-amber-950 font-semibold px-5 py-2.5 rounded-full text-xs sm:text-sm shadow-2xl border border-amber-400/80 flex items-center gap-2.5 animate-pulse whitespace-nowrap">
            <span className="text-base leading-none">⚠️</span>
            <span>{reconnectingNotification}</span>
          </div>
        </div>
      )}
      <QuestionPanelsClient
        questionsList={questionsList}
        dataStructure={dataStructure}
        battleMode={true}
        opponent={opponent}
        winner={winner}
        matchOutcome={matchOutcome}
        roomId={roomId}
        endTime={matchEndTime}
        onBattleSubmit={handleTestSubmit}
        onBattleDone={handleBattleDone}
        isSubmittingDone={isSubmittingDone}
        onTimeExpired={handleTimeExpired}
        onSurrender={handleSurrender}
      />
    </>
  );
}