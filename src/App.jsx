import { useEffect } from 'react'
import { SiteLayout } from './components/SiteChrome'
import { useRouter } from './components/Router'
import SageSystem from './components/sage/SageSystem'
import { useAuth } from './context/AuthContext'
import { hasStaticOwnerAccess } from './lib/betaAccess'
import PortalGatePage from './pages/PortalGatePage'
import HomePage from './pages/HomePage'
import EntityGeneratorPage from './pages/EntityGeneratorPage'
import ProviderStatusPage from './pages/ProviderStatusPage'
import SagePage from './pages/SagePage'
import { OwnerOnlyPage, SageIdentityPage, SageLabPage } from './pages/SageOwnerPages'
import { AccountPage, AuthPage } from './pages/AccountPages'
import {
  EntitiesPage,
  EntityChannelPage,
  EntityCreatePage,
  EntityProfilePage,
} from './pages/EntityPages'
import { AvatarPage, ChannelCustomizePage, FeedPage } from './pages/NetworkOSPages'
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

function RouteView({ ownerAccess }) {
  const { path } = useRouter()

  useEffect(() => {
    document.documentElement.dataset.route = path.slice(1) || 'home'
  }, [path])

  if (path.startsWith('/channels/')) {
    return <EntityChannelPage handle={decodeURIComponent(path.replace('/channels/', ''))} />
  }

  switch (path) {
    case '/':
      return <PortalGatePage />
    case '/home':
      return <HomePage />
    case '/signals':
      return <FeedPage signalsMode />
    case '/my-signal':
      return <FeedPage followedOnly />
    case '/feed':
      return <FeedPage />
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
    case '/entities/generate':
      return <EntityGeneratorPage />
    case '/entities/profile':
      return <EntityProfilePage />
    case '/entities/avatar':
      return <AvatarPage />
    case '/channel/customize':
      return <ChannelCustomizePage />
    case '/login':
      return <AuthPage mode="login" />
    case '/signup':
      return <AuthPage mode="signup" />
    case '/account':
      return <AccountPage />
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
    case '/provider-status':
      return <ProviderStatusPage />
    case '/sage':
      return <SagePage />
    case '/sage-identity':
      return <OwnerOnlyPage allowed={ownerAccess}><SageIdentityPage /></OwnerOnlyPage>
    case '/sage-lab':
      return <OwnerOnlyPage allowed={ownerAccess}><SageLabPage /></OwnerOnlyPage>
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  const { path } = useRouter()
  const { user } = useAuth()
  const ownerAccess = hasStaticOwnerAccess(user)

  if (path === '/' || path === '/demo') return <><SageSystem /><PortalGatePage /></>

  return (
    <SiteLayout assistantEnabled>
      <RouteView ownerAccess={ownerAccess} />
    </SiteLayout>
  )
}
