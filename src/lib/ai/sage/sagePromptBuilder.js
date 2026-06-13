export function buildSagePrompt({ input, path, entity, loggedIn }) {
  return `Current route: ${path}. Active Entity: ${entity?.name || 'none'}. Logged in: ${loggedIn ? 'yes' : 'no'}. User request: ${input}`
}

