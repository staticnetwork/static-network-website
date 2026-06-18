import SageAssistantPanel from './SageAssistantPanel'
import SageArrivalExperience from './SageArrivalExperience'
import SagePersistentLauncher from './SagePersistentLauncher'
import SageTourFlow from './SageTourFlow'

export default function SageSystem() {
  return <><SageArrivalExperience /><SageTourFlow /><SagePersistentLauncher /><SageAssistantPanel /></>
}
