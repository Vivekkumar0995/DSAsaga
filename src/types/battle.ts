export interface PlayerInfo {
    readonly id: string;
    readonly name: string;
}

export interface BattleStartPayload {
    readonly roomId: string;
    readonly topic?: string;
    readonly isCustom?: boolean;
    readonly players: PlayerInfo[];
}

export interface OpponentProgressPayload {
    readonly senderId: string;
    readonly passCount: number;
    readonly totalTests: number;
    readonly questionsSolved?: number;
    readonly totalQuestions?: number;
    readonly isCompleted: boolean;
    readonly name?: string;
}

export interface BattleEndedPayload {
    readonly winnerId: string;
    readonly winnerName: string;
    readonly reason?: string;
    readonly message?: string;
}

export interface OpponentDisconnectedPayload {
    readonly message: string;
    readonly winnerId: string;
    readonly winnerName?: string;
    readonly reason?: string;
}