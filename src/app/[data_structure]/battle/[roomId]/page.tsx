// src/app/[data_structure]/battle/[roomId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { socket } from '@/lib/socket';
// FIX 1: Import the correctly named type from your types file
import { OpponentProgressPayload } from '@/types/battle';

export default function BattleArena() {
    const params = useParams();
    // FIX 3: Force roomId to be a string (handles Next.js array types)
    const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;

    // FIX 1 applied to the generic type
    const [opponent, setOpponent] = useState<OpponentProgressPayload>({
        senderId: '',
        passCount: 0,
        totalTests: 5,
        isCompleted: false,
    });
    const [winner, setWinner] = useState<string | null>(null);

    useEffect(() => {
        socket.connect();

        // Use the correct type here
        socket.on('opponentProgress', (data: OpponentProgressPayload) => {
            setOpponent(data);
        });

        socket.on('battleEnded', ({ winnerName }: { winnerName: string }) => {
            setWinner(winnerName);
        });

        return () => {
            socket.off('opponentProgress');
            socket.off('battleEnded');
            socket.disconnect(); // Good practice to disconnect when leaving the page
        };
    }, []);

    const handleTestSubmit = (passed: number, total: number) => {
        const isCompleted = passed === total;
        socket.emit('submitAttempt', {
            roomId,
            passCount: passed,
            totalTests: total,
            isCompleted,
        });
    };

    // FIX 2: Safely calculate percentage to prevent NaN% crashes
    const progressPercentage = opponent.totalTests > 0
        ? (opponent.passCount / opponent.totalTests) * 100
        : 0;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Editor Side */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-4">Your Code Editor</h2>
                    <p className="text-gray-400 text-sm">Room ID: <span className="font-mono text-yellow-400">{roomId}</span></p>
                </div>

                {winner ? (
                    <div className="bg-emerald-900/50 border border-emerald-500 p-4 rounded-lg text-center font-bold text-lg text-emerald-300">
                        🏆 Winner: {winner}!
                    </div>
                ) : (
                    <button
                        onClick={() => handleTestSubmit(5, 5)}
                        className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold transition mt-6"
                    >
                        Simulate Full Submit (5/5 Tests Passed)
                    </button>
                )}
            </div>

            {/* Opponent Real-time Tracker */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
                <h2 className="text-xl font-bold">Live Opponent Status</h2>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Tests Passed</span>
                        <span className="font-mono text-blue-400">{opponent.passCount} / {opponent.totalTests}</span>
                    </div>

                    <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }} // FIX 2 applied here
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}