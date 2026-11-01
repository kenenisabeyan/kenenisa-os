async function run() {
  console.log('--- 1. Logging into KENENISA OS API ---');
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'beyankenenisa@gmail.com',
      password: 'kenenisa@077215',
    }),
  });

  const cookieHeader = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('Login Response:', { success: loginData.success, user: loginData.data?.user?.email });

  if (!loginData.success) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }

  // Extract auth token or cookie
  const headers = {
    'Content-Type': 'application/json',
  };
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader.split(';')[0];
  }
  if (loginData.data?.token) {
    headers['Authorization'] = `Bearer ${loginData.data.token}`;
  }

  async function sendChat(label, message, pageContext) {
    console.log(`\n========================================`);
    console.log(`--- Test: ${label} ---`);
    console.log(`Prompt: "${message}"`);
    const t0 = Date.now();
    const chatRes = await fetch('http://localhost:3000/api/v1/intelligence/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, pageContext }),
    });

    const elapsed = Date.now() - t0;
    const chatData = await chatRes.json();

    if (!chatData.success) {
      console.error(`❌ Chat failed (${chatRes.status}):`, chatData);
      return;
    }

    const payload = chatData.data;
    console.log(`✅ Success in ${elapsed}ms`);
    console.log(`Provider:`, payload.message?.metadata?.provider || 'Unknown');
    console.log(`Canned text check:`, payload.message?.content?.includes('I am the KENENISA OS Intelligence Core') ? '❌ FAILED' : '✅ PASSED');
    console.log(`Has Action Proposal:`, payload.proposal ? `Yes (${payload.proposal.actionType})` : 'None');
    console.log(`Response Preview:\n${payload.message?.content?.slice(0, 500)}...\n`);
  }

  // 1. Blocker triage
  await sendChat(
    'Blocker Analysis',
    'What is currently blocking my graduation project and other tasks? Give me a full dependency breakdown.',
  );

  // 2. Graduation Readiness
  await sendChat(
    'Graduation Defense Readiness',
    'Audit my ASTU graduation defense readiness. How many days remain and what is my progress?',
  );

  // 3. Project inspection
  await sendChat(
    'Project Deep Dive',
    'Explain the status of Individual Graduation Project and what milestones remain.',
  );

  // 4. Action proposal
  await sendChat(
    'Action Proposal Creation',
    'Please schedule and create a task called "Write Chapter 3 Performance Benchmarks" with high priority.',
  );

  console.log('\n========================================');
  console.log('🎉 ALL HTTP INTELLIGENCE INTEGRATION CHECKS COMPLETE!');
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
