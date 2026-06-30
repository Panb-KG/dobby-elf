/**
 * 登录/注册页面共享常量和工具函数
 */

export const CHILD_AVATARS = [
  { emoji: '🧙‍♂️', name: '小魔法师' },
  { emoji: '🦊', name: '小狐狸' },
  { emoji: '🐱', name: '小猫头鹰' },
  { emoji: '🐰', name: '小兔子' },
  { emoji: '🐼', name: '小熊猫' },
  { emoji: '🦁', name: '小狮子' },
  { emoji: '🐸', name: '小青蛙' },
  { emoji: '🐧', name: '小企鹅' },
];

export const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];

export function checkPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 4) score++;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: '弱弱哒...', color: 'text-red-400' };
  if (score <= 4) return { score, label: '还可以哦！', color: 'text-amber-400' };
  return { score, label: '超强魔法密码！', color: 'text-emerald-400' };
}
