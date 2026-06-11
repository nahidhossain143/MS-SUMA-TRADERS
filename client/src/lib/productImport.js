export const PRODUCT_IMPORT_COLUMNS = [
  {
    key: 'name',
    label: 'Product name',
    required: true,
    example: 'Premium Miniket Rice',
    note: 'Use a unique English catalog name.',
  },
  {
    key: 'nameBn',
    label: 'Bangla name',
    required: true,
    example: 'Premium Miniket Chal',
    note: 'Shown as the Bengali product label on the storefront.',
  },
  {
    key: 'description',
    label: 'Description',
    required: true,
    example: 'Soft texture, low broken grain, ideal for daily family meals.',
    note: 'Short selling description for customers.',
  },
  {
    key: 'pricePerBag',
    label: 'Price per bag',
    required: true,
    example: 3250,
    note: 'Numeric BDT value only.',
  },
  {
    key: 'stock',
    label: 'Stock',
    required: true,
    example: 48,
    note: 'Number of bags available right now.',
  },
  {
    key: 'bagWeightKg',
    label: 'Weight in kg',
    required: false,
    example: 25,
    note: 'Optional. Defaults to 25 when blank.',
  },
  {
    key: 'category',
    label: 'Category',
    required: false,
    example: 'Fine Rice',
    note: 'Optional catalog category.',
  },
  {
    key: 'origin',
    label: 'Origin',
    required: false,
    example: 'Dinajpur, Bangladesh',
    note: 'Optional sourcing location.',
  },
  {
    key: 'imageUrl',
    label: 'Primary image URL',
    required: false,
    example: 'https://example.com/miniket-main.jpg',
    note: 'Optional hero image. If blank, the default placeholder is used.',
  },
  {
    key: 'imageUrls',
    label: 'Additional image URLs',
    required: false,
    example: 'https://example.com/miniket-1.jpg|https://example.com/miniket-2.jpg',
    note: 'Separate multiple image URLs with the | character.',
  },
  {
    key: 'isActive',
    label: 'Visible on storefront',
    required: false,
    example: 'true',
    note: 'Use true or false. Blank defaults to true.',
  },
];

export const PRODUCT_IMPORT_REQUIRED_KEYS = PRODUCT_IMPORT_COLUMNS.filter((column) => column.required).map(
  (column) => column.key,
);

export const PRODUCT_IMPORT_SAMPLE_ROWS = [
  {
    name: 'Premium Miniket Rice',
    nameBn: 'Premium Miniket Chal',
    description: 'Soft texture, polished grain, and dependable everyday quality.',
    pricePerBag: 3250,
    stock: 48,
    bagWeightKg: 25,
    category: 'Fine Rice',
    origin: 'Dinajpur, Bangladesh',
    imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&q=80',
    imageUrls:
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=900&q=80|https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=80',
    isActive: 'true',
  },
  {
    name: 'Nazirshail Gold',
    nameBn: 'Nazirshail Gold',
    description: 'Premium aromatic rice suited for special meals and festive orders.',
    pricePerBag: 3650,
    stock: 24,
    bagWeightKg: 25,
    category: 'Premium Rice',
    origin: 'Kushtia, Bangladesh',
    imageUrl: 'https://images.unsplash.com/photo-1536304447766-da0ed4ce1b73?w=900&q=80',
    imageUrls: '',
    isActive: 'true',
  },
];

const PRODUCT_IMPORT_HEADER_ALIASES = new Map(
  [
    ['name', 'name'],
    ['productname', 'name'],
    ['englishname', 'name'],
    ['namebn', 'nameBn'],
    ['banglaname', 'nameBn'],
    ['bengaliname', 'nameBn'],
    ['description', 'description'],
    ['details', 'description'],
    ['priceperbag', 'pricePerBag'],
    ['price', 'pricePerBag'],
    ['bagweightkg', 'bagWeightKg'],
    ['weightkg', 'bagWeightKg'],
    ['weight', 'bagWeightKg'],
    ['stock', 'stock'],
    ['quantity', 'stock'],
    ['category', 'category'],
    ['origin', 'origin'],
    ['imageurl', 'imageUrl'],
    ['image', 'imageUrl'],
    ['primaryimageurl', 'imageUrl'],
    ['imageurls', 'imageUrls'],
    ['images', 'imageUrls'],
    ['gallery', 'imageUrls'],
    ['isactive', 'isActive'],
    ['active', 'isActive'],
    ['visible', 'isActive'],
  ].map(([header, key]) => [header, key]),
);

function normalizeHeaderKey(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeCellValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value).trim();
}

function rowHasImportValue(row) {
  return PRODUCT_IMPORT_COLUMNS.some((column) => {
    const value = row[column.key];
    return value !== undefined && value !== null && value !== '';
  });
}

function isSupportedBooleanValue(value) {
  if (value === '' || value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'boolean') {
    return true;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['true', 'false', 'yes', 'no', '1', '0', 'active', 'inactive', 'visible', 'hidden'].includes(
    normalized,
  );
}

export function normalizeImportedRows(rows) {
  return rows
    .map((row, index) => {
      const normalizedRow = {
        sourceRow: Number.isInteger(row?.__rowNum__) ? row.__rowNum__ + 1 : index + 2,
      };

      Object.entries(row || {}).forEach(([header, value]) => {
        if (header === '__rowNum__') {
          return;
        }

        const mappedKey = PRODUCT_IMPORT_HEADER_ALIASES.get(normalizeHeaderKey(header));
        if (mappedKey) {
          normalizedRow[mappedKey] = normalizeCellValue(value);
        }
      });

      return normalizedRow;
    })
    .filter(rowHasImportValue);
}

export function getImportRowIssues(row) {
  const issues = [];

  PRODUCT_IMPORT_REQUIRED_KEYS.forEach((key) => {
    if (row[key] === undefined || row[key] === null || row[key] === '') {
      issues.push(`${key} is required`);
    }
  });

  if (row.pricePerBag !== undefined && row.pricePerBag !== '' && (!Number.isFinite(Number(row.pricePerBag)) || Number(row.pricePerBag) <= 0)) {
    issues.push('pricePerBag must be a positive number');
  }

  if (row.stock !== undefined && row.stock !== '' && (!Number.isInteger(Number(row.stock)) || Number(row.stock) < 0)) {
    issues.push('stock must be a non-negative integer');
  }

  if (
    row.bagWeightKg !== undefined &&
    row.bagWeightKg !== '' &&
    (!Number.isInteger(Number(row.bagWeightKg)) || Number(row.bagWeightKg) <= 0)
  ) {
    issues.push('bagWeightKg must be a positive integer');
  }

  if (!isSupportedBooleanValue(row.isActive)) {
    issues.push('isActive must be true or false');
  }

  return issues;
}

export function buildTemplateRows() {
  return PRODUCT_IMPORT_SAMPLE_ROWS.map((row) =>
    PRODUCT_IMPORT_COLUMNS.reduce((result, column) => {
      result[column.key] = row[column.key] ?? '';
      return result;
    }, {}),
  );
}
