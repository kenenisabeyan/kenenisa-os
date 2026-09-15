export class IntelligenceSafetyService {
  private injectionPatterns = [
    /ignore (all )?previous instructions/i,
    /override (the )?system/i,
    /reveal (the )?(api key|secret|password|hash)/i,
    /drop table/i,
    /select \* from users/i,
    /system prompt/i,
  ];

  sanitizeInput(text: string): { cleanText: string; isInjectionAttempt: boolean } {
    let isInjectionAttempt = false;

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(text)) {
        isInjectionAttempt = true;
        break;
      }
    }

    // Treat injected instructions strictly as text content rather than prompt instructions
    // eslint-disable-next-line no-control-regex
    const cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();

    return { cleanText, isInjectionAttempt };
  }

  validateUserScope(sessionUserId: string, targetUserId?: string): void {
    if (targetUserId && sessionUserId !== targetUserId) {
      throw new Error('IDOR Security Violation: Session user does not match target user scope.');
    }
  }
}
