import { test, expect } from '@playwright/test';

test('测试魔法小课桌界面功能', async ({ page }) => {
  // 导航到应用
  await page.goto('http://localhost:3000');
  
  // 测试页面加载
  await expect(page).toHaveTitle('魔法小课桌 - 多比学习助手');
  
  // 等待页面加载完成
  await page.waitForLoadState('networkidle');
  
  // 测试左侧栏点击功能
  // 点击课程表
  await page.click('text=课程表');
  await page.waitForTimeout(1000);
  
  // 点击作业
  await page.click('text=作业');
  await page.waitForTimeout(1000);
  
  // 点击学单词
  await page.click('text=学单词');
  await page.waitForTimeout(1000);
  
  // 点击互动练习
  await page.click('text=互动练习');
  await page.waitForTimeout(1000);
  
  // 点击魔法专注
  await page.click('text=魔法专注');
  await page.waitForTimeout(1000);
  
  // 点击成就墙
  await page.click('text=成就墙');
  await page.waitForTimeout(1000);
  
  // 测试对话功能
  // 等待聊天输入框出现
  await page.waitForSelector('textarea');
  
  // 输入消息
  await page.fill('textarea', '你好，多比！');
  
  // 发送消息
  await page.click('div.relative.group > button:last-child'); // 发送按钮是输入区域的最后一个按钮
  
  // 等待回复
  await page.waitForTimeout(3000);
  
  // 验证回复是否出现
  const messages = await page.locator('.markdown-body').count();
  expect(messages).toBeGreaterThan(0);
  
  // 测试作业上传功能
  // 点击作业
  await page.click('text=作业');
  
  // 直接定位作业上传区域，不等待可见
  const uploadArea = await page.locator('#homework-upload');
  // 验证上传区域存在
  expect(await uploadArea.count()).toBeGreaterThan(0);
});
