export const BOARD_SIZE = 9; // Kích thước bàn cờ (9x9)
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE; // Tổng số ô (81)
export const INITIAL_BALLS = 5; // Số bóng ban đầu
export const NEW_BALLS_PER_TURN = 3; // Số bóng mới mỗi lượt
export const MIN_LINE_TO_CLEAR = 5; // Số bóng tối thiểu để nổ
export const BALL_COLORS = ["R", "G", "B", "Y", "P", "C", "M"]; // Các màu bóng

// Map màu bóng từ ký tự sang màu Tailwind CSS để sử dụng dễ dàng hơn
export const TAILWIND_BALL_COLOR_MAP: { [key: string]: string } = {
  R: "bg-red-500",
  G: "bg-green-500",
  B: "bg-blue-500",
  Y: "bg-yellow-500",
  P: "bg-purple-500",
  C: "bg-cyan-500",
  M: "bg-pink-500",
};
