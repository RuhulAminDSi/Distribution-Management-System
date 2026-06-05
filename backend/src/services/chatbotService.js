import { query } from '../config/database.js';

const workflows = {
  upload_document: [
    'Log in to your DMS account.',
    'Click the "Upload" button on the dashboard.',
    'Select your file (PDF, DOCX, XLSX, or image formats supported).',
    'Fill in the document title and select a category.',
    'Add any optional tags or notes.',
    'Click "Submit" — your document will appear in My Documents.',
  ],
  search_document: [
    'Go to the Documents or Search section from the sidebar.',
    'Type your search terms (title, tags, or content).',
    'Use filters to narrow results by date, file type, or status.',
    'Browse the results and click a document to preview it.',
  ],
  approve_document: [
    'Go to the Pending Approvals section.',
    'Review the document details and preview the file.',
    'Click "Approve" or "Reject".',
    'If rejecting, optionally add a comment with the reason.',
    'The document status updates and the uploader is notified.',
  ],
  download_document: [
    'Navigate to the document you want to download.',
    'Click the document title or preview button.',
    'In the preview pane, click the "Download" button.',
    'The file will be saved to your computer.',
  ],
  share_document: [
    'Open the document you want to share.',
    'Click the "Share" button.',
    "Enter the recipient's email address or username.",
    'Choose whether they can view, comment, or edit.',
    'Add an optional message.',
    'Click "Send" — the recipient gets a notification.',
  ],
};

