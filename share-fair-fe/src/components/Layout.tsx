import Navigation from './Navigation'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Navigation />
      <main id="main-content" role="main" className="flex-grow container mx-auto px-4 py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
