import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Filter,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Store,
  Truck,
  Wheat,
  X,
} from 'lucide-react';
import axios from '../lib/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import { AVAILABILITY_OPTIONS, PRODUCT_SORT_OPTIONS } from '../lib/constants.js';
import { useConfig } from '../lib/useConfig.js';

const SERVICE_HIGHLIGHTS = [
  {
    icon: <ShieldCheck size={20} className="text-gold-400" />,
    title: 'Trusted quality control',
    description: 'Each catalog item is curated for consistent grain quality, packaging, and cooking performance.',
  },
  {
    icon: <Truck size={20} className="text-gold-400" />,
    title: 'Brahmanbaria delivery coverage',
    description: 'We deliver across all 9 upazilas with direct phone confirmation before dispatch.',
  },
  {
    icon: <Store size={20} className="text-gold-400" />,
    title: 'Retail and wholesale ready',
    description: 'Single-family orders and larger shop orders can both be managed from the same storefront.',
  },
];

export default function Home() {
  const { isSignedIn } = useAuth();
  const config = useConfig();
  const [products, setProducts] = useState([]);
  const [catalogFilters, setCatalogFilters] = useState({ categories: [], origins: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/products', {
          params: {
            search: searchQuery || undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            origin: selectedOrigin !== 'All' ? selectedOrigin : undefined,
            availability,
            sort,
          },
          signal: controller.signal,
        });

        setProducts(response.data.data || []);
        setCatalogFilters(response.data.filters || { categories: [], origins: [] });
      } catch (requestError) {
        if (requestError.name === 'CanceledError') {
          return;
        }

        setError('পণ্য লোড করতে সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [searchQuery, selectedCategory, selectedOrigin, availability, sort]);

  const spotlightProducts = products.slice(0, 3);
  const totalInStock = products.filter((product) => product.stock > 0).length;
  const categories = ['All', ...catalogFilters.categories];
  const origins = ['All', ...catalogFilters.origins];

  return (
    <div className="pt-14 sm:pt-16">
      <section className="relative overflow-hidden border-b border-green-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.14),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs font-semibold text-gold-300">
              <Wheat size={14} />
              Curated rice catalog for Brahmanbaria customers
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Real rice products.
              <span className="block text-gradient">Cleaner catalog. Stronger ecommerce storefront.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-green-200 sm:text-lg">
              MS SUMA TRADERS এখন curated real rice catalog, cleaner pricing presentation, and better buying flow নিয়ে আরও
              professionalভাবে ready. Retail order, wholesale inquiry, আর district-based delivery এক জায়গা থেকেই manage করতে পারবেন।
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catalog" className="btn-primary px-6 py-3.5 text-sm sm:text-base">
                <Package size={17} />
                Catalog browse করুন
              </a>
              <a
                href={`https://wa.me/880${config.whatsapp?.replace(/^0/, '')}?text=আসসালামু আলাইকুম, আমি চালের দামের তালিকা জানতে চাই।`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-6 py-3.5 text-sm sm:text-base"
              >
                <MessageCircle size={17} />
                WhatsApp price list
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Catalog items', value: products.length || catalogFilters.categories.length * 2 || 12 },
                { label: 'Upazilas covered', value: config.upazilas.length },
                { label: 'Wholesale starts', value: `${config.wholesaleMinimumBags}+ bags` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-green-800/50 bg-green-950/35 p-4">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-sm text-green-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-glass overflow-hidden p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Catalog snapshot</p>
                  <h2 className="mt-1 text-2xl font-black text-white">Ready-to-sell inventory</h2>
                </div>
                <span className="rounded-full border border-green-700/50 bg-green-900/60 px-3 py-1 text-xs font-semibold text-green-300">
                  {totalInStock} in stock
                </span>
              </div>

              <div className="space-y-3">
                {spotlightProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-2xl border border-green-800/40 bg-green-950/35 p-3"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{product.name}</p>
                          <p className="font-bengali text-xs text-green-400">{product.nameBn}</p>
                        </div>
                        <ArrowUpRight size={16} className="flex-shrink-0 text-gold-300" />
                      </div>
                      <p className="mt-1 text-xs text-green-500">
                        {product.category} • {product.origin}
                      </p>
                    </div>
                  </div>
                ))}

                {spotlightProducts.length === 0 && !loading && (
                  <div className="rounded-2xl border border-green-800/40 bg-green-950/35 p-4 text-sm text-green-300">
                    কোনো পণ্য পাওয়া যায়নি। Filter clear করে আবার দেখুন।
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gold-300">Delivery</p>
                <p className="mt-2 text-lg font-bold text-white">{config.deliveryArea}</p>
                <p className="mt-1 text-sm text-green-400">Phone confirmation before dispatch</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gold-300">Support</p>
                <p className="mt-2 text-lg font-bold text-white">{config.phone}</p>
                <p className="mt-1 text-sm text-green-400">{config.supportHours}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-green-800/40 bg-green-900/20 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {SERVICE_HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="card flex items-start gap-3 p-4">
              <div className="rounded-xl border border-gold-500/20 bg-gold-500/10 p-2">{highlight.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-white">{highlight.title}</h3>
                <p className="mt-1 text-sm leading-6 text-green-400">{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-xs font-semibold text-gold-300">
                <Filter size={14} />
                Filtered product catalog
              </div>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Browse the full rice collection</h2>
              <p className="mt-2 max-w-2xl text-green-400">
                Search by product name, narrow by category or origin, and sort by price or stock to find the right
                item faster.
              </p>
            </div>
            <div className="rounded-2xl border border-green-800/50 bg-green-950/35 px-4 py-3 text-sm text-green-300">
              Showing <strong className="text-white">{products.length}</strong> product{products.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="card mb-8 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="মিনিকেট, চিনিগুঁড়া, সিদ্ধ, basmati..."
                  className="input-field pl-11 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-green-500 transition-colors hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="input-field"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedOrigin}
                onChange={(event) => setSelectedOrigin(event.target.value)}
                className="input-field"
              >
                {origins.map((origin) => (
                  <option key={origin} value={origin}>
                    {origin === 'All' ? 'All origins' : origin}
                  </option>
                ))}
              </select>

              <select value={sort} onChange={(event) => setSort(event.target.value)} className="input-field">
                {PRODUCT_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAvailability(option.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    availability === option.id
                      ? 'bg-gold-500 text-green-950'
                      : 'border border-green-800/50 bg-green-950/40 text-green-300 hover:border-green-700 hover:text-white'
                  }`}
                >
                  {option.labelBn}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-52 rounded-t-2xl bg-green-800/50" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 rounded bg-green-800/50" />
                    <div className="h-3 w-1/2 rounded bg-green-800/50" />
                    <div className="h-16 rounded bg-green-800/50" />
                    <div className="h-11 rounded-xl bg-green-800/50" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="card py-12 text-center">
              <p className="mb-4 font-bengali text-red-400">{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="card mx-auto max-w-lg px-6 py-12 text-center">
              <Package className="mx-auto mb-4 text-gold-400" size={34} />
              <h3 className="text-xl font-black text-white">এই filter-এ কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="mt-2 text-sm text-green-400">
                Category, origin, বা search একটু পরিবর্তন করে আবার দেখুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedOrigin('All');
                  setAvailability('all');
                  setSort('featured');
                }}
                className="btn-primary mt-6"
              >
                সব filter reset করুন
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="card-glass border border-gold-500/20 p-8 text-center sm:p-10">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Ready to order from MS SUMA TRADERS?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-green-300">
              Sign in to place an order directly from the catalog, or contact us on WhatsApp for wholesale pricing,
              retail guidance, and same-district delivery coordination.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              {!isSignedIn ? (
                <>
                  <Link to="/sign-up" className="btn-primary px-6 py-3.5">
                    <CheckCircle2 size={16} />
                    Free account খুলুন
                  </Link>
                  <a
                    href={`https://wa.me/880${config.whatsapp?.replace(/^0/, '')}?text=আমি চাল অর্ডার করতে চাই।`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary px-6 py-3.5"
                  >
                    <MessageCircle size={16} />
                    WhatsApp এ কথা বলুন
                  </a>
                </>
              ) : (
                <a href="#catalog" className="btn-primary px-6 py-3.5">
                  <Package size={16} />
                  এখনই পণ্য নির্বাচন করুন
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