function guideUser(workflow) {
  const steps = workflows[workflow];
  if (!steps) return `No guide found for "${workflow}".`;
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

const intents = {
  todaySales: {
    keywords: ['today sales', 'today sale', 'today sold', 'today earning', 'today invoice', 'daily sales', 'daily sale', 'today sal', 'todai sal', 'আজকের বিক্রয়', 'আজকের বিক্রি', 'আজকের সেলস', 'আজ কত বিক্রি', 'আজকের ইনভয়েস', 'আজকের আয়', 'আজকে বিক্রয়', 'আজকের সেল'],
    sql: async () => {
      const today = new Date().toISOString().split('T')[0];
      const rows = await query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount, COALESCE(SUM(paid_amount), 0) as collected FROM invoices WHERE invoice_date = ?`, [today]);
      return rows[0];
    },
    response: (data) => `আজকের বিক্রয়: ${data.count}টি ইনভয়েস, মোট ${data.amount} টাকা, কালেকশন ${data.collected} টাকা।`
  },
  lowStock: {
    keywords: ['low stock', 'stock alert', 'low inventory', 'running out', 'stock low', 'out of stock', 'low stok', 'lw stock', 'stoack', 'sock low', 'লো স্টক', 'স্টক শেষ', 'স্টক কম', 'পণ্য শেষ', 'কম স্টক', 'স্টক অ্যালার্ট', 'লো সটক', 'ল স্টক'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND stock_quantity <= low_stock_alert`);
      const products = await query(`SELECT name, stock_quantity, low_stock_alert, unit FROM products WHERE is_active = 1 AND stock_quantity <= low_stock_alert ORDER BY stock_quantity ASC LIMIT 5`);
      return { count: rows[0].count, products };
    },
    response: (data) => {
      let msg = `${data.count}টি পণ্যের স্টক কম।`;
      if (data.products.length > 0) {
        msg += ' যেমন: ' + data.products.map(p => `${p.name} (বাকি ${p.stock_quantity}${p.unit})`).join(', ');
      }
      return msg;
    }
  },
  totalProducts: {
    keywords: ['total product', 'how many product', 'product count', 'all product', 'total pro', 'produkts', 'prodct', 'মোট পণ্য', 'কত পণ্য', 'পণ্যের সংখ্যা', 'সব পণ্য', 'পণ্য তালিকা', 'পণ্য', 'পন্য'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM products WHERE is_active = 1`);
      return rows[0];
    },
    response: (data) => `মোট ${data.count}টি পণ্য আছে।`
  },
  totalRetailers: {
    keywords: ['total retailer', 'how many retailer', 'retailer count', 'all retailer', 'retailar', 'retailrs', 'মোট রিটেইলার', 'কত রিটেইলার', 'রিটেইলার সংখ্যা', 'সব ক্রেতা', 'গ্রাহক সংখ্যা', 'রিটেইলার', 'রিটেলার'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM retailers WHERE is_active = 1`);
      return rows[0];
    },
    response: (data) => `মোট ${data.count}জন রিটেইলার আছে।`
  },
  totalUsers: {
    keywords: ['total user', 'how many user', 'user count', 'all user', 'total usr', 'মোট ব্যবহারকারী', 'কত ব্যবহারকারী', 'ইউজার সংখ্যা', 'সব ইউজার', 'ব্যবহারকারি'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM users WHERE is_active = 1`);
      return rows[0];
    },
    response: (data, lang) => `মোট ${data.count}জন ব্যবহারকারী আছে।`
  },
  userInfo: {
    keywords: ['number dao', 'number dewa', 'phone number', 'phone dao', 'number ta dao', 'manager number', 'manager phone', 'manager contact', 'manager ke', 'manager k', 'user list', 'user details', 'employee list', 'staff list', 'staff details', 'k eder list', 'k der list', 'all user', 'manager', 'salesman', 'admin', 'accountant', 'driver', 'loader', 'shopkeeper', 'user info', 'employee info', 'staff info', 'contact number', 'mobile number', 'ম্যানেজার', 'ম্যানেজার নাম্বার', 'ম্যানেজার ফোন', 'ম্যানেজার কে', 'ম্যানেজার এর নাম্বার', 'নাম্বার দাও', 'ফোন নাম্বার', 'ফোন দাও', 'নাম্বার দেও', 'সেলসম্যান', 'এডমিন', 'অ্যাডমিন', 'কর্মচারী', 'স্টাফ লিস্ট', 'কর্মচারী লিস্ট', 'কর্মচারীর তালিকা', 'ইউজার লিস্ট', 'ইউজার তালিকা', 'হিসাবরক্ষক', 'ড্রাইভার', 'লোডার', 'শপকিপার', 'কার তালিকা', 'কে কে', 'কর্মচারীদের', 'সবাই কে', 'লোকজন', 'ম্যানেজার এর ফোন', 'ড্রাইভার এর নাম্বার', 'লোডার এর নাম্বার'],
    sql: async (text) => {
      const lower = text.toLowerCase();
      const roleMap = [
        { keywords: ['manager', 'ম্যানেজার'], roles: ['manager'] },
        { keywords: ['system admin', 'admin', 'system_admin', 'systemadmin', 'এডমিন', 'অ্যাডমিন'], roles: ['system_admin', 'admin'] },
        { keywords: ['salesman', 'সেলসম্যান', 'বিক্রয়'], roles: ['salesman'] },
        { keywords: ['accountant', 'হিসাবরক্ষক', 'একাউন্ট্যান্ট'], roles: ['accountant'] },
        { keywords: ['driver', 'ড্রাইভার'], roles: ['driver'] },
        { keywords: ['loader', 'লোডার'], roles: ['loader'] },
        { keywords: ['shopkeeper', 'শপকিপার', 'দোকানদার'], roles: ['shopkeeper'] },
        { keywords: ['user', 'employee', 'staff', 'কর্মচারী', 'স্টাফ', 'ইউজার', 'ব্যবহারকারি', 'লোকজন'], roles: [] }
      ];

      let selectedRoles = [];
      for (const entry of roleMap) {
        if (entry.keywords.some(k => lower.includes(k))) {
          if (entry.roles.length === 0) {
            selectedRoles = [];
            break;
          }
          selectedRoles.push(...entry.roles);
        }
      }

      let rows;
      if (selectedRoles.length > 0) {
        rows = await query(`
          SELECT u.full_name, u.phone, u.email, r.name as role_name
          FROM users u
          JOIN roles r ON u.role_id = r.id
          WHERE u.is_active = 1 AND r.name IN (${selectedRoles.map((_, i) => `$${i + 1}`).join(',')})
          ORDER BY u.full_name
        `, selectedRoles);
      } else {
        rows = await query(`
          SELECT u.full_name, u.phone, u.email, r.name as role_name
          FROM users u
          JOIN roles r ON u.role_id = r.id
          WHERE u.is_active = 1
          ORDER BY r.name, u.full_name
        `);
      }
      return rows;
    },
    response: (data, rawText) => {
      if (!data || data.length === 0) {
        const lower = (rawText || '').toLowerCase();
        const roleCheck = [
          { k: ['manager', 'ম্যানেজার'], name: 'ম্যানেজার' },
          { k: ['salesman', 'সেলসম্যান'], name: 'সেলসম্যান' },
          { k: ['driver', 'ড্রাইভার'], name: 'ড্রাইভার' },
          { k: ['loader', 'লোডার'], name: 'লোডার' },
          { k: ['accountant', 'হিসাবরক্ষক'], name: 'একাউন্ট্যান্ট' },
          { k: ['shopkeeper', 'শপকিপার'], name: 'শপকিপার' }
        ];
        for (const r of roleCheck) {
          if (r.k.some(k => lower.includes(k))) {
            return `সিস্টেমে কোনো ${r.name} নেই।`;
          }
        }
        return 'সিস্টেমে কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।';
      }

      const roleNames = { system_admin: 'সিস্টেম অ্যাডমিন', admin: 'অ্যাডমিন', manager: 'ম্যানেজার', salesman: 'সেলসম্যান', accountant: 'একাউন্ট্যান্ট', driver: 'ড্রাইভার', loader: 'লোডার', shopkeeper: 'শপকিপার' };
      let lines = data.map(u => {
        const role = roleNames[u.role_name] || u.role_name;
        let info = `• ${u.full_name} (${role})`;
        if (u.phone) info += ` - ${u.phone}`;
        if (u.email) info += `, ${u.email}`;
        return info;
      });
      return lines.join('\n');
    }
  },
  totalCompanies: {
    keywords: ['total company', 'how many company', 'company count', 'all company', 'company', 'compeny', 'comapny', 'মোট কোম্পানি', 'কত কোম্পানি', 'কোম্পানির সংখ্যা', 'সব কোম্পানি', 'কোম্পানি', 'কোমপনি'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM companies WHERE is_active = 1`);
      return rows[0];
    },
    response: (data) => `মোট ${data.count}টি কোম্পানি আছে।`
  },
  outstandingBalance: {
    keywords: ['outstanding', 'due balance', 'outstanding balance', 'total due', 'due amount', 'total outstanding', 'outstanding amount', 'baki', 'bakaya', 'outstandng', 'outstnding', 'du', 'বকেয়া', 'বাকি', 'বাকি টাকা', 'আউটস্ট্যান্ডিং', 'পাওনা', 'বাকি টাকা', 'বাকি পরিমাণ', 'দেনা', 'পায়না'],
    sql: async () => {
      const rows = await query(`SELECT COALESCE(SUM(outstanding_balance), 0) as total FROM retailers WHERE is_active = 1`);
      return rows[0];
    },
    response: (data) => `মোট বকেয়া ${data.total} টাকা।`
  },
  pendingOrders: {
    keywords: ['pending order', 'pending', 'pending orders count', 'new order', 'pendng', 'pendin', 'pnding', 'penidng', 'পেন্ডিং অর্ডার', 'অপেক্ষমান অর্ডার', 'নতুন অর্ডার', 'অর্ডার পেন্ডিং', 'পেন্ডিং', 'পেনডিং'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'pending'`);
      return rows[0];
    },
    response: (data) => `${data.count}টি পেন্ডিং অর্ডার আছে।`
  },
  totalSales: {
    keywords: ['total sales', 'all time sales', 'total sale amount', 'overall sales', 'total sal', 'sale detail', 'sal detals', 'সব বিক্রয়', 'মোট বিক্রয়', 'সর্বমোট বিক্রি', 'সব বিক্রি', 'মোট বিক্রি', 'বিক্রির পরিমাণ'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount, COALESCE(SUM(paid_amount), 0) as collected FROM invoices`);
      return rows[0];
    },
    response: (data) => `সর্বমোট ${data.count}টি ইনভয়েস, মোট ${data.amount} টাকার বিক্রয়, কালেকশন ${data.collected} টাকা।`
  },
  totalInvoices: {
    keywords: ['total invoice', 'how many invoice', 'invoice count', 'all invoice', 'invoic', 'invoce', 'invocie', 'মোট ইনভয়েস', 'কত ইনভয়েস', 'ইনভয়েস সংখ্যা', 'ইনভয়েস', 'ইনভয়েস'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count FROM invoices`);
      return rows[0];
    },
    response: (data) => `মোট ${data.count}টি ইনভয়েস আছে।`
  },
  totalPayments: {
    keywords: ['total payment', 'how many payment', 'payment count', 'all payment', 'paymant', 'paymnt', 'payent', 'মোট পেমেন্ট', 'কত পেমেন্ট', 'পেমেন্ট সংখ্যা', 'পেমেন্ট', 'পেমেন্ট'],
    sql: async () => {
      const rows = await query(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM payments`);
      return rows[0];
    },
    response: (data) => `মোট ${data.count}টি পেমেন্ট, মোট ${data.amount} টাকা।`
  },
  systemInfo: {
    keywords: ['system info', 'dms info', 'about system', 'about dms', 'what is dms', 'sistem info', 'system', 'sys info', 'সিস্টেম তথ্য', 'ডিএমএস কী', 'ডিএমএস সম্পর্কে', 'সিস্টেম সম্পর্কে', 'সিস্টেম', 'ডিএমএস'],
    sql: async () => {
      const [products, retailers, users, companies, invoices] = await Promise.all([
        query(`SELECT COUNT(*) as c FROM products WHERE is_active = 1`),
        query(`SELECT COUNT(*) as c FROM retailers WHERE is_active = 1`),
        query(`SELECT COUNT(*) as c FROM users WHERE is_active = 1`),
        query(`SELECT COUNT(*) as c FROM companies WHERE is_active = 1`),
        query(`SELECT COUNT(*) as c FROM invoices`)
      ]);
      return { products: products[0].c, retailers: retailers[0].c, users: users[0].c, companies: companies[0].c, invoices: invoices[0].c };
    },
    response: (data) => `ডিএমএস - ডিস্ট্রিবিউশন ম্যানেজমেন্ট সিস্টেম। বর্তমান তথ্য: ${data.products}টি পণ্য, ${data.retailers}জন রিটেইলার, ${data.users}জন ব্যবহারকারী, ${data.companies}টি কোম্পানি, ${data.invoices}টি ইনভয়েস।`
  },
  help: {
    keywords: ['help', 'what can you do', 'capabilities', 'features', 'hel', 'hlp', 'hepl', 'সাহায্য', 'কী করতে পারেন', 'কি করতে পারো', 'কি পার', 'হেল্প', 'কমান্ড', 'সাহাজ্য'],
    sql: async () => null,
    response: (_data, message) => {
      const isEng = message && !/[\u0980-\u09FF]/.test(message);
      if (isEng) {
        return 'I can help you with:\n' +
          '• Today\'s sales & collections\n' +
          '• Total products, retailers, companies, users\n' +
          '• Low stock alerts\n' +
          '• Pending orders & invoices\n' +
          '• Outstanding balance & payments\n' +
          '• Employee contacts & roles\n' +
          '• How to upload, search, approve, download, share documents\n\n' +
          'Just ask in English or Bangla!';
      }
      return 'আমি ডিএমএস সিস্টেমের বিভিন্ন তথ্য দিতে পারি। যেমন: আজকের বিক্রয়, মোট পণ্য, রিটেইলার সংখ্যা, বকেয়া, লো স্টক, পেন্ডিং অর্ডার, পেমেন্ট, ইনভয়েস, ব্যবহারকারী, কোম্পানি, কর্মচারী ইত্যাদি। এছাড়া ডকুমেন্ট আপলোড, সার্চ, অ্যাপ্রুভ, ডাউনলোড ও শেয়ার করার পদ্ধতি বলতে পারি।';
    }
  },
  uploadDocument: {
    keywords: ['upload document', 'how to upload', 'upload file', 'upload doc', 'কিভাবে আপলোড', 'ডকুমেন্ট আপলোড', 'ফাইল আপলোড', 'আপলোড করব', 'কিভাবে ফাইল', 'কিভাবে ডকুমেন্ট'],
    sql: async () => null,
    response: () => guideUser('upload_document')
  },
  searchDocument: {
    keywords: ['search document', 'find document', 'how to search', 'search file', 'খুঁজব', 'কিভাবে খুঁজব', 'ডকুমেন্ট খুঁজি', 'সার্চ করব', 'কিভাবে সার্চ', 'ডকুমেন্ট সার্চ'],
    sql: async () => null,
    response: () => guideUser('search_document')
  },
  approveDocument: {
    keywords: ['approve document', 'how to approve', 'approve file', 'approval', 'অ্যাপ্রুভ', 'অ্যাপ্রুভ করব', 'কিভাবে অ্যাপ্রুভ', 'অনুমোদন', 'কিভাবে অনুমোদন'],
    sql: async () => null,
    response: () => guideUser('approve_document')
  },
  downloadDocument: {
    keywords: ['download document', 'how to download', 'download file', 'ডাউনলোড', 'কিভাবে ডাউনলোড', 'ডাউনলোড করব', 'ফাইল ডাউনলোড'],
    sql: async () => null,
    response: () => guideUser('download_document')
  },
  shareDocument: {
    keywords: ['share document', 'how to share', 'share file', 'শেয়ার', 'কিভাবে শেয়ার', 'শেয়ার করব', 'ফাইল শেয়ার', 'ডকুমেন্ট শেয়ার'],
    sql: async () => null,
    response: () => guideUser('share_document')
  }
};

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function fuzzyThreshold(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  return 3;
}

