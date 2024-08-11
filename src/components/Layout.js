// components/Layout.js
import { Navigation } from './Navigation'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  )
}