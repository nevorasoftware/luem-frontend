import { useState, useEffect } from 'react';

export interface PublicSettings {
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours?: string;
  defaultSecurityDeposit?: number;
  depositAmount?: number;
}

let cachedSettings: PublicSettings | null = null;
let pendingPromise: Promise<PublicSettings> | null = null;

export function fetchPublicSettings(): Promise<PublicSettings> {
  if (cachedSettings) {
    return Promise.resolve(cachedSettings);
  }
  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = fetch('/api/settings/public')
    .then((res) => (res.ok ? res.json() : ({} as any)))
    .then((data: any) => {
      const bInfo = data.business_info || {};
      const rPolicy = data.rental_policy || {};
      const parsed: PublicSettings = {
        businessName: data.businessName || bInfo.companyName || 'LUEM RENT A CAR',
        email: data.email || bInfo.email || '',
        phone: data.phone || bInfo.phone || '',
        whatsapp: data.whatsapp || bInfo.whatsapp || '',
        address: data.address || bInfo.address || '',
        hours: bInfo.hours || 'Lunes a Domingo: 7:00 AM - 9:00 PM',
        defaultSecurityDeposit: data.defaultSecurityDeposit ?? rPolicy.depositAmount ?? 400,
        depositAmount: data.depositAmount ?? rPolicy.depositAmount ?? 400,
      };
      cachedSettings = parsed;
      pendingPromise = null;
      return parsed;
    })
    .catch(() => {
      const fallback: PublicSettings = {
        businessName: 'LUEM RENT A CAR',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        hours: '',
      };
      pendingPromise = null;
      return fallback;
    });

  return pendingPromise;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(
    cachedSettings || {
      businessName: 'LUEM RENT A CAR',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      hours: '',
    },
  );
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    fetchPublicSettings().then((res) => {
      setSettings(res);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
