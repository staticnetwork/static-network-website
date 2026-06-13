import { useEffect } from 'react'
import { SiteLayout } from './components/SiteChrome'
import { useRouter } from './components/Router'
import { SignalMark } from './components/UI'
import { useAuth } from './context/AuthContext'
import { hasStaticInternalAccess, hasStaticOwnerAccess, staticBetaMode } from './lib/betaAccess'
import BetaGatePage from './pages/BetaGatePage'
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
      return <HomePage />
    case '/signals':
      return <FeedPage signalsMode />
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
  const { user, loading } = useAuth()
  const internalAccess = hasStaticInternalAccess(user)
  const ownerAccess = hasStaticOwnerAccess(user)
  const publicUtilityPaths = new Set(['/contact', '/terms', '/privacy', '/login', '/signup'])

  if (staticBetaMode && loading) return <div className="beta-loading"><SignalMark animated /><span>CHECKING ACCESS</span></div>
  if (staticBetaMode && !internalAccess && !publicUtilityPaths.has(path)) return <BetaGatePage requestedPath={path} />

  return (
    <SiteLayout assistantEnabled={internalAccess}>
      <RouteView ownerAccess={ownerAccess} />
    </SiteLayout>
  )
}
