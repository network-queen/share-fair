import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">{t('common.appName')}</h3>
            <p className="text-gray-400">
              Connecting communities through the sharing economy.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white">{t('footer.about')}</Link></li>
              <li><a href="#" className="hover:text-white">{t('footer.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/privacy" className="hover:text-white">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} {t('common.appName')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
