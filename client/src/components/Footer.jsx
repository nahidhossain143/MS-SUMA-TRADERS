import { Link } from 'react-router-dom';
import { Wheat, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useConfig } from '../lib/useConfig.js';

export default function Footer() {
  const config = useConfig();

  return (
    <footer className="mt-auto border-t border-green-800/50 bg-green-950/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
                <Wheat size={20} className="text-green-950" />
              </div>
              <div>
                <div className="text-lg font-bold leading-none text-white">MS SUMA TRADERS</div>
                <div className="font-bengali text-xs tracking-wider text-gold-400">চাল পাইকারি ও খুচরা</div>
              </div>
            </div>
            <p className="mb-4 text-sm leading-7 text-green-400">
              Brahmanbaria জেলার জন্য curated real rice catalog, trusted delivery support, এবং wholesale-ready order
              flow নিয়ে MS SUMA TRADERS এখন আরও professional ecommerce experience দিচ্ছে।
            </p>
            <a
              href={`https://wa.me/880${config.whatsapp?.replace(/^0/, '')}?text=আসসালামু আলাইকুম, আমি চাল অর্ডার করতে চাই।`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-500"
            >
              <MessageCircle size={15} />
              WhatsApp এ অর্ডার করুন
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Our Products', labelBn: 'আমাদের পণ্য' },
                { to: '/orders', label: 'My Orders', labelBn: 'আমার অর্ডার' },
                { to: '/sign-in', label: 'Sign In', labelBn: 'লগ ইন' },
                { to: '/sign-up', label: 'Register', labelBn: 'নিবন্ধন' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="flex items-center gap-2 text-sm text-green-400 transition-colors hover:text-gold-400">
                    <span>{link.label}</span>
                    <span className="font-bengali text-xs text-green-600">({link.labelBn})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-green-400">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-gold-400" />
                <span>{config.deliveryArea}</span>
              </li>
              <li>
                <a
                  href={`tel:${config.phone}`}
                  className="flex items-center gap-2.5 text-sm text-green-400 transition-colors hover:text-gold-400"
                >
                  <Phone size={15} className="flex-shrink-0 text-gold-400" />
                  {config.phone}
                </a>
              </li>
              <li className="text-sm text-green-400">
                <span className="text-pink-300">bKash:</span> {config.bkashNumber}
              </li>
              <li className="text-sm text-green-400">
                <span className="text-orange-300">Nagad:</span> {config.nagadNumber}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-green-800/50 pt-6 text-xs text-green-600 sm:flex-row">
          <span>© {new Date().getFullYear()} MS Suma Traders. All rights reserved.</span>
          <span>Delivery coverage: Brahmanbaria district only</span>
        </div>
      </div>
    </footer>
  );
}
