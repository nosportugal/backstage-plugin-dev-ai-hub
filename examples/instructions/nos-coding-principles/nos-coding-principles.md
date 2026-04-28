# NOS Coding Principles

These principles guide AI-assisted development at NOS Portugal. Apply them consistently across all codebases.

## Customer First

- Write code that is simple, transparent, and easy for teammates to understand — explain it like you'd explain it to a friend.
- Favour solutions that are easy to operate and support; production reliability is a customer promise.
- Surface errors clearly and early; never silently swallow exceptions.

## Code Quality & Simplicity

- Prefer clear, descriptive naming over comments that compensate for poor names.
- Keep functions and modules small and focused on a single responsibility.
- Avoid premature optimisation; optimise only after profiling confirms a bottleneck.
- Follow the existing conventions of the codebase before introducing new patterns.

## Transparency & Accountability

- Every significant decision must be traceable — through commit messages, PR descriptions, or ADRs.
- If you introduce a workaround or take on technical debt, document it with a `// TODO:` or open a follow-up issue immediately.
- Do not hide complexity behind abstraction layers without clear documentation.

## Security & Privacy by Default

- Never hard-code secrets, credentials, or personally identifiable information.
- Apply the principle of least privilege to every API, role, or permission.
- Validate and sanitise all external input before processing.
- Privacy is the default — do not collect or store personal data without a lawful basis.

## Testing & Reliability

- New behaviour must be covered by automated tests before merging.
- Write tests that document intent, not just implementation details.
- Prefer deterministic tests; avoid relying on timing, external services, or global state.
- Fix flaky tests immediately — a test suite that cannot be trusted is worse than no tests.

## Continuous Improvement

- Small, frequent merges over long-lived feature branches — "small steps, big learning".
- Code review is a team activity: give feedback with empathy and receive it with openness.
- If something is broken, fix it fast, record lessons, and update playbooks.
- No fear to experiment; courage to stop when results say to.
