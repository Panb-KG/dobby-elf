import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://mofakezhuo.com';

// 辅助函数：等待并点击
test.describe('🎯 全面功能测试', () => {
  
  test.describe('📱 页面加载与布局', () => {
    test('首页完整加载', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 验证核心元素
      await expect(page.locator('text=多比').first()).toBeVisible();
      await expect(page.locator('text=呼啦啦').first()).toBeVisible();
      
      // 截图
      await page.screenshot({ path: 'test-results/full-01-homepage.png', fullPage: true });
      console.log('✅ 首页加载成功');
    });

    test('左侧咒语栏按钮', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      const spells = ['课程表', '作业', '学单词', '互动练习', '魔法专注', '成就墙'];
      
      for (const spell of spells) {
        const button = page.locator(`button:has-text("${spell}")`).first();
        const count = await button.count();
        console.log(`   ${spell}: ${count > 0 ? '✓' : '✗'}`);
      }
      
      await page.screenshot({ path: 'test-results/full-02-spells.png' });
      console.log('✅ 咒语按钮检查完成');
    });

    test('聊天输入区域', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 输入框
      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible();
      
      // 发送按钮
      const sendButton = page.locator('button').filter({ has: page.locator('svg') }).last();
      await expect(sendButton).toBeVisible();
      
      // 附件按钮
      const attachButton = page.locator('button svg[class*="paperclip"]').first();
      const micButton = page.locator('button svg[class*="mic"]').first();
      
      console.log(`   附件按钮: ${await attachButton.count() > 0 ? '✓' : '✗'}`);
      console.log(`   语音按钮: ${await micButton.count() > 0 ? '✓' : '✗'}`);
      
      await page.screenshot({ path: 'test-results/full-03-input-area.png' });
      console.log('✅ 输入区域检查完成');
    });
  });

  test.describe('👤 用户认证', () => {
    const testUser = {
      username: `user_${Date.now()}`,
      password: 'testpass123'
    };

    test('用户注册流程', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 点击用户图标
      const userButton = page.locator('button svg[class*="user"]').first();
      await userButton.click();
      await page.waitForTimeout(1000);
      
      // 切换到注册
      const registerTab = page.locator('text=注册').first();
      if (await registerTab.isVisible().catch(() => false)) {
        await registerTab.click();
        await page.waitForTimeout(500);
      }
      
      // 填写表单
      const inputs = page.locator('input');
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill(testUser.username);
        await inputs.nth(1).fill(testUser.password);
        if (await inputs.count() >= 3) {
          await inputs.nth(2).fill(testUser.password);
        }
      }
      
      await page.screenshot({ path: 'test-results/full-04-register-form.png' });
      console.log('✅ 注册表单填写完成');
    });

    test('用户登录流程', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 点击用户图标
      const userButton = page.locator('button svg[class*="user"]').first();
      await userButton.click();
      await page.waitForTimeout(1000);
      
      // 填写登录表单
      const inputs = page.locator('input');
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill(testUser.username);
        await inputs.nth(1).fill(testUser.password);
      }
      
      await page.screenshot({ path: 'test-results/full-05-login-form.png' });
      console.log('✅ 登录表单填写完成');
    });
  });

  test.describe('💬 聊天功能', () => {
    test('发送文本消息', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 找到输入框并输入
      const textarea = page.locator('textarea').first();
      await textarea.fill('你好，多比！');
      await page.waitForTimeout(500);
      
      // 点击发送
      const buttons = page.locator('button');
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        const svg = button.locator('svg');
        if (await svg.count() > 0) {
          const svgClass = await svg.getAttribute('class');
          if (svgClass?.includes('send')) {
            await button.click();
            break;
          }
        }
      }
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/full-06-chat-message.png' });
      console.log('✅ 消息发送完成');
    });

    test('使用快捷咒语 - 课程表', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 点击课程表按钮
      const scheduleButton = page.locator('button:has-text("课程表")').first();
      await scheduleButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/full-07-schedule.png' });
      console.log('✅ 课程表咒语点击完成');
    });

    test('使用快捷咒语 - 成就墙', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 点击成就墙按钮
      const achievementButton = page.locator('button:has-text("成就墙")').first();
      await achievementButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/full-08-achievements.png' });
      console.log('✅ 成就墙咒语点击完成');
    });

    test('使用快捷咒语 - 魔法专注', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 点击魔法专注按钮
      const focusButton = page.locator('button:has-text("魔法专注")').first();
      await focusButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'test-results/full-09-focus.png' });
      console.log('✅ 魔法专注咒语点击完成');
    });
  });

  test.describe('📅 右侧展示窗功能', () => {
    test('课程表展示窗 - 周视图', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 打开课程表
      await page.locator('button:has-text("课程表")').first().click();
      await page.waitForTimeout(2000);
      
      // 检查周视图按钮
      const weekButton = page.locator('button:has-text("周")').first();
      if (await weekButton.isVisible().catch(() => false)) {
        await weekButton.click();
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ path: 'test-results/full-10-week-view.png' });
      console.log('✅ 周视图检查完成');
    });

    test('课程表展示窗 - 日视图', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 打开课程表
      await page.locator('button:has-text("课程表")').first().click();
      await page.waitForTimeout(2000);
      
      // 切换到日视图
      const dayButton = page.locator('button:has-text("日")').first();
      if (await dayButton.isVisible().catch(() => false)) {
        await dayButton.click();
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ path: 'test-results/full-11-day-view.png' });
      console.log('✅ 日视图检查完成');
    });

    test('关闭展示窗', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      // 打开然后关闭
      await page.locator('button:has-text("课程表")').first().click();
      await page.waitForTimeout(2000);
      
      // 找关闭按钮
      const closeButton = page.locator('button svg[class*="x"], button svg[class*="X"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 展示窗关闭成功');
      }
      
      await page.screenshot({ path: 'test-results/full-12-closed-sidebar.png' });
    });
  });

  test.describe('🔧 API 功能测试', () => {
    test('用户注册API', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/register`, {
        data: {
          username: `apitest_${Date.now()}`,
          password: 'test123'
        }
      });
      
      console.log(`   状态码: ${response.status()}`);
      expect([200, 201, 409]).toContain(response.status());
    });

    test('用户登录API', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          username: 'testuser',
          password: 'testpass'
        }
      });
      
      console.log(`   状态码: ${response.status()}`);
      expect([200, 401]).toContain(response.status());
    });

    test('课程查询API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/courses?userId=test123`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      console.log(`   返回课程数: ${Array.isArray(data) ? data.length : 'N/A'}`);
    });

    test('成就查询API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/achievements?userId=test123`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      console.log(`   返回成就数: ${Array.isArray(data) ? data.length : 'N/A'}`);
    });

    test('用户数据API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users?userId=test123`);
      expect(response.status()).toBe(200);
    });

    test('知识点API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/knowledge?userId=test123`);
      expect(response.status()).toBe(200);
    });
  });

  test.describe('📱 响应式测试', () => {
    test('桌面端视图 (1280x720)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'test-results/full-13-desktop.png' });
      console.log('✅ 桌面端视图测试完成');
    });

    test('平板端视图 (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'test-results/full-14-tablet.png' });
      console.log('✅ 平板端视图测试完成');
    });

    test('移动端视图 (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'test-results/full-15-mobile.png' });
      console.log('✅ 移动端视图测试完成');
    });
  });
});
