import { lazy, Suspense, useEffect } from 'react'
import { SiteLayout } from './components/SiteChrome'
import { useRouter } from './components/Router'
import { useAuth } from './context/AuthContext'
import { hasStaticOwnerAccess } from './lib/betaAccess'
import PortalGatePage from './pages/PortalGatePage'
import HomePage from './pages/HomePage'
import EntityGeneratorPage from './pages/EntityGeneratorPage'
import ProviderStatusPage from './pages/ProviderStatusPage'
import SagePage from './pages/SagePage'
import { OwnerOnlyPage, SageIdentityPage, SageLabPage } from './pages/SageOwnerPages'
import AssetIntakePage from './pages/AssetIntakePage'
import { AccountPage, AuthPage } from './pages/AccountPages'
import {
  EntitiesPage,
  EntityChannelPage,
  EntityCreatePage,
  EntityProfilePage,
} from './pages/EntityPages'
import { AvatarPage, ChannelCustomizePage, FeedPage, ProfilePage, SocialUtilityPage, StaticTvPage } from './pages/NetworkOSPages'
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

const StaticCityPage = lazy(() => import('./pages/StaticCityPage'))

function OwnerCityRoute({ ownerAccess }) {
  return (
    <OwnerOnlyPage allowed={ownerAccess}>
      <Suspense fallback={<div className="world-engine-loading">Booting STATIC City owner build...</div>}>
        <StaticCityPage />
      </Suspense>
    </OwnerOnlyPage>
  )
}

function RouteView({ ownerAccess }) {
  const { path } = useRouter()

  useEffect(() => {
    document.documentElement.dataset.route = path.slice(1) || 'home'
  }, [path])

	  if (path.startsWith('/channels/')) {
	    return <EntityChannelPage handle={decodeURIComponent(path.replace('/channels/', ''))} />
	  }

	  if (path.startsWith('/profile/')) {
	    return <ProfilePage profileHandle={decodeURIComponent(path.replace('/profile/', ''))} />
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
    case '/profile/mrstone':
      return <ProfilePage profileHandle="mrstone" />
    case '/profile':
      return <ProfilePage />
    case '/search':
      return <SocialUtilityPage type="search" />
    case '/friends':
      return <SocialUtilityPage type="friends" />
    case '/messages':
      return <SocialUtilityPage type="messages" />
    case '/notifications':
      return <SocialUtilityPage type="notifications" />
    case '/channels':
      return <PlatformPage slug="channels" />
    case '/channel':
      return <EntityChannelPage />
    case '/radio':
      return <RadioPage />
    case '/tv':
      return <StaticTvPage />
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
    case '/asset-intake':
    case '/world-bible':
      return <OwnerOnlyPage allowed={ownerAccess}><AssetIntakePage /></OwnerOnlyPage>
    case '/city':
      return <OwnerCityRoute ownerAccess={ownerAccess} />
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  const { path, navigate } = useRouter()
  const { user } = useAuth()
  const ownerAccess = hasStaticOwnerAccess(user)

  useEffect(() => {
    if (path === '/' && sessionStorage.getItem('static_gate_entered') === '1') {
      navigate('/feed')
    }
  }, [navigate, path])

  useEffect(() => {
    if (path !== '/feed' || sessionStorage.getItem('static_gate_transition') !== '1') return undefined
    document.documentElement.classList.add('static-gate-fade')
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove('static-gate-fade')
      sessionStorage.removeItem('static_gate_transition')
    }, 520)
    return () => {
      window.clearTimeout(timer)
      document.documentElement.classList.remove('static-gate-fade')
    }
  }, [path])

  if (path === '/' && sessionStorage.getItem('static_gate_entered') === '1') return null
  if (path === '/') return <PortalGatePage />
  if (path === '/city') return <OwnerCityRoute ownerAccess={ownerAccess} />

  return (
    <SiteLayout>
      <RouteView ownerAccess={ownerAccess} />
    </SiteLayout>
  )
}
