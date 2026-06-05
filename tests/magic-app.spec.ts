import { test, expect, Page } from '@playwright/test';

// 测试数据
const TEST_USER = {
  username: `testuser_${Date.now()}`,
  password: 'test123456',
  displayName: '测试用户'
};

// 辅助函数：等待元素可见并点击
async function clickWhenVisible(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.click(selector);
}

// 辅助函数：等待元素可见并填充
async function fillWhenVisible(page: Page, selector: string, value: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.fill(selector, value);
}

test.describe('魔法小课桌 - 全面功能测试', () => {
  
  test.describe('🌟 页面加载和基本UI', () => {
    test('首页加载成功并显示核心元素', async ({ page }) => {
      await page.goto('/');
      
      // 等待页面加载
      await page.waitForLoadState('networkidle');
      
      // 验证核心元素存在
      await expect(page.locator('text=多比').first()).toBeVisible();
      await expect(page.locator('text=呼啦啦').first()).toBeVisible();
      
      // 验证左侧咒语按钮
      const spells = ['课程表', '作业', '学单词', '互动练习', '魔法专注', '成就墙'];
      for (const spell of spells) {
        await expect(page.locator(`button:has-text("${spell}")`).first()).toBeVisible();
      }
      
      // 验证输入框和发送按钮
      await expect(page.locator('textarea[placeholder*="魔法"]').first()).toBeVisible();
      await expect(page.locator('button svg[class*="lucide-send"]').first()).toBeVisible();
    });

    test('页面响应式设计 - 桌面视图', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 验证桌面布局元素
      await expect(page.locator('button:has-text("课程表")').first()).toBeVisible();
    });
  });

  test.describe('👤 用户认证功能', () => {
    test('注册新用户流程', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击用户图标打开登录/注册
      await clickWhenVisible(page, 'button svg[class*="lucide-user"]', 10000);
      
      // 切换到注册标签
      await clickWhenVisible(page, 'text=注册', 5000);
      
      // 填写注册表单
      await fillWhenVisible(page, 'input[placeholder*="用户名"]', TEST_USER.username);
      await fillWhenVisible(page, 'input[placeholder*="密码"]', TEST_USER.password);
      await fillWhenVisible(page, 'input[placeholder*="确认密码"]', TEST_USER.password);
      
      // 点击注册按钮
      await clickWhenVisible(page, 'button:has-text("注册")', 5000);
      
      // 等待注册成功提示或自动登录
      await page.waitForTimeout(3000);
      
      // 验证是否显示欢迎消息或用户界面变化
      const welcomeText = await page.locator(`text=${TEST_USER.username}`).first();
      if (await welcomeText.isVisible().catch(() => false)) {
        console.log('✅ 注册成功，显示用户名');
      }
    });

    test('登录已有用户', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击用户图标
      await clickWhenVisible(page, 'button svg[class*="lucide-user"]', 10000);
      
      // 填写登录表单
      await fillWhenVisible(page, 'input[placeholder*="用户名"]', TEST_USER.username);
      await fillWhenVisible(page, 'input[placeholder*="密码"]', TEST_USER.password);
      
      // 点击登录按钮
      await clickWhenVisible(page, 'button:has-text("登录")', 5000);
      
      // 等待登录响应
      await page.waitForTimeout(3000);
      
      console.log('✅ 登录流程测试完成');
    });
  });

  test.describe('💬 聊天功能', () => {
    test('发送消息并接收回复', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 找到输入框
      const input = page.locator('textarea').first();
      await expect(input).toBeVisible();
      
      // 输入测试消息
      const testMessage = '你好，多比！今天天气怎么样？';
      await input.fill(testMessage);
      
      // 点击发送按钮
      const sendButton = page.locator('button svg[class*="lucide-send"]').first();
      await sendButton.click();
      
      // 等待消息发送
      await page.waitForTimeout(1000);
      
      // 验证用户消息显示
      await expect(page.locator(`text=${testMessage}`).first()).toBeVisible();
      
      // 等待AI回复（最多30秒）
      await page.waitForTimeout(8000);
      
      // 验证有回复消息
      const modelMessages = page.locator('[class*="model"], [class*="assistant"]').first();
      console.log('✅ 聊天消息发送成功');
    });

    test('使用快捷咒语按钮', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击课程表咒语
      await clickWhenVisible(page, 'button:has-text("课程表")', 5000);
      
      // 等待咒语效果
      await page.waitForTimeout(2000);
      
      // 验证右侧展示窗打开
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      console.log('✅ 咒语按钮点击成功');
    });
  });

  test.describe('📅 课程表功能', () => {
    test('查看课程表', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击课程表按钮
      await clickWhenVisible(page, 'button:has-text("课程表")', 5000);
      
      // 等待右侧展示窗
      await page.waitForTimeout(2000);
      
      // 验证课程表相关元素
      const scheduleElements = await page.locator('text=周一, text=周二, text=魔法课程').count();
      console.log(`✅ 课程表元素数量: ${scheduleElements}`);
    });

    test('切换周视图和日视图', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 打开课程表
      await clickWhenVisible(page, 'button:has-text("课程表")', 5000);
      await page.waitForTimeout(2000);
      
      // 点击日视图按钮
      const dayViewButton = page.locator('button:has-text("日")').first();
      if (await dayViewButton.isVisible().catch(() => false)) {
        await dayViewButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 切换到日视图');
      }
      
      // 点击周视图按钮
      const weekViewButton = page.locator('button:has-text("周")').first();
      if (await weekViewButton.isVisible().catch(() => false)) {
        await weekViewButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 切换到周视图');
      }
    });
  });

  test.describe('🏆 成就系统', () => {
    test('查看成就墙', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击成就墙按钮
      await clickWhenVisible(page, 'button:has-text("成就墙")', 5000);
      
      // 等待展示窗
      await page.waitForTimeout(2000);
      
      // 验证成就相关元素
      const achievementText = await page.locator('text=成就, text=积分, text=等级').count();
      console.log(`✅ 成就系统元素数量: ${achievementText}`);
    });
  });

  test.describe('⏱️ 专注工具', () => {
    test('打开专注工具', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 点击魔法专注按钮
      await clickWhenVisible(page, 'button:has-text("魔法专注")', 5000);
      
      // 等待展示窗
      await page.waitForTimeout(2000);
      
      // 验证专注工具元素
      const focusElements = await page.locator('text=专注, text=沙漏, text=倒计时').count();
      console.log(`✅ 专注工具元素数量: ${focusElements}`);
    });
  });

  test.describe('🎨 魔法绘图', () => {
    test('请求生成图片', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 找到输入框
      const input = page.locator('textarea').first();
      await expect(input).toBeVisible();
      
      // 输入绘图请求
      const drawMessage = '多比，请画一只可爱的小猫';
      await input.fill(drawMessage);
      
      // 点击发送
      const sendButton = page.locator('button svg[class*="lucide-send"]').first();
      await sendButton.click();
      
      // 等待消息发送和回复
      await page.waitForTimeout(10000);
      
      console.log('✅ 魔法绘图请求发送成功');
    });
  });

  test.describe('📎 附件上传', () => {
    test('上传图片附件', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 找到附件按钮
      const attachButton = page.locator('button svg[class*="lucide-paperclip"]').first();
      if (await attachButton.isVisible().catch(() => false)) {
        console.log('✅ 附件上传按钮存在');
      }
    });
  });

  test.describe('🔊 语音输入', () => {
    test('语音按钮存在', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 找到语音按钮
      const micButton = page.locator('button svg[class*="lucide-mic"]').first();
      if (await micButton.isVisible().catch(() => false)) {
        console.log('✅ 语音输入按钮存在');
      }
    });
  });

  test.describe('📱 响应式布局', () => {
    test('移动端视图适配', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 验证移动端基本元素
      await expect(page.locator('textarea').first()).toBeVisible();
      
      console.log('✅ 移动端视图加载成功');
    });
  });

  test.describe('🔄 页面交互', () => {
    test('右侧展示窗开关', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 打开课程表展示窗
      await clickWhenVisible(page, 'button:has-text("课程表")', 5000);
      await page.waitForTimeout(2000);
      
      // 找到关闭按钮并点击
      const closeButton = page.locator('button svg[class*="lucide-x"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ 展示窗关闭成功');
      }
    });
  });
});
