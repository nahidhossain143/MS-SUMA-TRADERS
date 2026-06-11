import { useState } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { ShoppingCart, Package, Wheat, MapPin, Sparkles } from 'lucide-react';
import { formatBDT, LOW_STOCK_THRESHOLD } from '../lib/constants.js';
import OrderForm from './OrderForm.jsx';

export default function ProductCard({ product }) {
  const { isSignedIn } = useAuth();
  const [showOrder, setShowOrder] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD;
  const images =
    Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  const perKgPrice = Math.round(Number(product.pricePerBag) / product.bagWeightKg);
  const deliveryNote =
    product.category === 'Aromatic Rice'
      ? 'Best for biryani and festive meals'
      : product.category === 'Health Rice'
        ? 'High-fiber everyday wellness choice'
        : product.category === 'Parboiled Rice'
          ? 'Strong texture for regular household use'
          : 'Daily cooking favorite for family meals';

  const handlePrevImage = (event) => {
    event.stopPropagation();
    setActiveImgIdx((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleNextImage = (event) => {
    event.stopPropagation();
    setActiveImgIdx((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  return (
    <>
      <article className="card group flex h-full flex-col overflow-hidden border-green-800/50 hover:-translate-y-1.5 hover:border-gold-500/40 hover:shadow-2xl transition-all duration-300">
        <div className="relative h-52 overflow-hidden">
          <img
            src={images[activeImgIdx]}
            alt={`${product.name} - ${product.nameBn}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/20 to-transparent" />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-green-950/75 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-gold-500 hover:text-green-950"
              >
                &#10094;
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-green-950/75 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-gold-500 hover:text-green-950"
              >
                &#10095;
              </button>
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImgIdx(index);
                    }}
                    aria-label={`View image ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeImgIdx ? 'w-5 bg-gold-400' : 'w-2 bg-white/55 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-green-700/60 bg-green-950/90 px-3 py-1 text-[11px] font-semibold text-green-200">
              {product.category}
            </span>
            <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-[11px] font-semibold text-gold-300">
              {product.bagWeightKg}kg bag
            </span>
          </div>

          <div className="absolute right-3 top-3">
            {outOfStock ? (
              <span className="rounded-full border border-red-700/40 bg-red-900/90 px-3 py-1 text-[11px] font-semibold text-red-200">
                স্টক শেষ
              </span>
            ) : lowStock ? (
              <span className="rounded-full border border-yellow-700/40 bg-yellow-900/90 px-3 py-1 text-[11px] font-semibold text-yellow-200">
                Limited stock
              </span>
            ) : (
              <span className="rounded-full border border-green-600/40 bg-green-700/75 px-3 py-1 text-[11px] font-semibold text-green-100">
                Ready to deliver
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 rounded-2xl bg-gold-500 px-3.5 py-2 text-sm font-black text-green-950 shadow-xl">
            {formatBDT(product.pricePerBag)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black leading-tight text-white transition-colors group-hover:text-gold-300">
                  {product.name}
                </h3>
                <p className="font-bengali text-sm text-gold-300/80">{product.nameBn}</p>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-green-300">
                {formatBDT(perKgPrice)}/kg
              </span>
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-green-300">{product.description}</p>
          </div>

          <div className="mb-4 rounded-2xl border border-green-800/50 bg-green-950/35 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-300">
              <Sparkles size={13} />
              Best use
            </div>
            <p className="text-sm text-green-300">{deliveryNote}</p>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 border-y border-green-800/40 py-3 text-xs text-green-400">
            <div className="flex items-center gap-1.5">
              <Package size={12} className="text-gold-400" />
              <span>{product.bagWeightKg}kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-gold-400" />
              <span>{product.origin}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wheat size={12} className="text-gold-400" />
              <span>{outOfStock ? 'Unavailable' : `${product.stock} bags`}</span>
            </div>
          </div>

          {isSignedIn ? (
            <button
              type="button"
              onClick={() => !outOfStock && setShowOrder(true)}
              disabled={outOfStock}
              className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                outOfStock
                  ? 'cursor-not-allowed bg-green-900/50 text-green-700'
                  : 'btn-primary'
              }`}
            >
              <ShoppingCart size={16} />
              {outOfStock ? 'Currently unavailable' : 'অর্ডার করুন'}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className="btn-outline mt-auto flex w-full items-center justify-center gap-2 py-3 text-sm">
                <ShoppingCart size={16} />
                Login to place order
              </button>
            </SignInButton>
          )}
        </div>
      </article>

      {showOrder && <OrderForm product={product} onClose={() => setShowOrder(false)} />}
    </>
  );
}
