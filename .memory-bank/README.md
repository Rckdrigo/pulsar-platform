# Memory Bank - Pulsar Interactive

This memory bank provides unified context for both Cline and Claude Code when working with the Pulsar Interactive codebase.

## Single Source of Truth

This consolidated memory bank replaces the previous fragmented documentation and aligns with the actual codebase architecture.

## Files Overview

- `project-context.md` - Unified project overview, architecture, and development guidelines
- `current-state.md` - Active development status, recent changes, and next steps
- `technical-patterns.md` - Key patterns, conventions, and implementation details

## Subproject Memory Banks

Each subproject maintains its own specialized memory bank:

- **Luna Frontend** (`luna/.memory-bank/`): React/Vite specific patterns and context
- **Pulsar Backend** (`pulsar/.memory-bank/`): Node.js/Koa API specific patterns and context
- **Planet Management** (`planet/.memory-bank/`): Project management specific patterns and context

## Usage

Both Cline and Claude Code should reference these files to maintain consistent context about:
- Project structure and relationships between components
- Development commands and workflows
- Current progress and priorities
- Technical decisions and patterns

This memory bank is kept lean and focused on actionable information rather than theoretical documentation.