export interface PlayerInfo {
    readonly id: string;
    readonly name: string;
}

export interface BattleStartPayload {
    readonly roomId: string;
    readonly topic?: string;
    readonly isCustom?: boolean;
    readonly contestStartTime?: number;
    readonly contestEndTime?: number;
    readonly endTime?: number;
    readonly questions?: any[];
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
    readonly winnerId?: string;
    readonly winnerUserId?: string;
    readonly winnerName?: string;
    readonly reason?: 'forfeit' | 'timeout' | 'score' | string;
    readonly rawReason?: string;
    readonly message?: string;
    readonly finalScores?: any[];
}

export type MatchEndedPayload = BattleEndedPayload;

export interface OpponentDisconnectedPayload {
    readonly message: string;
    readonly winnerId: string;
    readonly winnerName?: string;
    readonly reason?: string;
}

export interface OpponentReconnectingPayload {
    readonly userId: string;
    readonly username: string;
    readonly gracePeriodSeconds: number;
    readonly message: string;
}

export interface OpponentReconnectedPayload {
    readonly userId: string;
    readonly username: string;
    readonly message: string;
}