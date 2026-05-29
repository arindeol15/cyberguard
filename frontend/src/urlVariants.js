const URL_PATTERN = /https?:\/\/[^\s"'<>),]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s"'<>),]*)?/i;

const SUSPICIOUS_DOMAIN_POOLS = {
  email: [
    'account-review-center.com',
    'secure-message-verify.net',
    'identity-check-portal.co',
    'mailbox-session-review.com',
    'document-access-gateway.net',
  ],
  website: [
    'account-session-check.net',
    'secure-login-review.com',
    'client-auth-gateway.co',
    'id-verify-portal.net',
    'support-access-center.com',
  ],
  qr: [
    'scan-service-check.com',
    'mobile-qr-verify.net',
    'quick-register-pass.co',
    'qr-access-review.com',
    'guest-connect-portal.net',
  ],
  browser_exploit: [
    'browser-secure-update.net',
    'captcha-device-check.com',
    'chrome-component-fix.co',
    'web-codec-update.net',
    'secure-update-center.com',
  ],
  dns: [
    'portal.company.com',
    'intranet.company.com',
    'files.company.com',
    'sso.company.com',
    'hr.company.com',
  ],
  smishing: [
    'parcel-release-help.com',
    'delivery-fee-check.net',
    'track-confirm.co',
    'mobile-claim-center.com',
    'secure-bank-review.co',
  ],
};

const BRAND_DOMAIN_POOLS = [
  {
    match: /amazon|amaz0n|order/i,
    domains: ['amaz0n-account-check.com', 'amazon-order-review.net', 'amzn-secure-id.co', 'prime-delivery-verify.com'],
  },
  {
    match: /microsoft|office|365|password|sso|teams/i,
    domains: ['microsoft365-verify-login.net', 'office-session-review.com', 'msft-security-check.co', 'o365-access-gateway.net'],
  },
  {
    match: /chase|bank|card|sim swap|fraud/i,
    domains: ['chase-account-review.net', 'secure-chase-auth.com', 'bank-id-confirm.co', 'mobile-bank-review.net'],
  },
  {
    match: /\bhr\b|payroll|benefits|employee/i,
    domains: ['benefits-company-login.net', 'payroll-verify-center.com', 'hr-session-review.co', 'employee-id-portal.net'],
  },
  {
    match: /parcel|delivery|package|shipping|carrier/i,
    domains: ['parcel-release-help.com', 'ship-track-confirm.net', 'delivery-fee-check.co', 'carrier-update-review.com'],
  },
  {
    match: /wifi|guest|airport|cafe|coffee/i,
    domains: ['guest-wifi-connect.net', 'free-wifi-login.co', 'cafe-connect-verify.com', 'airport-access-pass.net'],
  },
  {
    match: /captcha|browser|chrome|update|codec/i,
    domains: ['browser-secure-update.net', 'captcha-device-check.com', 'chrome-component-fix.co', 'web-codec-update.net'],
  },
];

const CATEGORY_PATHS = {
  email: ['/secure', '/verify', '/document', '/account/review', '/signin'],
  website: ['/login', '/signin', '/oauth', '/account/verify', '/secure'],
  qr: ['/scan', '/connect', '/register', '/mobile/verify', '/pay'],
  browser_exploit: ['/captcha', '/component/check', '/update', '/verify', '/codec/install'],
  dns: ['/login', '/portal', '/sso', '/secure', '/dashboard'],
  smishing: ['/track', '/pay', '/confirm', '/identity/review', '/release'],
};

function stableIndex(value, length) {
  if (!length) return 0;
  const source = String(value || 'cyberguard-url');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

function firstUrl(value) {
  const match = String(value || '').match(URL_PATTERN);
  return match ? match[0] : '';
}

function hasUrl(value) {
  return Boolean(firstUrl(value));
}

function normalizeUrl(rawUrl, fallback) {
  const raw = firstUrl(rawUrl) || firstUrl(fallback) || fallback || 'https://account-review-center.com/login';
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate);
  } catch {
    return new URL('https://account-review-center.com/login');
  }
}

function domainPoolFor(category, context) {
  const brandPool = BRAND_DOMAIN_POOLS.find(pool => pool.match.test(context || ''));
  return brandPool?.domains || SUSPICIOUS_DOMAIN_POOLS[category] || SUSPICIOUS_DOMAIN_POOLS.email;
}

