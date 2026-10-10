## Git Workflow & Automation

Whenever you successfully create, modify, or delete files to fulfill a request, you MUST automatically commit and push the changes to the repository. Follow these exact steps without asking for prior permission:

1. **Stage changes:** Execute `git add .` to stage all modified files.
2. **Commit:** Execute `git commit -m "type(scope): brief description"`. Always use Conventional Commits format (e.g., `feat: add terminal neon button`, `style: apply monospace font to header`, `fix: correct layout padding`).
3. **Push:** Execute `git push` to upload the changes to the remote repository.

Do not pause to ask the user if they want to commit. Execute this Git workflow immediately after completing the code modifications and verifying there are no syntax errors. Inform the user once the push is successful.