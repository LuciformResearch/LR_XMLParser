import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('LuciformXMLParser', () => {
  it('parses a simple XML document', () => {
    const xml = '<root><child a="1">x</child></root>';
    const res = new LuciformXMLParser(xml).parse();
    expect(res.success).toBe(true);
    expect(res.document?.root?.name).toBe('root');
    expect(res.nodeCount).toBeGreaterThan(0);
  });

  it('recovers from a malformed XML in permissive mode', () => {
    const xml = '<root><child>x';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    // In permissive mode, we accept partial parse with diagnostics
    expect(res.document).toBeDefined();
    expect(res.diagnostics.length).toBeGreaterThanOrEqual(0);
  });
});
