import { EuiProvider } from '@elastic/eui'
import { useEffect, useState } from 'react'
import App from './App'

function getInitialColorMode(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Root() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => getInitialColorMode())

  useEffect(() => {
    if (!window.matchMedia) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setColorMode(media.matches ? 'dark' : 'light')

    onChange()

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <EuiProvider colorMode={colorMode}>
      <App colorMode={colorMode} />
    </EuiProvider>
  )
}
