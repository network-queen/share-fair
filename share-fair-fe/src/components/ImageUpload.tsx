import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  onFilesSelected?: (files: FileList) => void
  onRemove?: (index: number) => void
  uploading?: boolean
  maxImages?: number
}

const ImageUpload = ({ images, onChange, onFilesSelected, onRemove, uploading = false, maxImages = 5 }: ImageUploadProps) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files: FileList) => {
    if (onFilesSelected) {
      onFilesSelected(files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index)
    } else {
      onChange(images.filter((_, i) => i !== index))
    }
  }

  return (
    <div>
      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files)
                e.target.value = ''
              }
            }}
          />
          <div className="text-gray-500">
            {uploading ? (
              <p>{t('listing.uploadingImages')}</p>
            ) : (
              <>
                <svg className="mx-auto h-10 w-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-18 0V7.875c0-.621.504-1.125 1.125-1.125h4.072a2.25 2.25 0 011.59.659l.812.813c.42.42.996.659 1.59.659h5.436c.621 0 1.125.504 1.125 1.125v6.375" />
                </svg>
                <p className="text-sm">{t('listing.dragDropImages')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('listing.imageFormats')}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">Error</text></svg>' }}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(index) }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {t('listing.coverImage')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {images.length}/{maxImages} {t('listing.images').toLowerCase()}
      </p>
    </div>
  )
}

export default ImageUpload
