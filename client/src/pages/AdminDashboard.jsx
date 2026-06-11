import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  LayoutDashboard,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Warehouse,
  X,
} from 'lucide-react';
import axios from '../lib/axios.js';
import toast from 'react-hot-toast';
import {
  BRAHMANBARIA_UPAZILAS,
  CATEGORIES,
  ORDER_STATUSES,
  formatBDT,
} from '../lib/constants.js';

const TABS = [
  { id: 'overview', label: 'Overview', labelBn: 'সারাংশ', icon: <LayoutDashboard size={15} /> },
  { id: 'products', label: 'Products', labelBn: 'পণ্য', icon: <Package size={15} /> },
  { id: 'orders', label: 'Orders', labelBn: 'অর্ডার', icon: <ShoppingBag size={15} /> },
];

const STATUS_PIPELINE = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'];

function ProductModal({ product, onClose, onSave }) {
  const { getToken } = useAuth();
  const isEditing = Boolean(product);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(
    product?.imageUrls?.length ? product.imageUrls : product?.imageUrl ? [product.imageUrl] : [],
  );
  const [form, setForm] = useState({
    name: product?.name || '',
    nameBn: product?.nameBn || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    pricePerBag: product?.pricePerBag || '',
    bagWeightKg: product?.bagWeightKg || 25,
    stock: product?.stock ?? '',
    category: product?.category || 'Fine Rice',
    origin: product?.origin || 'Bangladesh',
    isActive: product?.isActive ?? true,
  });

  const setField = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.nameBn || !form.description || !form.pricePerBag || form.stock === '') {
      toast.error('সব required field পূরণ করুন।');
      return;
    }

    setLoading(true);
    let finalImageUrls = [...existingImages];

    try {
      if (selectedFiles.length > 0) {
        const uploadForm = new FormData();
        selectedFiles.forEach((file) => uploadForm.append('images', file));

        const token = await getToken();
        const uploadResponse = await axios.post('/api/upload', uploadForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        finalImageUrls = [...finalImageUrls, ...(uploadResponse.data?.urls || [])];
      }

      if (finalImageUrls.length === 0 && form.imageUrl) {
        finalImageUrls = [form.imageUrl];
      }

      if (finalImageUrls.length === 0) {
        toast.error('অন্তত ১টি product image দিতে হবে।');
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        nameBn: form.nameBn.trim(),
        description: form.description.trim(),
        imageUrl: finalImageUrls[0],
        imageUrls: finalImageUrls,
        pricePerBag: Number(form.pricePerBag),
        bagWeightKg: Number(form.bagWeightKg),
        stock: Number(form.stock),
        category: form.category,
        origin: form.origin.trim(),
        isActive: form.isActive,
      };

      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`/api/admin/products/${product.id}`, payload, { headers });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/admin/products', payload, { headers });
        toast.success('Product created successfully');
      }

      await onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Product save করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="card-glass max-h-[92vh] w-full overflow-y-auto rounded-t-3xl sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-green-700/40 bg-green-950/95 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit product' : 'Add new product'}
            </h2>
            <p className="mt-1 text-xs text-green-400">
              এখন সব product manually add ও edit করা হবে।
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-green-400 transition-colors hover:bg-green-800/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="flex items-center gap-2 rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={setField('isActive')}
              className="h-4 w-4 accent-gold-500"
            />
            <span className="text-sm text-green-300">Visible on storefront</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">Product name</label>
              <input value={form.name} onChange={setField('name')} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Bangla name</label>
              <input value={form.nameBn} onChange={setField('nameBn')} className="input-field font-bengali" required />
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={setField('description')}
              className="input-field resize-none"
              required
            />
          </div>

          <div>
            <label className="input-label">Product images</label>
            {existingImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {existingImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative h-16 w-16 overflow-hidden rounded-xl border border-green-700/40"
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setExistingImages((current) => current.filter((_, currentIndex) => currentIndex !== index))
                      }
                      className="absolute inset-0 flex items-center justify-center bg-red-950/85 text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-800 bg-green-950/30 px-4 py-5 transition-colors hover:border-gold-500/50 hover:bg-green-900/30">
              <Plus size={18} className="mb-2 text-green-400" />
              <span className="text-sm font-semibold text-white">Upload additional images</span>
              <span className="text-xs text-green-500">Maximum 4 images total</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const remaining = 4 - (existingImages.length + selectedFiles.length);
                  setSelectedFiles((current) => [...current, ...files.slice(0, remaining)]);
                }}
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="mt-3 rounded-2xl border border-green-800/40 bg-green-950/30 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-300">Pending uploads</p>
                <div className="flex flex-wrap gap-2 text-xs text-green-300">
                  {selectedFiles.map((file, index) => (
                    <span key={`${file.name}-${index}`} className="rounded-full bg-green-900/60 px-3 py-1">
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="input-label">Price per bag</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.pricePerBag}
                onChange={setField('pricePerBag')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Weight (kg)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.bagWeightKg}
                onChange={setField('bagWeightKg')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={setField('stock')}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Origin</label>
              <input value={form.origin} onChange={setField('origin')} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="input-label">Category</label>
            <select value={form.category} onChange={setField('category')} className="input-field">
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
            {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-950 border-t-transparent" />}
            {isEditing ? 'Save changes' : 'Create product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [upazilaFilter, setUpazilaFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productVisibility, setProductVisibility] = useState('all');

  const headers = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const responseHeaders = await headers();
      const response = await axios.get('/api/admin/stats', { headers: responseHeaders });
      setStats(response.data.data);
    } catch {
      toast.error('Dashboard stats load করা যায়নি');
    } finally {
      setLoadingStats(false);
    }
  }, [headers]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const responseHeaders = await headers();
      const response = await axios.get('/api/admin/products', { headers: responseHeaders });
      setProducts(response.data.data);
    } catch {
      toast.error('Products load করা যায়নি');
    } finally {
      setLoadingProducts(false);
    }
  }, [headers]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const responseHeaders = await headers();
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (upazilaFilter) params.set('upazila', upazilaFilter);

      const response = await axios.get(`/api/admin/orders?${params.toString()}`, {
        headers: responseHeaders,
      });
      setOrders(response.data.data);
    } catch {
      toast.error('Orders load করা যায়নি');
    } finally {
      setLoadingOrders(false);
    }
  }, [headers, statusFilter, upazilaFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
  }, [tab, fetchProducts, fetchOrders]);

  const refreshAll = async () => {
    await fetchStats();
    if (tab === 'products') await fetchProducts();
    if (tab === 'orders') await fetchOrders();
  };

  const updateStatus = async (id, status) => {
    try {
      const responseHeaders = await headers();
      await axios.put(`/api/admin/orders/${id}/status`, { status }, { headers: responseHeaders });
      toast.success(`Order marked as ${status}`);
      await Promise.all([fetchOrders(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Status update failed');
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`"${name}" কে storefront থেকে archive করতে চান?`)) {
      return;
    }

    try {
      const responseHeaders = await headers();
      await axios.delete(`/api/admin/products/${id}`, { headers: responseHeaders });
      toast.success('Product archived');
      await Promise.all([fetchProducts(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Product archive failed');
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = productSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.nameBn.toLowerCase().includes(query) ||
      product.origin.toLowerCase().includes(query);

    const matchesCategory = productCategory === 'All' || product.category === productCategory;
    const matchesVisibility =
      productVisibility === 'all' ||
      (productVisibility === 'active' && product.isActive) ||
      (productVisibility === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const overviewCards = stats
    ? [
        { label: 'Total orders', value: stats.totalOrders, icon: <ShoppingBag size={16} />, color: 'text-blue-300' },
        { label: 'Pending', value: stats.pendingOrders, icon: <Clock size={16} />, color: 'text-yellow-300' },
        { label: 'Delivered', value: stats.deliveredOrders, icon: <CheckCircle2 size={16} />, color: 'text-green-400' },
        { label: 'Active products', value: stats.totalProducts, icon: <Package size={16} />, color: 'text-gold-300' },
        { label: 'Low stock', value: stats.lowStockProducts, icon: <AlertTriangle size={16} />, color: 'text-red-300' },
        { label: 'Inventory bags', value: stats.inventoryBags, icon: <Warehouse size={16} />, color: 'text-cyan-300' },
        { label: 'Revenue', value: formatBDT(stats.totalRevenue), icon: <Boxes size={16} />, color: 'text-gold-300' },
        { label: 'Inventory value', value: formatBDT(stats.inventoryValue), icon: <Warehouse size={16} />, color: 'text-emerald-300' },
      ]
    : [];

  return (
    <div className="min-h-screen pt-14 sm:pt-16">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-start justify-between sm:mb-8">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-black text-white sm:text-3xl">
              <LayoutDashboard className="text-gold-400" size={28} />
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-green-400">
              MS SUMA TRADERS catalog, inventory, and order operations
            </p>
          </div>
          <button type="button" onClick={refreshAll} className="btn-secondary px-4 py-2.5 text-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-green-800/40 bg-green-900/40 p-1 sm:mb-8 sm:w-fit">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition-all sm:flex-none sm:px-5 sm:text-sm ${
                tab === item.id
                  ? 'bg-gold-500 text-green-950 shadow-lg'
                  : 'text-green-400 hover:bg-green-800/60 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="hidden text-[10px] opacity-70 sm:inline">({item.labelBn})</span>
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {loadingStats
                ? [...Array(8)].map((_, index) => <div key={index} className="card h-24 animate-pulse" />)
                : overviewCards.map((card) => (
                    <div key={card.label} className="card p-4">
                      <div className={`${card.color} mb-2`}>{card.icon}</div>
                      <div className="text-lg font-black text-white sm:text-xl">{card.value}</div>
                      <div className="mt-1 text-xs text-green-500">{card.label}</div>
                    </div>
                  ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="card p-5">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <MapPin size={18} className="text-gold-400" />
                  Orders by upazila
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(stats?.upazilaBreakdown || []).map((item) => (
                    <div key={item.upazila} className="rounded-2xl border border-green-800/40 bg-green-950/35 p-3">
                      <div className="text-sm font-semibold text-white">{item.upazila}</div>
                      <div className="mt-1 text-sm font-bold text-gold-300">{item._count.upazila} orders</div>
                      <div className="text-xs text-green-500">{formatBDT(item._sum.totalPrice || 0)}</div>
                    </div>
                  ))}
                  {!stats?.upazilaBreakdown?.length && (
                    <p className="text-sm text-green-500">No order data available yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="card p-5">
                  <h2 className="mb-4 text-lg font-bold text-white">Category breakdown</h2>
                  <div className="space-y-3">
                    {(stats?.categoryBreakdown || []).map((item) => (
                      <div key={item.category} className="flex items-center justify-between rounded-2xl border border-green-800/40 bg-green-950/35 px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.category}</div>
                          <div className="text-xs text-green-500">{item._sum.stock || 0} bags in stock</div>
                        </div>
                        <div className="text-sm font-bold text-gold-300">{item._count.category} SKUs</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <h2 className="mb-2 text-lg font-bold text-white">Manual catalog workflow</h2>
                  <p className="text-sm leading-6 text-green-400">
                    Hardcoded product template সরানো হয়েছে। এখন থেকে নতুন product শুধু admin panel দিয়েই add বা edit করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">
                Products ({filteredProducts.length}/{products.length})
              </h2>
              <div className="flex gap-2">
                <button type="button" onClick={fetchProducts} className="btn-secondary px-4 py-2.5 text-sm">
                  <RefreshCw size={15} />
                  Reload
                </button>
                <button type="button" onClick={() => setProductModal('new')} className="btn-primary px-4 py-2.5 text-sm">
                  <Plus size={15} />
                  Add product
                </button>
              </div>
            </div>

            <div className="card p-4">
              <div className="grid gap-3 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search by name, Bangla name, or origin"
                    className="input-field pl-11"
                  />
                </div>
                <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="input-field">
                  <option value="All">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select value={productVisibility} onChange={(event) => setProductVisibility(event.target.value)} className="input-field">
                  <option value="all">All visibility</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
            </div>

            {loadingProducts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="card h-20 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="card overflow-hidden overflow-x-auto">
                <table className="data-table min-w-[840px]">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Origin</th>
                      <th>Price</th>
                      <th>Weight</th>
                      <th>Stock</th>
                      <th>Orders</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                            <div>
                              <div className="font-semibold text-white">{product.name}</div>
                              <div className="font-bengali text-xs text-green-500">{product.nameBn}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="rounded-full bg-green-900/60 px-3 py-1 text-xs text-green-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="text-green-300">{product.origin}</td>
                        <td className="font-bold text-gold-300">{formatBDT(product.pricePerBag)}</td>
                        <td className="text-green-300">{product.bagWeightKg}kg</td>
                        <td>
                          <span className={product.stock <= 30 ? 'font-bold text-red-300' : 'text-green-300'}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="text-green-400">{product._count?.orders ?? 0}</td>
                        <td>
                          <span className={product.isActive ? 'badge-delivered' : 'badge-cancelled'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setProductModal(product)}
                              className="rounded-lg p-1.5 text-green-400 transition-all hover:bg-green-700/60 hover:text-white"
                              title="Edit product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product.id, product.name)}
                              className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-700/60 hover:text-white"
                              title="Archive product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredProducts.length && (
                  <p className="py-10 text-center text-green-500">No products match the current filters.</p>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field py-2 text-sm sm:w-auto">
                <option value="">All statuses</option>
                {STATUS_PIPELINE.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUSES[status]?.label}
                  </option>
                ))}
              </select>
              <select value={upazilaFilter} onChange={(event) => setUpazilaFilter(event.target.value)} className="input-field py-2 text-sm sm:w-auto">
                <option value="">All upazilas</option>
                {BRAHMANBARIA_UPAZILAS.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
              <button type="button" onClick={fetchOrders} className="btn-secondary px-4 py-2.5 text-sm">
                <RefreshCw size={15} />
                Apply filters
              </button>
            </div>

            {loadingOrders ? (
              <div className="card p-8 text-center text-green-500">Loading orders...</div>
            ) : (
              <div className="card overflow-hidden overflow-x-auto">
                <table className="data-table min-w-[860px]">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Upazila</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono text-xs text-gold-400">{order.orderNumber}</td>
                        <td>
                          <div>
                            <div className="text-sm font-semibold text-white">{order.customerName}</div>
                            <div className="text-xs text-green-500">{order.phone}</div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <img src={order.product?.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                            <div>
                              <div className="text-sm text-green-200">{order.product?.name}</div>
                              <div className="font-bengali text-[11px] text-green-500">{order.product?.nameBn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-green-300">{order.quantity}</td>
                        <td className="font-bold text-gold-300">{formatBDT(order.totalPrice)}</td>
                        <td className="text-xs text-green-300">{order.upazila}</td>
                        <td className="text-xs text-green-400">{order.paymentMethod.replace(/_/g, ' ')}</td>
                        <td className="text-xs text-green-500">
                          {new Date(order.createdAt).toLocaleDateString('en-BD')}
                        </td>
                        <td>
                          <span className={ORDER_STATUSES[order.status]?.cls || 'badge-pending'}>
                            {ORDER_STATUSES[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-0.5">
                            {order.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'CONFIRMED')}
                                className="rounded-lg p-1.5 text-blue-400 transition-all hover:bg-blue-700/50 hover:text-white"
                                title="Confirm"
                              >
                                <Eye size={13} />
                              </button>
                            )}
                            {['PENDING', 'CONFIRMED'].includes(order.status) && (
                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'PROCESSING')}
                                className="rounded-lg p-1.5 text-purple-400 transition-all hover:bg-purple-700/50 hover:text-white"
                                title="Mark as processing"
                              >
                                <Truck size={13} />
                              </button>
                            )}
                            {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                className="rounded-lg p-1.5 text-green-400 transition-all hover:bg-green-700/50 hover:text-white"
                                title="Mark as delivered"
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}
                            {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                              <button
                                type="button"
                                onClick={() => updateStatus(order.id, 'CANCELLED')}
                                className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-700/50 hover:text-white"
                                title="Cancel order"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!orders.length && <p className="py-10 text-center text-green-500">No orders found.</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {productModal && (
        <ProductModal
          product={productModal === 'new' ? null : productModal}
          onClose={() => setProductModal(null)}
          onSave={async () => {
            await Promise.all([fetchProducts(), fetchStats()]);
          }}
        />
      )}
    </div>
  );
}
