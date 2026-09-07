/** オープンリダイレクト防止。相対パスのみ許可する */
export function safeInternalPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return fallback
  }
  return path
}
