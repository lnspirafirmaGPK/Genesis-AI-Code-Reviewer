const languagePatterns: { [key: string]: RegExp } = {
  // TypeScript is more specific, check it first.
  TypeScript: /\b(interface|type|public|private|protected|: string|: number|: boolean|=>|declare|enum)\b/,
  JavaScript: /\b(const|let|var|function|async|await|import|export|=>|console\.log|document\.getElementById)\b/,
  Python: /\b(def|import|from|class|self|print|elif|lambda|yield|async def)\b/,
  Java: /\b(public static void main|System\.out\.println|import java\.|class\s+\w+\s*\{|new\s+\w+\s*\(|String\[\]|@Override)\b/,
  'C++': /#include\s*<iostream>|std::cout|int main\(\)|class\s+\w+\s*\{|->|::/,
  HTML: /<!DOCTYPE html>|<html.*>|<\/body>|<div.*>|<p.*>/i,
  CSS: /\{[^{}]*:[^{}]*;[^{}]*\}/, // Basic check for a ruleset
  SQL: /\b(SELECT|FROM|WHERE|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE)\b/i,
  Markdown: /^#{1,6}\s.*|`{3}|\[.*\]\(.*\)|^-{3,}/m,
};

export function detectLanguage(code: string): string {
  if (!code.trim()) {
    return 'Plain Text';
  }

  // Order matters, more specific languages should come first.
  const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'SQL', 'Markdown'];

  for (const language of languages) {
    if (languagePatterns[language].test(code)) {
      return language;
    }
  }

  return 'Unknown';
}
