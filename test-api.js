import fetch from 'node-fetch';

async function testChatAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          text: 'hello'
        }],
        systemInstruction: 'You are a helpful assistant.'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const text = await response.text();
    console.log('Response text:', text);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testChatAPI();