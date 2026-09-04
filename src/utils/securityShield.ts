/**
 * Yolnoma Cyber Security Shield & Lockdown Manager
 * Handles real-time DDoS/DRDoS IP Ban detection, Anti-VPN filtering,
 * and Site Maintenance Mode with Owner Whitelist.
 */

export interface IpSecurityStatus {
  ip: string;
  banned: boolean;
  banReason?: string;
  attackType?: string;
  bannedAt?: number;
  unbanAt?: number;
  banInfo?: {
    reason: string;
    bannedAt: number;
    unbanAt: number;
    attackType?: string;
  } | null;
  isVpn: boolean;
  vpnReason?: string;
  antiVpnEnabled?: boolean;
  maintenance?: {
    active: boolean;
    title: string;
    message: string;
    estimatedTime: string;
    whitelistEmails: string[];
    updatedAt: number;
  };
}

export const OWNER_WHITELIST_EMAILS = [
  'yuldashivagavharoy@gmail.com',
  'elbek@yolnoma.uz'
];

export function isUserInMaintenanceWhitelist(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'yuldashivagavharoy@gmail.com' ||
    normalized.startsWith('yuldashivagavharoy') ||
    normalized.includes('yuldashivagavharoy') ||
    OWNER_WHITELIST_EMAILS.includes(normalized)
  );
}

/**
 * Detect client-side VPN / Proxy tunnels via WebRTC ICE candidate parsing
 */
export async function detectWebRtcVpn(): Promise<{ isVpn: boolean; reason?: string }> {
  if (typeof window === 'undefined' || !(window as any).RTCPeerConnection) {
    return { isVpn: false };
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ isVpn: false });
      }
    }, 1500);

    try {
      const rtc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      rtc.createDataChannel('yolnoma_guard');
      rtc.createOffer()
        .then((offer) => rtc.setLocalDescription(offer))
        .catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve({ isVpn: false });
          }
        });

      rtc.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        const cand = event.candidate.candidate;

        // Check for typical VPN virtual adapters (tun0, tap0, 10.8.x, 10.0.x, wireguard)
        if (
          cand.includes('10.8.') ||
          cand.includes('10.9.') ||
          cand.includes('10.14.') ||
          cand.includes('10.0.0.') ||
          cand.includes('.tunnel.')
        ) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            try { rtc.close(); } catch {}
            resolve({ isVpn: true, reason: 'Virtual VPN adapteri (WebRTC) aniqlandi' });
          }
        }
      };
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ isVpn: false });
      }
    }
  });
}

/**
 * Fetch authoritative security status from backend
 */
export async function fetchIpSecurityStatus(): Promise<IpSecurityStatus | null> {
  try {
    const res = await fetch('/api/security/my-ip-status');
    if (!res.ok && res.status === 403) {
      // 403 means IP is banned!
      const errorData = await res.json().catch(() => null);
      const reason = errorData?.reason || "DDoS / DRDoS hujumi yoki noqonuniy so'rovlar sababli bloklangan";
      const bannedAt = errorData?.bannedAt || Date.now();
      const unbanAt = errorData?.unbanAt || Date.now() + 86400000;
      const attackType = errorData?.attackType || 'DDoS / DRDoS Hujumi';

      return {
        ip: errorData?.ip || 'Aniqlangan IP',
        banned: true,
        banReason: reason,
        attackType,
        bannedAt,
        unbanAt,
        banInfo: {
          reason,
          bannedAt,
          unbanAt,
          attackType
        },
        isVpn: false
      };
    }
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (data.banInfo) {
          data.banReason = data.banInfo.reason;
          data.attackType = data.banInfo.attackType;
          data.bannedAt = data.banInfo.bannedAt;
          data.unbanAt = data.banInfo.unbanAt;
        }
        return data;
      }
    }
  } catch {
    // In preview/offline mode
  }
  return null;
}
