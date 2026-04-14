export interface Booking {
  id?: string;
  dateTime: string;
  courtName: string;
  player1Id: string;
  player2Id?: string;
  isFull?: boolean;
}