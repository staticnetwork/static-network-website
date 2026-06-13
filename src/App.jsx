import { useEffect } from 'react'
import { SiteLayout } from './components/SiteChrome'
import { useRouter } from './components/Router'
import HomePage from './pages/HomePage'
import {
  EntitiesPage,
  EntityChannelPage,
  EntityCreatePage,
  EntityProfilePage,
} from './pages/EntityPages'
import {
  ContactPage,
  DirectoryPage,
  DiscoverPage,
  LegalPage,
  MarketplacePage,
  MembershipPage,
  NotFoundPage,
  PlatformPage,
  PlayPage,
  RadioPage,
  StudioPage,
  WaitlistPage,
} from './pages/PlatformPages'

function RouteView() {
  const { path } = useRouter()

  useEffect(() => {
    document.documentElement.dataset.route = path.slice(1) || 'home'
  }, [path])

  if (path.startsWith('/channels/')) {
    return <EntityChannelPage handle={decodeURIComponent(path.replace('/channels/', ''))} />
  }

  switch (path) {
    case '/':
      return <HomePage />
    case '/signals':
      return <PlatformPage slug="signals" />
    case '/channels':
      return <PlatformPage slug="channels" />
    case '/channel':
      return <EntityChannelPage />
    case '/radio':
      return <RadioPage />
    case '/play':
      return <PlayPage />
    case '/live':
      return <PlatformPage slug="live" />
    case '/originals':
      return <PlatformPage slug="originals" />
    case '/marketplace':
      return <MarketplacePage />
    case '/labs':
      return <PlatformPage slug="labs" />
    case '/creators':
      return <DirectoryPage type="creators" />
    case '/studios':
      return <DirectoryPage type="studios" />
    case '/entities':
      return <EntitiesPage />
    case '/entities/create':
      return <EntityCreatePage />
    case '/entities/profile':
      return <EntityProfilePage />
    case '/studio':
      return <StudioPage />
    case '/static-plus':
      return <MembershipPage type="static-plus" />
    case '/creator-pro':
      return <MembershipPage type="creator-pro" />
    case '/discover':
      return <DiscoverPage />
    case '/waitlist':
      return <WaitlistPage />
    case '/contact':
      return <ContactPage />
    case '/terms':
      return <LegalPage type="terms" />
    case '/privacy':
      return <LegalPage type="privacy" />
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  return (
    <SiteLayout>
      <RouteView />
    </SiteLayout>
  )
}