function detectLanguage(text) {
  return 'bn';
}

function tokenize(text) {
  return text.toLowerCase().trim().split(/[\s,]+/).filter(Boolean);
}

function matchWord(word, keyword) {
  if (keyword.includes(word) || word.includes(keyword)) return true;
  const dist = levenshtein(word, keyword);
  const threshold = fuzzyThreshold(keyword.length);
  return dist <= threshold;
}

function matchIntent(text) {
  const lower = text.toLowerCase().trim();
  const words = tokenize(text);
  let bestIntent = null;
  let bestScore = 0;

  for (const [key, intent] of Object.entries(intents)) {
    let score = 0;

    for (const kw of intent.keywords) {
      const lowerKw = kw.toLowerCase();

      if (lower.includes(lowerKw)) {
        score += 100;
        continue;
      }

      const kwWords = lowerKw.split(/\s+/);
      const kwMultiplier = kwWords.length > 1 ? 1 + (kwWords.length * 0.2) : 1;

      for (const kwWord of kwWords) {
        if (kwWord.length <= 2) continue;
        for (const userWord of words) {
          if (matchWord(userWord, kwWord)) {
            score += 10 * kwMultiplier;
            break;
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = key;
    }
  }

  return bestScore >= 10 ? bestIntent : null;
}

function getGreeting(lang) {
  const greetings = {
    bn: ['নমস্কার', 'হাই', 'হ্যালো', 'ওহে', 'কি অবস্থা'],
    en: ['hi', 'hello', 'hey', 'hi there', 'hello there', 'greetings']
  };
  for (const g of greetings.bn) {
    if (detectLanguage('bn') === 'bn' && g === 'নমস্কার') continue;
  }
  const lower = ''; // handled in greeting detection
  return null;
}

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  const words = tokenize(text);
  const greetings = ['hi', 'hello', 'hey', 'hi there', 'hello there', 'নমস্কার', 'হ্যালো', 'হাই', 'ওহে', 'হেলো', 'কেমন আছ', 'নমশকার', 'হ্যাল'];

  for (const g of greetings) {
    if (lower.includes(g)) return true;
    const gWords = g.split(/\s+/);
    const matched = gWords.filter(gw => words.some(w => matchWord(w, gw)));
    if (matched.length === gWords.length) return true;
  }
  return false;
}

function isThanks(text) {
  const lower = text.toLowerCase().trim();
  const words = tokenize(text);
  const thanks = ['thanks', 'thank you', 'thank', 'ধন্যবাদ', 'থ্যাংক', 'থ্যাংক ইউ', 'ধনবাদ', 'থ্যাংকস'];

  for (const t of thanks) {
    if (lower.includes(t)) return true;
    const tWords = t.split(/\s+/);
    const matched = tWords.filter(tw => words.some(w => matchWord(w, tw)));
    if (matched.length === tWords.length) return true;
  }
  return false;
}

function isEnglish(text) {
  const bn = /[\u0980-\u09FF]/;
  return !bn.test(text);
}

export const chatbotService = {
  async processMessage(message) {
    const isEng = isEnglish(message);

    if (isGreeting(message)) {
      const reply = isEng
        ? 'Hi! I am the DMS chatbot. Ask me about sales, products, stock, retailers, payments, or how to use the system. Type "help" to see what I can do.'
        : 'নমস্কার! আমি ডিএমএস চ্যাটবট। আপনার ব্যবসার তথ্য জানতে প্রশ্ন করুন। সাহায্যের জন্য "help" বা "সাহায্য" লিখুন।';
      return { reply, intent: 'greeting' };
    }

    if (isThanks(message)) {
      const reply = isEng
        ? 'You\'re welcome! Feel free to ask more questions.'
        : 'আপনাকে ধন্যবাদ! আরও কিছু জানতে চাইলে প্রশ্ন করুন।';
      return { reply, intent: 'thanks' };
    }

    const intent = matchIntent(message);
    if (!intent) {
      const reply = isEng
        ? 'Sorry, I didn\'t understand that. Try asking about:\n- Today\'s sales\n- Product count\n- Low stock alerts\n- Pending orders\n- Outstanding balance\n- How to upload/search/approve/download/share documents\n\nType "help" to see everything I can do.'
        : 'দুঃখিত, আমি আপনার প্রশ্ন বুঝতে পারিনি। "সাহায্য" লিখে দেখুন কী কী জানতে পারেন।';
      return { reply, intent: 'unknown' };
    }

    const handler = intents[intent];
    try {
      const data = handler.sql.length === 1 ? await handler.sql(message) : await handler.sql();
      const reply = handler.response(data, message);
      return { reply, intent };
    } catch (error) {
      console.error('Chatbot query error:', error);
      return { reply: 'তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', intent: 'error' };
    }
  }
};
