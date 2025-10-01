import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('Permissive mode recovery', () => {
  it('produces a document even when malformed', () => {
    const xml = '<root><child>x';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    expect(res.document).toBeDefined();
    expect(res.diagnostics.length).toBeGreaterThanOrEqual(0);
  });
});

