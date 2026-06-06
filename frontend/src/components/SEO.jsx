import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://dms-live.azurewebsites.net';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_NAME = 'DMS - Distribution Management System';

const FALLBACK_DESCRIPTION =
  'All-in-one Distribution Management System for wholesalers and distributors. Manage companies, products, retailers, orders, sales, payments, stock and reports in one place.';

export const SEO_CONFIG = {
  default: {
    title: 'DMS - Distribution Management System | Sales, Stock & Order Software',
    description: FALLBACK_DESCRIPTION,
    keywords:
      'distribution management system, DMS, wholesale distribution software, inventory management, order management, sales tracking, retailer management, stock management, Bangladesh distribution software, distributor app',
    path: '/',
    type: 'website',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/': {
    title: 'DMS - Distribution Management System | Sales, Stock & Order Software',
    description:
      'DMS is an all-in-one Distribution Management System for wholesalers and distributors. Manage companies, products, retailers, orders, sales, payments, stock and reports in one place. Built for Bangladesh & South Asia.',
    keywords:
      'distribution management system, DMS, wholesale distribution software, inventory management, retailer management, order management, sales tracking, stock management, Bangladesh DMS',
    path: '/',
  },
  '/demo': {
    title: 'DMS Demo - See the Distribution Management System in Action',
    description:
      'Try the DMS Distribution Management System demo. Explore products, retailers, orders, sales, stock, payments and reports modules with sample data.',
    keywords: 'DMS demo, distribution management demo, DMS trial, ERP demo Bangladesh',
    path: '/demo',
  },
  '/login': {
    title: 'Login - DMS Distribution Management System',
    description:
      'Sign in to your DMS Distribution Management System account. Manage your distribution business with sales, stock, orders and reports.',
    keywords: 'DMS login, distribution management login',
    path: '/login',
    noindex: true,
  },
  '/register': {
    title: 'Register - Start Using DMS Distribution Management',
    description:
      'Create your DMS account and start managing your distribution business. Companies, products, retailers, orders, sales, stock and reports in one place.',
    keywords: 'DMS register, distribution management signup',
    path: '/register',
  },
  '/reset-password': {
    title: 'Reset Password - DMS Distribution Management',
    description: 'Reset your DMS account password to regain access to your distribution business data.',
    keywords: 'DMS reset password',
    path: '/reset-password',
    noindex: true,
  },
  '/public-chat': {
    title: 'Public Chat - DMS Community',
    description: 'Join the DMS Distribution Management System public chat to connect with other distributors and share best practices.',
    keywords: 'DMS community, distribution management community chat',
    path: '/public-chat',
  },
  '/dashboard': {
    title: 'Dashboard - DMS Distribution Management',
    description: 'DMS dashboard with sales, stock, orders, payments and reports overview.',
    path: '/dashboard',
    noindex: true,
  },
  '/companies': {
    title: 'Companies & Branches - DMS',
    description: 'Manage multiple companies and branches from one DMS dashboard.',
    path: '/companies',
    noindex: true,
  },
  '/products': {
    title: 'Products & Catalog - DMS',
    description: 'Manage your product catalog, prices and stock levels with DMS.',
    path: '/products',
    noindex: true,
  },
  '/retailers': {
    title: 'Retailers & Customers - DMS',
    description: 'Manage retailers, customer accounts, dues and order history in DMS.',
    path: '/retailers',
    noindex: true,
  },
  '/orders': {
    title: 'Orders - DMS Distribution Management',
    description: 'Create and track orders for your distribution business with DMS.',
    path: '/orders',
    noindex: true,
  },
  '/sales': {
    title: 'Sales & Invoices - DMS',
    description: 'Record sales, generate invoices and track revenue in DMS.',
    path: '/sales',
    noindex: true,
  },
  '/payments': {
    title: 'Payments & Dues - DMS',
    description: 'Track payments, collections and outstanding dues across retailers in DMS.',
    path: '/payments',
    noindex: true,
  },
  '/stock': {
    title: 'Stock & Inventory - DMS',
    description: 'Real-time stock tracking, low-stock alerts and inventory control in DMS.',
    path: '/stock',
    noindex: true,
  },
  '/reports': {
    title: 'Reports & Analytics - DMS',
    description: 'Sales, payment and stock reports to make better business decisions with DMS.',
    path: '/reports',
    noindex: true,
  },
  '/users': {
    title: 'Team & Users - DMS',
    description: 'Manage team members and permissions for your DMS account.',
    path: '/users',
    noindex: true,
  },
  '/settings': {
    title: 'Settings - DMS Distribution Management',
    description: 'Configure your DMS account, profile and preferences.',
    path: '/settings',
    noindex: true,
  },
  '/messages': {
    title: 'Messages - DMS',
    description: 'Internal messages for your distribution team in DMS.',
    path: '/messages',
    noindex: true,
  },
  '/notices': {
    title: 'Notices & Announcements - DMS',
    description: 'Notices and announcements from your DMS Distribution Management System.',
    path: '/notices',
    noindex: true,
  },
};

export function getSeoForPath(pathname) {
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  return SEO_CONFIG[cleanPath] || { ...SEO_CONFIG.default, path: cleanPath };
}

export default function SEO({
  title,
  description,
  keywords,
  path,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title || SEO_CONFIG.default.title;
  const finalDescription = description || FALLBACK_DESCRIPTION;
  const finalKeywords = keywords || SEO_CONFIG.default.keywords;
  const finalPath = path || '/';
  const url = `${SITE_URL}${finalPath.startsWith('/') ? finalPath : `/${finalPath}`}`;
  const robots = noindex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="bn_BD" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      <link rel="alternate" hreflang="en" href={`${SITE_URL}${finalPath}`} />
      <link rel="alternate" hreflang="bn" href={`${SITE_URL}${finalPath}?lang=bn`} />
      <link rel="alternate" hreflang="x-default" href={`${SITE_URL}${finalPath}`} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
