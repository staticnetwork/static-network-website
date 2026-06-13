import SageAssistantPanel from './SageAssistantPanel'
import SagePersistentLauncher from './SagePersistentLauncher'
import SageTourFlow from './SageTourFlow'

export default function SageSystem() {
  return <><SageTourFlow /><SagePersistentLauncher /><SageAssistantPanel /></>
}