function pathFor(category, parsed, seed) {
  const cleanPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
  const pool = CATEGORY_PATHS[category] || CATEGORY_PATHS.email;
  if (cleanPath && cleanPath.length < 42) return cleanPath;
  return pool[stableIndex(`${seed}-path`, pool.length)];
}

function variantUrl(rawUrl, { category, scenario, field, fallback } = {}) {
  const context = [
    category,
    field,
    scenario?.subject,
    scenario?.type,
    scenario?.body,
    rawUrl,
    JSON.stringify(scenario?.extra_data || {}),
  ].join(' ');
  const seed = `${category}-${field}-${scenario?.id || ''}-${scenario?.subject || ''}-${scenario?.difficulty || ''}`;
  const parsed = normalizeUrl(rawUrl, fallback);
  const domains = domainPoolFor(category, context);
  const domain = domains[stableIndex(`${seed}-domain`, domains.length)];
  const protocol = parsed.protocol === 'http:' ? 'http:' : 'https:';
  const path = pathFor(category, parsed, seed);
  const session = 1000 + stableIndex(`${seed}-session`, 8000);

  return `${protocol}//${domain}${path}?case=${session}`;
}

function replaceUrlInText(text, originalUrl, replacement) {
  const source = String(text || '');
  if (!source || !replacement) return source;
  const original = firstUrl(originalUrl);
  if (original && source.includes(original)) return source.replace(original, replacement);
  return source.replace(URL_PATTERN, replacement);
}

function variantFromFields(extra, fields, category, scenario, fallback) {
  const source = fields.map(field => extra[field]).find(hasUrl) || fallback;
  return variantUrl(source, { category, scenario, field: fields[0], fallback });
}

function withMessageUrl(extra, scenario, category, url) {
  const next = { ...extra, dynamic_url: url };
  if (next.message) next.message = replaceUrlInText(next.message, firstUrl(next.message) || url, url);
  const body = replaceUrlInText(scenario.body, firstUrl(scenario.body) || url, url);
  return { extra: next, body };
}

export function withUrlVariants(scenario, category) {
  if (!scenario) return scenario;
  const extra = { ...(scenario.extra_data || {}) };
  let body = scenario.body || '';

  if (category === 'website') {
    const url = variantFromFields(extra, ['fake_url', 'url', 'requested_domain'], category, scenario, 'https://secure-login-review.com/login');
    extra.fake_url = url;
    extra.url = url;
    extra.dynamic_url = url;
    body = replaceUrlInText(body, scenario.extra_data?.fake_url || scenario.extra_data?.url || url, url);
  } else if (category === 'qr') {
    const url = variantFromFields(extra, ['actual_destination', 'qr_url', 'destination_url', 'url'], category, scenario, 'https://scan-service-check.com/mobile/verify');
    extra.actual_destination = url;
    extra.qr_url = url;
    extra.destination_url = url;
    extra.dynamic_url = url;
    body = replaceUrlInText(body, scenario.extra_data?.actual_destination || scenario.extra_data?.qr_url || scenario.extra_data?.destination_url || url, url);
  } else if (category === 'browser_exploit') {
    const url = variantFromFields(extra, ['url', 'source_url'], category, scenario, 'https://browser-secure-update.net/captcha');
    extra.url = url;
    extra.dynamic_url = url;
    body = replaceUrlInText(body, scenario.extra_data?.url || url, url);
  } else if (category === 'dns') {
    const url = variantFromFields(extra, ['requested_domain', 'url'], category, scenario, 'https://intranet.company.com/login');
    extra.requested_domain = url;
    extra.dynamic_url = url;
    body = replaceUrlInText(body, scenario.extra_data?.requested_domain || url, url);
  } else if (category === 'smishing') {
    const url = variantFromFields(extra, ['short_url', 'url'], category, scenario, 'https://parcel-release-help.com/pay');
    extra.short_url = url;
    extra.url = url;
    const withMessage = withMessageUrl(extra, scenario, category, url);
    Object.assign(extra, withMessage.extra);
    body = withMessage.body;
  } else if (category === 'email') {
    const original = firstUrl(body);
    const url = variantUrl(original, { category, scenario, field: 'body', fallback: 'https://account-review-center.com/verify' });
    extra.dynamic_url = url;
    body = replaceUrlInText(body, original || url, url);
  }

  return {
    ...scenario,
    body,
    extra_data: extra,
  };
}
