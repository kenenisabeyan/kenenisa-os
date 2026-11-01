import { prisma } from './lib/prisma.js';
import { IntelligenceService } from './domain/intelligence/intelligence.service.js';

async function verifyLiveAi() {
  console.log('=== KENENISA OS LIVE AI VERIFICATION ===');
  const service = new IntelligenceService();

  // 1. Get primary user
  const user = await prisma.user.findFirst({
    where: { email: 'beyankenenisa@gmail.com' },
  });

  if (!user) {
    console.error('❌ User not found');
    process.exit(1);
  }
  console.log(`✅ Testing with user: ${user.displayName || user.email} (ID: ${user.id})`);

  // Query 1: Blocker triage
  console.log('\n--- Test 1: Blocker Triage Query ---');
  const response1 = await service.chat(user.id, {
    message: 'What is currently blocking my projects? Give me a full breakdown of any blocked tasks and dependency chains.',
  });
  console.log('Provider:', (response1.message.metadata as any)?.provider);
  console.log('Canned text check ("I am the KENENISA OS Intelligence Core"):', 
    response1.message.content.includes('I am the KENENISA OS Intelligence Core') ? '❌ FAILED (Found canned text)' : '✅ PASSED (No canned text)'
  );
  console.log('Response preview:\n', response1.message.content.slice(0, 400));

  // Query 2: ASTU Graduation Readiness
  console.log('\n--- Test 2: ASTU Graduation Readiness Audit ---');
  const response2 = await service.chat(user.id, {
    message: 'Audit my ASTU graduation defense readiness. How many days remain, what are my projects, and what are my courses?',
  });
  console.log('Provider:', (response2.message.metadata as any)?.provider);
  console.log('Contains Graduation / ASTU context:', 
    response2.message.content.toLowerCase().includes('graduation') || response2.message.content.toLowerCase().includes('astu') ? '✅ PASSED' : '⚠️ Missing keyword'
  );
  console.log('Response preview:\n', response2.message.content.slice(0, 400));

  // Query 3: High Priority Tasks & Deadlines
  console.log('\n--- Test 3: Deadlines & Tasks Query ---');
  const response3 = await service.chat(user.id, {
    message: 'What are my upcoming deadlines and high priority tasks across all workstreams?',
  });
  console.log('Provider:', (response3.message.metadata as any)?.provider);
  console.log('Response preview:\n', response3.message.content.slice(0, 400));

  // Query 4: Structured Action Proposal
  console.log('\n--- Test 4: Task Creation Proposal ---');
  const response4 = await service.chat(user.id, {
    message: 'Please schedule and create a task called "Write Chapter 3 Performance Benchmarks" with high priority.',
  });
  console.log('Provider:', (response4.message.metadata as any)?.provider);
  console.log('Has proposal:', response4.proposal ? '✅ YES' : '❌ NO');
  if (response4.proposal) {
    console.log('Proposal details:', JSON.stringify(response4.proposal, null, 2));
  }
  console.log('Response preview:\n', response4.message.content.slice(0, 300));

  console.log('\n=== ALL VERIFICATION CHECKS COMPLETE ===');
  process.exit(0);
}

verifyLiveAi().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
