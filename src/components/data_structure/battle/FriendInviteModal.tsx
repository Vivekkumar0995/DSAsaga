// src/components/battle/FriendInviteModal.tsx
"use client";

import { useState } from 'react';

interface Props {
    inviteCode: string;
    onClose: () => void;
}

export default function FriendInviteModal({ inviteCode, onClose }: Props) {
    const [copied, setCopied] = useState(false);

    const inviteLink = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?code=${inviteCode}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full text-white">
                <h3 className="text-xl font-bold mb-2">Invite a Friend</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Share this code or link with your friend to start a 1v1 battle.
                </p>

                <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-between mb-4 border border-gray-700">
                    <span className="font-mono text-xl text-yellow-400 font-bold">{inviteCode}</span>
                    <button
                        onClick={handleCopy}
                        className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-2 rounded font-semibold transition"
                    >
                        {copied ? 'Copied Link!' : 'Copy Link'}
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-sm font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}