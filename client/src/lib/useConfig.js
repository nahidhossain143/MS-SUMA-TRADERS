import { useState, useEffect } from 'react';
import axios from './axios.js';

const DEFAULT_CONFIG = {
  businessName: 'MS SUMA TRADERS',
  district: 'Brahmanbaria',
  deliveryArea: 'All 9 upazilas of Brahmanbaria district',
  wholesaleMinimumBags: 10,
  supportHours: '9:00 AM - 9:00 PM',
  bkashNumber: '01XXXXXXXXX',
  nagadNumber: '01XXXXXXXXX',
  whatsapp: '01XXXXXXXXX',
  phone: '01XXXXXXXXX',
  upazilas: [
    'Brahmanbaria Sadar',
    'Ashuganj',
    'Sarail',
    'Bancharampur',
    'Kasba',
    'Nabinagar',
    'Nasirnagar',
    'Bijoynagar',
    'Akhaura',
  ],
};

let cachedConfig = null;

export function useConfig() {
  const [config, setConfig] = useState(cachedConfig || DEFAULT_CONFIG);

  useEffect(() => {
    if (cachedConfig) {
      return;
    }

    axios
      .get('/api/config')
      .then((res) => {
        cachedConfig = res.data;
        setConfig(res.data);
      })
      .catch(() => {
        setConfig(DEFAULT_CONFIG);
      });
  }, []);

  return config;
}
