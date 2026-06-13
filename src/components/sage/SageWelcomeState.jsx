export default function SageWelcomeState({ user, entity }) {
  if (entity) return <p>Welcome back. <strong>{entity.name}</strong> is active. Shall we open the Entity, Channel, Studio, or Feed?</p>
  if (user) return <p>Your operator account is online. Everything in STATIC begins with an Entity. I can help you create one.</p>
  return <p>I’m your concierge, operator, and creative copilot inside STATIC. Ask naturally. I’ll confirm before anything sensitive happens.</p>
}

