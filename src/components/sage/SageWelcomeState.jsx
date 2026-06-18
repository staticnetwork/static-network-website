export default function SageWelcomeState({ user, entity }) {
  if (entity) return <p>Welcome back. <strong>{entity.name}</strong> is active. Ask me to guide District OS, open My Signal, or take the tour.</p>
  if (user) return <p>Your operator account is online. Everything in STATIC begins with an Entity; I can walk you through the first loop.</p>
  return <p>I’m your concierge, operator, and creative copilot inside STATIC. Ask for the District OS guide and I’ll move one step at a time.</p>
}
