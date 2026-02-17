import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
}

const SEO = ({ title, description }: SEOProps) => {
  const siteName = 'Sharefair'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const desc = description || 'Share, borrow, and rent items in your community. Reduce waste and save money with Sharefair.'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}

export default SEO
