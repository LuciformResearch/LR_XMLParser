import { describe, it, expect } from 'vitest';
import { DiagnosticManager, XML_ERROR_CODES } from '../diagnostics';

describe('DiagnosticManager', () => {
  it('tracks errors, warnings and recovery count', () => {
    const d = new DiagnosticManager();
    d.addError(XML_ERROR_CODES.UNCLOSED_TAG, 'x');
    d.addWarning(XML_ERROR_CODES.INVALID_COMMENT, 'y');
    d.incrementRecovery();
    expect(d.getErrors().length).toBe(1);
    expect(d.getWarnings().length).toBe(1);
    expect(d.getRecoveryCount()).toBe(1);
  });
});

