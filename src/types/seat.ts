export enum SeatType {
  EMPTY = "EMPTY",
  NORMAL = "NORMAL",
  VIP = "VIP",
  COUPLE = "COUPLE",
  DISABLED = "DISABLED",
  BLOCKED = "BLOCKED", // For pillars, walkways, etc.
}

export interface SeatPosition {
  row: number;
  col: number;
  type: SeatType;
  seatNumber?: string;
  extraPrice?: number;
  isCoupleSeat?: boolean;
  coupleWith?: number; // Column index of the paired seat for couple seats
}

export interface SeatLayout {
  rows: number;
  cols: number;
  seats: SeatPosition[][];
}

export interface RoomConfig {
  id?: string;
  name: string;
  cinemaId: string;
  seatLayout: SeatLayout;
  vipPrice: number;
  couplePrice: number;
  disabledPrice?: number;
}

export const SEAT_COLORS = {
  [SeatType.EMPTY]: "bg-gray-100 border-gray-200",
  [SeatType.NORMAL]: "bg-blue-500 hover:bg-blue-600 border-blue-600",
  [SeatType.VIP]: "bg-yellow-500 hover:bg-yellow-600 border-yellow-600",
  [SeatType.COUPLE]: "bg-pink-500 hover:bg-pink-600 border-pink-600",
  [SeatType.DISABLED]: "bg-green-500 hover:bg-green-600 border-green-600",
  [SeatType.BLOCKED]: "bg-gray-800 hover:bg-gray-900 border-gray-900",
};

export const SEAT_LABELS = {
  [SeatType.EMPTY]: "Empty",
  [SeatType.NORMAL]: "Normal Seat",
  [SeatType.VIP]: "VIP Seat",
  [SeatType.COUPLE]: "Couple Seat",
  [SeatType.DISABLED]: "Disabled Access",
  [SeatType.BLOCKED]: "Blocked/Pillar",
};
