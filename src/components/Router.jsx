/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { routeMeta } from '../data/network'

const RouterContext = createContext(null)
const defaultShareImage = '/assets/world/city/heroes/static-signals-boulevard-v8-final.png'

function normalizePath(pathname) {
  const clean = pathname.replace(/\/+$/, '')
  return clean || '/'
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(to) {
    const url = new URL(to, window.location.origin)
    const nextPath = normalizePath(url.pathname)

    if (url.origin !== window.location.origin) {
      window.location.assign(url.href)
      return
    }

    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setPath(nextPath)

    window.requestAnimationFrame(() => {
      if (url.hash) {
        document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    })
  }

  const value = useMemo(() => ({ path, navigate }), [path])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  return useContext(RouterContext)
}

export function Link({ to, onClick, children, ...props }) {
  const { navigate } = useRouter()

  function handleClick(event) {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

export function RouteSEO({ path, title, description }) {
  useEffect(() => {
    const metadata = routeMeta[path] || {}
    const pageTitle = title || metadata.title || 'STATIC Network'
    const pageDescription =
      description ||
      metadata.description ||
      'The Home of AI Entertainment. Watch it. Hear it. Play it. Create it. Own it.'
    const pageImage = metadata.image || defaultShareImage
    const absoluteImage = new URL(pageImage, window.location.origin).href

    document.title = pageTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', pageDescription)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', pageTitle)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDescription)
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', absoluteImage)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${window.location.origin}${path}`)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pageTitle)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', pageDescription)
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', absoluteImage)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${window.location.origin}${path}`)
  }, [description, path, title])

  return null
}
