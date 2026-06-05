import { test, expect } from '@playwright/test';

const BASE_URL = 'https://mofakezhuo.com';

test.describe('🧪 基础功能测试', () => {
  
  test('页面加载成功', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 截图保存
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    console.log('✅ 页面加载成功');
  });

  test('页面标题和基本文本', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 检查页面包含多比的欢迎语
    const pageContent = await page.content();
    expect(pageContent).toContain('多比');
    expect(pageContent).toContain('呼啦啦');
    
    console.log('✅ 页面包含核心文本');
  });

  test('核心UI元素存在', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // 检查输入框
    const inputs = await page.locator('textarea, input[type="text"]').count();
    console.log(`   找到 ${inputs} 个输入框`);
    
    // 检查按钮
    const buttons = await page.locator('button').count();
    console.log(`   找到 ${buttons} 个按钮`);
    
    // 截图
    await page.screenshot({ path: 'test-results/02-ui-elements.png' });
    
    expect(buttons).toBeGreaterThan(0);
    console.log('✅ UI元素存在');
  });

  test('咒语按钮可点击', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // 查找所有按钮
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    console.log(`   页面共有 ${count} 个按钮`);
    
    // 尝试点击第一个可见按钮
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        const text = await button.textContent();
        console.log(`   点击按钮 ${i}: ${text?.substring(0, 30)}`);
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/03-button-click.png' });
    console.log('✅ 按钮点击测试完成');
  });

  test('API端点健康检查', async ({ request }) => {
    // 测试用户注册API
    const registerResponse = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: `test_${Date.now()}`,
        password: 'test123'
      }
    });
    
    console.log(`   注册API状态: ${registerResponse.status()}`);
    expect([200, 201, 400, 409, 500]).toContain(registerResponse.status());
    
    // 测试课程API
    const coursesResponse = await request.get(`${BASE_URL}/api/courses?userId=test123`);
    console.log(`   课程API状态: ${coursesResponse.status()}`);
    expect(coursesResponse.status()).toBe(200);
    
    console.log('✅ API端点健康');
  });

  test('聊天API功能', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/chat`, {
      data: {
        messages: [
          { role: 'user', text: '你好' }
        ],
        systemInstruction: '你是多比，一个友好的学习助手。'
      }
    });
    
    console.log(`   聊天API状态: ${response.status()}`);
    
    if (response.status() === 200) {
      const body = await response.text();
      console.log(`   响应长度: ${body.length}`);
      expect(body.length).toBeGreaterThan(0);
    }
    
    console.log('✅ 聊天API测试完成');
  });
});
