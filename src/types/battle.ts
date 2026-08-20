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
    readonly isCompleted: boolean;
}

export interface BattleEndedPayload {
    readonly winnerId: string;
    readonly winnerName: string;
}

export interface OpponentDisconnectedPayload {
    readonly message: string;
    readonly winnerId: string;
}