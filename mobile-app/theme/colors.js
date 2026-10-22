/**
 * Design System Theme Colors - NTRevo Premium Dark Mode
 * Theo đặc tả NTRevo UX/UI Designer Skill:
 * - Background Deep: #09090B
 * - Card Surface: #18181B (Glassmorphic)
 * - Brand Accent: Flame Orange #FF4500
 * - Biometric Tech Accent: Neon Cyan #00F0FF
 * - Recovery Emerald: #10B981
 */
export const colors = {
  // Nền chính
  background: '#09090B',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  surfaceGlass: 'rgba(24, 24, 27, 0.85)',
  
  // Màu nhấn thương hiệu (Flame Orange)
  primary: '#FF4500',
  primaryDark: '#CC3700',
  primaryLight: 'rgba(255, 69, 0, 0.15)',
  primaryGlow: 'rgba(255, 69, 0, 0.3)',

  // Màu năng lượng công nghệ & sinh trắc học (Neon Cyan)
  secondary: '#00F0FF',
  secondaryLight: 'rgba(0, 240, 255, 0.15)',
  secondaryGlow: 'rgba(0, 240, 255, 0.25)',

  // Đường viền thẻ
  border: '#27272A',
  borderLight: '#3F3F46',
  borderHighlight: 'rgba(255, 69, 0, 0.4)',

  // Chữ & Biểu tượng
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textDark: '#09090B',

  // Trạng thái (Status Indicators)
  success: '#10B981', // Emerald - Phục hồi tối ưu
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B', // Amber - Điều chỉnh cường độ
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#EF4444',   // Rose - Cảnh báo quá tải
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  purple: '#A855F7',  // Active Recovery
  purpleLight: 'rgba(168, 85, 247, 0.15)',

  // Dành riêng cho Admin
  adminBackground: '#09090B',
  adminSurface: '#18181B',
  adminText: '#FAFAFA',
  adminBorder: '#27272A',
};

export default colors;
