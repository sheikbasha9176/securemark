const reg = /\r\n|[\x00-\x08\x0B-\x1F\x7F]/g;

export function normalize(source: string): string {
  return source.replace(reg, char => {
    assert(!source.match(/^[\n\t]$/));
    switch (char) {
      case '\r':
      case '\v':
      case '\f':
      case '\r\n':
        return '\n';
      default:
        return '';
    }
  });
}
