export const BRAHMANBARIA_UPAZILAS = [
  'Brahmanbaria Sadar',
  'Ashuganj',
  'Sarail',
  'Bancharampur',
  'Kasba',
  'Nabinagar',
  'Nasirnagar',
  'Bijoynagar',
  'Akhaura',
];

export const PAYMENT_METHODS = [
  {
    id: 'BKASH',
    label: 'bKash',
    labelBn: 'বিকাশ',
    color: 'text-pink-400',
    icon: '💳',
    description: 'অর্ডার কনফার্ম হওয়ার পর আমাদের বিকাশ নম্বরে পেমেন্ট পাঠাতে পারবেন।',
  },
  {
    id: 'NAGAD',
    label: 'Nagad',
    labelBn: 'নগদ',
    color: 'text-orange-400',
    icon: '📱',
    description: 'অর্ডার কনফার্ম হওয়ার পর আমাদের নগদ নম্বরে পেমেন্ট পাঠাতে পারবেন।',
  },
  {
    id: 'CASH_ON_DELIVERY',
    label: 'Cash on Delivery',
    labelBn: 'ডেলিভারির সময় নগদ',
    color: 'text-green-400',
    icon: '💵',
    description: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে ক্যাশে পেমেন্ট করুন।',
  },
];

export const ORDER_STATUSES = {
  PENDING: {
    label: 'Pending',
    labelBn: 'অপেক্ষমাণ',
    cls: 'badge-pending',
  },
  CONFIRMED: {
    label: 'Confirmed',
    labelBn: 'নিশ্চিত',
    cls: 'badge-confirmed',
  },
  PROCESSING: {
    label: 'Processing',
    labelBn: 'প্রসেসিং',
    cls: 'badge-processing',
  },
  DELIVERED: {
    label: 'Delivered',
    labelBn: 'ডেলিভারি সম্পন্ন',
    cls: 'badge-delivered',
  },
  CANCELLED: {
    label: 'Cancelled',
    labelBn: 'বাতিল',
    cls: 'badge-cancelled',
  },
};

export const CATEGORIES = [
  'Fine Rice',
  'Aromatic Rice',
  'Common Rice',
  'Parboiled Rice',
  'Health Rice',
];

export const PRODUCT_SORT_OPTIONS = [
  { id: 'featured', label: 'Featured', labelBn: 'বাছাইকৃত' },
  { id: 'price-asc', label: 'Price: Low to High', labelBn: 'দাম কম থেকে বেশি' },
  { id: 'price-desc', label: 'Price: High to Low', labelBn: 'দাম বেশি থেকে কম' },
  { id: 'name-asc', label: 'Name: A to Z', labelBn: 'নাম অনুযায়ী' },
  { id: 'stock-desc', label: 'Stock: High to Low', labelBn: 'স্টক বেশি আগে' },
];

export const AVAILABILITY_OPTIONS = [
  { id: 'all', label: 'All Products', labelBn: 'সব পণ্য' },
  { id: 'in-stock', label: 'In Stock', labelBn: 'স্টকে আছে' },
  { id: 'low-stock', label: 'Low Stock', labelBn: 'কম স্টক' },
  { id: 'out-of-stock', label: 'Out of Stock', labelBn: 'স্টক শেষ' },
];

export const LOW_STOCK_THRESHOLD = 30;

export const formatBDT = (amount) =>
  `৳${Number(amount || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
