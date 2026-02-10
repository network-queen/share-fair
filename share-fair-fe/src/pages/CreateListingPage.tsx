import { useTranslation } from 'react-i18next'

const CreateListingPage = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('listing.create')}</h1>

      <form className="space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block font-semibold mb-2">{t('listing.itemName')}</label>
          <input
            type="text"
            placeholder="e.g., Mountain Bike, Camping Tent"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">{t('listing.description')}</label>
          <textarea
            rows={4}
            placeholder="Describe the item condition, features, and rental terms"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">{t('listing.category')}</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Select a category</option>
              <option>Electronics</option>
              <option>Sports & Outdoors</option>
              <option>Tools</option>
              <option>Furniture</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('listing.condition')}</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Select condition</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">{t('listing.price')}</label>
            <input
              type="number"
              placeholder="Fixed price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('listing.pricePerDay')}</label>
            <input
              type="number"
              placeholder="Daily rental price"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block font-semibold mb-2">{t('listing.images')}</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">Drag and drop images here or click to select</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
          >
            {t('common.save')}
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 border border-gray-300 font-bold rounded-lg hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateListingPage
