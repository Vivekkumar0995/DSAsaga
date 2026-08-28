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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 font-sans">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-slate-900 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Invite a Friend</h3>
                    <p className="text-slate-500 text-xs mt-1">
                        Share this code or direct link with your friend to start a real-time 1v1 battle.
                    </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl flex items-center justify-between border border-slate-200">
                    <span className="font-mono text-xl text-teal-600 font-extrabold tracking-wider">{inviteCode}</span>
                    <button
                        onClick={handleCopy}
                        className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3.5 py-2 rounded-lg font-semibold transition-all shadow-xs cursor-pointer"
                    >
                        {copied ? 'Copied Link!' : 'Copy Link'}
                    </button>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}