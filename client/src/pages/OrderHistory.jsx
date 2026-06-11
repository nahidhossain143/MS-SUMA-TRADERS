import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Package, XCircle, ShoppingBag, ChevronRight, RefreshCw } from 'lucide-react';
import axios from '../lib/axios.js';
import { ORDER_STATUSES, formatBDT } from '../lib/constants.js';

function OrderCard({ order }) {
  const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING;
  const date = new Date(order.createdAt).toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="card p-4 transition-all duration-200 hover:border-gold-500/30 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <img
          src={order.product.imageUrl}
          alt={order.product.name}
          className="h-16 w-16 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-white sm:text-base">{order.product.name}</h3>
              <p className="font-bengali text-xs text-gold-300/70">{order.product.nameBn}</p>
            </div>
            <span className={`${status.cls} flex-shrink-0 text-xs`}>{status.label}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-green-500">
            <span>{order.quantity} bags x {order.product.bagWeightKg}kg</span>
            <span>{order.upazila}, Brahmanbaria</span>
            <span>{order.paymentMethod.replace(/_/g, ' ')}</span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-green-800/40 pt-3">
            <div>
              <div className="text-base font-bold text-gold-400">{formatBDT(order.totalPrice)}</div>
              <div className="text-xs text-green-600">{date}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-gold-500/80">{order.orderNumber}</div>
              <div className="font-bengali text-[11px] text-green-500">{status.labelBn}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getToken();
      const response = await axios.get('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data);
    } catch {
      setError('অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const summary = [
    { label: 'Total', labelBn: 'মোট', value: orders.length },
    {
      label: 'Pending',
      labelBn: 'চলমান',
      value: orders.filter((order) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)).length,
    },
    {
      label: 'Delivered',
      labelBn: 'ডেলিভারি সম্পন্ন',
      value: orders.filter((order) => order.status === 'DELIVERED').length,
    },
  ];

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-start justify-between sm:mb-8">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-black text-white sm:text-3xl">
              <ShoppingBag className="text-gold-400" size={28} />
              My Orders
            </h1>
            <p className="mt-1 text-sm text-green-400 font-bengali">আপনার সব অর্ডারের আপডেট এখানে পাবেন</p>
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-xl p-2.5 text-green-400 transition-all hover:bg-green-800/60 hover:text-white disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card flex gap-4 p-4 animate-pulse">
                <div className="h-16 w-16 rounded-xl bg-green-800/60" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 rounded bg-green-800/60" />
                  <div className="h-3 w-1/2 rounded bg-green-800/60" />
                  <div className="h-3 w-2/3 rounded bg-green-800/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center">
            <XCircle className="mx-auto mb-3 text-red-400" size={36} />
            <p className="mb-4 font-bengali text-red-400">{error}</p>
            <button type="button" onClick={fetchOrders} className="btn-secondary">
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="card p-10 text-center sm:p-14">
            <Package className="mx-auto mb-4 text-green-700" size={44} />
            <h3 className="text-xl font-black text-white">এখনও কোনো অর্ডার নেই</h3>
            <p className="mt-2 text-sm text-green-400">
              Catalog থেকে পণ্য নির্বাচন করে প্রথম অর্ডারটি দিয়ে ফেলুন।
            </p>
            <Link to="/" className="btn-primary mt-6 inline-flex items-center gap-2">
              পণ্য দেখুন <ChevronRight size={15} />
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <div className="mb-5 grid grid-cols-3 gap-3">
              {summary.map((item) => (
                <div key={item.label} className="card p-3 text-center sm:p-4">
                  <div className="text-xl font-black text-gold-400 sm:text-2xl">{item.value}</div>
                  <div className="text-xs text-green-400">{item.label}</div>
                  <div className="text-[11px] text-green-600 font-bengali">{item.labelBn}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
