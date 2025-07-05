// src/line98/types.ts
// Đại diện cho một ô trên bàn cờ, có thể là màu bóng hoặc trống ('-')
export type BoardCell = string;

// Đại diện cho trạng thái bàn cờ dưới dạng mảng 1 chiều
export type GameBoard = BoardCell[];

// Đại diện cho một đường đi tìm được (mảng các chỉ số vị trí)
export type Path = number[];

// Kết quả của hàm gợi ý di chuyển
export interface HintMove {
  from: number;
  to: number;
  score: number; // Ưu tiên di chuyển nổ dãy (điểm cao hơn)
  type: 'clear' | 'potential_line' | 'movable'; // Loại gợi ý
}
