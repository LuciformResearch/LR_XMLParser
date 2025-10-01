import { describe, it, expect } from 'vitest';
import { LuciformXMLParser } from '../index';

describe('Namespaces', () => {
  it('resolves default and prefixed namespaces and hides xmlns from attributes', () => {
    const xml = '<root xmlns="urn:default" xmlns:foo="urn:foo"><foo:bar x="1" xmlns:baz="urn:baz"/></root>';
    const res = new LuciformXMLParser(xml).parse();
    expect(res.success).toBe(true);
    // Attributes present and do not include xmlns declarations
    const root = res.document?.root!;
    expect(root.attributes.has('xmlns')).toBe(false);
    expect([...root.attributes.keys()].some(k => k.startsWith('xmlns:'))).toBe(false);
  });

  it('diagnoses unbound prefix', () => {
    const xml = '<root><a:b/></root>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('UNDEFINED_PREFIX');
  });

  it('rejects bad QName with multiple colons', () => {
    const xml = '<root><a:b:c/></root>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('BAD_QNAME');
  });

  it('rejects xmlns element name usage', () => {
    const xml = '<xmlns:test/>';
    const res = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
    const codes = res.diagnostics.map(d => d.code);
    expect(codes).toContain('XMLNS_PREFIX_RESERVED');
  });
});
