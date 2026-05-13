#!/bin/bash
# Hook SessionStart: inyecta Claude Ads v2.4.0 automaticamente en cada sesion
SKILL_FILE="$(dirname "$0")/../skills/claude-ads/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  SKILL_FILE="$HOME/.claude/skills/claude-ads/SKILL.md"
fi

if [ ! -f "$SKILL_FILE" ]; then
  exit 0
fi

python3 -c "
import json, sys

try:
    content = open('$SKILL_FILE').read()
    lines = content.split('\'\\n\'')
    in_frontmatter = False
    body_lines = []
    frontmatter_count = 0
    for line in lines:
        if line.strip() == '\''---\'':
            frontmatter_count += 1
            if frontmatter_count <= 2:
                in_frontmatter = not in_frontmatter
                continue
        if frontmatter_count >= 2 and not in_frontmatter:
            body_lines.append(line)
    body = '\'\\n\''.join(body_lines).strip()
    output = {
        '\''hookSpecificOutput\'': {
            '\''hookEventName\'': '\''SessionStart\'',
            '\''additionalContext\'': body
        }
    }
    print(json.dumps(output))
except Exception:
    sys.exit(0)
"
