import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import listingService from '../services/listingService'
import LocationPicker from '../components/LocationPicker'
import ImageUpload from '../components/ImageUpload'
import SEO from '../components/SEO'

const CATEGORIES = ['Electronics', 'Sports & Outdoors', 'Tools', 'Furniture', 'Books', 'Clothing', 'Other']
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']

const EditListingPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [listingType, setListingType] = useState<'RENTAL' | 'FREE'>('RENTAL')
  const [price, setPrice] = useState('')
  const [pricePerDay, setPricePerDay] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    listingService.getListing(id)
      .then((listing) => {
        if (listing.ownerId !== user?.id) {
          navigate('/')
          return
        }
        setTitle(listing.title)
        setDescription(listing.description)
        setCategory(listing.category)
        setCondition(listing.condition)
        setListingType(listing.listingType === 'FREE' ? 'FREE' : 'RENTAL')
        setPrice(String(listing.price))
        setPricePerDay(listing.pricePerDay ? String(listing.pricePerDay) : '')
        setNeighborhood(listing.neighborhood || '')
        setLatitude(listing.latitude || 0)
        setLongitude(listing.longitude || 0)
        setImageUrls(listing.images?.length ? listing.images : [])
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, user?.id, navigate])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = t('validation.required')
    if (!description.trim()) newErrors.description = t('validation.required')
    if (!category) newErrors.category = t('validation.required')
    if (!condition) newErrors.condition = t('validation.required')
    if (listingType === 'RENTAL' && (!price || parseFloat(price) <= 0)) newErrors.price = t('validation.priceRequiredForRental')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !id) return

    setSaving(true)
    try {
      const isFree = listingType === 'FREE'
      await listingService.updateListing(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        condition: condition as any,
        price: isFree ? 0 : parseFloat(price),
        pricePerDay: isFree ? 0 : (pricePerDay ? parseFloat(pricePerDay) : undefined),
        images: imageUrls,
        latitude,
        longitude,
        neighborhood: neighborhood.trim(),
        available: true,
        listingType,
      })
      navigate(`/listing/${id}`)
    } catch {
      setErrors({ form: t('validation.saveFailed') })
    } finally {
      setSaving(false)
    }
  }

  const handleFilesSelected = async (files: FileList) => {
    if (!id) return
    const fileArray = Array.from(files)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024
    const remaining = 5 - imageUrls.length

    const valid = fileArray
      .filter(f => allowedTypes.includes(f.type) && f.size <= maxSize)
      .slice(0, remaining)

    if (valid.length === 0) return

    setUploading(true)
    try {
      const urls = await listingService.uploadImages(id, valid)
      setImageUrls(urls)
    } catch {
      setErrors({ form: t('listing.uploadFailed') })
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (index: number) => {
    if (!id) return
    const url = imageUrls[index]
    try {
      const updated = await listingService.deleteImage(id, url)
      setImageUrls(updated)
    } catch {
      // Fallback: remove locally
      setImageUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`

  if (loading) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SEO title={t('listing.edit')} />
      <h1 className="text-3xl font-bold mb-8">{t('listing.edit')}</h1>

      {errors.form && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">{t('listing.itemName')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('listing.itemNamePlaceholder')}
            className={inputClass('title')}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-2">{t('listing.description')}</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('listing.descriptionPlaceholder')}
            className={inputClass('description')}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">{t('listing.category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass('category')}
            >
              <option value="">{t('listing.selectCategory')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-2">{t('listing.condition')}</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={inputClass('condition')}
            >
              <option value="">{t('listing.selectCondition')}</option>
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block font-semibold mb-2">{t('listing.listingType')}</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="RENTAL"
                checked={listingType === 'RENTAL'}
                onChange={() => setListingType('RENTAL')}
                className="text-primary focus:ring-primary"
              />
              <span>{t('listing.typeRental')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value="FREE"
                checked={listingType === 'FREE'}
                onChange={() => setListingType('FREE')}
                className="text-primary focus:ring-primary"
              />
              <span>{t('listing.typeFree')}</span>
            </label>
          </div>
        </div>

        {/* Pricing (hidden for FREE listings) */}
        {listingType === 'RENTAL' && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">{t('listing.price')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('listing.pricePlaceholder')}
                className={inputClass('price')}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block font-semibold mb-2">{t('listing.pricePerDay')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                placeholder={t('listing.pricePerDayPlaceholder')}
                className={inputClass('pricePerDay')}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-semibold mb-2">{t('search.neighborhood')}</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder={t('listing.neighborhoodPlaceholder')}
            className={inputClass('neighborhood')}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">{t('listing.location')}</label>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-2">{t('listing.images')}</label>
          <ImageUpload
            images={imageUrls}
            onChange={setImageUrls}
            onFilesSelected={handleFilesSelected}
            onRemove={handleImageRemove}
            uploading={uploading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('common.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/listing/${id}`)}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditListingPage
