import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  X,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Package,
  Minus,
  Plus,
  StickyNote,
  CheckCircle2,
} from 'lucide-react';
import axios from '../lib/axios.js';
import toast from 'react-hot-toast';
import { BRAHMANBARIA_UPAZILAS, PAYMENT_METHODS, formatBDT } from '../lib/constants.js';
import { useConfig } from '../lib/useConfig.js';

export default function OrderForm({ product, onClose }) {
  const { getToken } = useAuth();
  const config = useConfig();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    upazila: '',
    address: '',
    notes: '',
  });

  const total = Number(product.pricePerBag) * quantity;
  const selectedPayment = PAYMENT_METHODS.find((item) => item.id === paymentMethod);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value,
    }));
  };

  const validate = () => {
    if (!form.customerName.trim()) {
      toast.error('আপনার পুরো নাম লিখুন।');
      return false;
    }
    if (form.phone.length !== 11) {
      toast.error('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।');
      return false;
    }
    if (!form.upazila) {
      toast.error('উপজেলা নির্বাচন করুন।');
      return false;
    }
    if (!form.address.trim()) {
      toast.error('ডেলিভারি ঠিকানা লিখুন।');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        '/api/orders',
        {
          productId: product.id,
          quantity,
          paymentMethod,
          ...form,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPlacedOrder(response.data.data);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="card-glass max-h-[92vh] w-full overflow-y-auto rounded-t-3xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-700/40 bg-green-950/95 px-5 py-4 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-bold text-white">
              {step === 1 ? 'Place order' : 'Order confirmed'}
            </h2>
            <p className="mt-0.5 text-xs text-green-400">
              {step === 1 ? `অর্ডার দিন - ${product.nameBn}` : `Order #${placedOrder?.orderNumber}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-green-400 transition-all hover:bg-green-800/60 hover:text-white"
            aria-label="Close order form"
          >
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-green-700/40 bg-green-900/50 p-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                <p className="font-bengali text-xs text-gold-300/80">{product.nameBn}</p>
                <p className="mt-1 text-sm font-bold text-gold-400">
                  {formatBDT(product.pricePerBag)} / bag
                </p>
              </div>
            </div>

            <div>
              <label className="input-label flex items-center gap-1">
                <Package size={12} />
                Quantity / ব্যাগ সংখ্যা
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-700/60 bg-green-800/60 text-white hover:bg-green-700"
                >
                  <Minus size={16} />
                </button>
                <div className="input-field py-2 text-center text-xl font-black text-gold-400">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-700/60 bg-green-800/60 text-white hover:bg-green-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mt-1 text-xs text-green-500">{product.stock} bags available now</p>
            </div>

            <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-green-200">
                  মোট মূল্য ({quantity} x {formatBDT(product.pricePerBag)})
                </span>
                <span className="text-xl font-black text-gold-400">{formatBDT(total)}</span>
              </div>
            </div>

            <div>
              <label className="input-label">Payment method / পেমেন্ট পদ্ধতি</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-2xl border-2 p-3 text-center transition-all ${
                      paymentMethod === method.id
                        ? 'border-gold-500 bg-gold-500/15'
                        : 'border-green-700/40 bg-green-900/40 hover:border-green-600/70'
                    }`}
                  >
                    <div className="mb-1 text-xl">{method.icon}</div>
                    <div className={`text-xs font-bold ${paymentMethod === method.id ? 'text-gold-300' : method.color}`}>
                      {method.label}
                    </div>
                    <div className="font-bengali text-[11px] text-green-500">{method.labelBn}</div>
                  </button>
                ))}
              </div>
              <p className="mt-2 rounded-xl border border-green-700/40 bg-green-900/35 px-3 py-2 text-xs text-green-300">
                {selectedPayment?.description}
              </p>
            </div>

            <div>
              <label htmlFor="customerName" className="input-label">
                <User size={11} className="mr-1 inline" />
                Full name / পুরো নাম
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={form.customerName}
                onChange={handleChange}
                placeholder="আপনার পুরো নাম লিখুন"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="phone" className="input-label">
                <Phone size={11} className="mr-1 inline" />
                Mobile number / মোবাইল নম্বর
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="upazila" className="input-label">
                <MapPin size={11} className="mr-1 inline" />
                Upazila / উপজেলা
              </label>
              <select
                id="upazila"
                name="upazila"
                required
                value={form.upazila}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select your upazila</option>
                {BRAHMANBARIA_UPAZILAS.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-green-500">
                Delivery area: {config.deliveryArea}
              </p>
            </div>

            <div>
              <label htmlFor="address" className="input-label">
                <MapPin size={11} className="mr-1 inline" />
                Detailed address / বিস্তারিত ঠিকানা
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Village/Road, para, union, landmark..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label htmlFor="notes" className="input-label">
                <StickyNote size={11} className="mr-1 inline" />
                Notes / বিশেষ নির্দেশনা
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                value={form.notes}
                onChange={handleChange}
                placeholder="যেমন: বিকেলের পরে ডেলিভারি দিন"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base">
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-950 border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  অর্ডার নিশ্চিত করুন - {formatBDT(total)}
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && placedOrder && (
          <div className="space-y-5 p-5">
            <div className="py-4 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="text-green-400" size={36} />
              </div>
              <h3 className="text-xl font-black text-white">আপনার অর্ডার সফলভাবে নেওয়া হয়েছে</h3>
              <p className="mt-1 text-sm text-green-400">
                আমাদের টিম খুব শিগগিরই ফোনে কনফার্ম করবে।
              </p>
            </div>

            <div className="space-y-2.5 rounded-2xl border border-green-700/40 bg-green-900/40 p-4 text-sm">
              {[
                { label: 'Order number', value: placedOrder.orderNumber, cls: 'text-gold-400 font-bold' },
                { label: 'Product', value: `${product.name} (${product.nameBn})`, cls: 'text-white' },
                { label: 'Quantity', value: `${placedOrder.quantity} bags x ${product.bagWeightKg}kg`, cls: 'text-green-200' },
                { label: 'Total amount', value: formatBDT(placedOrder.totalPrice), cls: 'text-gold-400 font-bold text-base' },
                { label: 'Upazila', value: placedOrder.upazila, cls: 'text-green-200' },
                { label: 'Payment', value: selectedPayment?.label, cls: 'text-green-200' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-green-500">{row.label}</span>
                  <span className={row.cls}>{row.value}</span>
                </div>
              ))}
            </div>

            {paymentMethod === 'BKASH' && (
              <div className="rounded-2xl border border-pink-700/40 bg-pink-900/20 p-4 text-sm">
                <p className="mb-2 font-bold text-pink-300">bKash payment</p>
                <p className="text-pink-100">
                  {formatBDT(placedOrder.totalPrice)} পাঠান এই নম্বরে:
                </p>
                <p className="my-2 text-2xl font-black text-pink-300">{config.bkashNumber}</p>
                <p className="text-xs text-pink-200">
                  Reference-এ order number <strong>{placedOrder.orderNumber}</strong> লিখুন।
                </p>
              </div>
            )}

            {paymentMethod === 'NAGAD' && (
              <div className="rounded-2xl border border-orange-700/40 bg-orange-900/20 p-4 text-sm">
                <p className="mb-2 font-bold text-orange-300">Nagad payment</p>
                <p className="text-orange-100">
                  {formatBDT(placedOrder.totalPrice)} পাঠান এই নম্বরে:
                </p>
                <p className="my-2 text-2xl font-black text-orange-300">{config.nagadNumber}</p>
                <p className="text-xs text-orange-200">
                  Reference-এ order number <strong>{placedOrder.orderNumber}</strong> লিখুন।
                </p>
              </div>
            )}

            {paymentMethod === 'CASH_ON_DELIVERY' && (
              <div className="rounded-2xl border border-green-700/40 bg-green-800/30 p-4 text-sm">
                <p className="mb-1 font-bold text-green-300">Cash on delivery</p>
                <p className="text-green-200">
                  পণ্য গ্রহণের সময় <strong className="text-white">{formatBDT(placedOrder.totalPrice)}</strong> পরিশোধ করুন।
                </p>
              </div>
            )}

            <p className="text-center text-xs text-green-500">
              Support hours: <strong className="text-green-300">{config.supportHours}</strong>
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">
                Close
              </button>
              <a
                href={`https://wa.me/880${config.whatsapp?.replace(/^0/, '')}?text=আমার অর্ডার নম্বর: ${placedOrder.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-xl bg-green-600 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-green-500"
              >
                WhatsApp support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
