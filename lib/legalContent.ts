// Centralized legal content for Personal Academy
// This file contains all legal text, company details, and reusable content blocks

export const COMPANY_INFO = {
  legalName: "Personal Academy APP",
  displayName: "Personal Academy",
  address: {
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    full: "Hyderabad, Telangana, India"
  },
  contact: {
    legal: "personalacademy1@gmail.com",
    support: "personalacademy1@gmail.com",
    dpo: null // No Data Protection Officer currently
  },
  website: "https://personalacademy.app",
  lastUpdated: "October 24, 2025"
};

export const SERVICE_DETAILS = {
  name: "Personal Academy",
  description: "AI-powered course generation platform",
  features: [
    "AI-generated course content",
    "Learning outcomes generation",
    "Module and lesson creation",
    "Quiz and assessment generation",
    "Certificate generation",
    "Course export (PDF, PPT, Word, SCORM)"
  ],
  aiProvider: "Advanced AI models optimized for educational content generation",
  dataStorage: "Supabase (India Region)",
  paymentProcessors: ["Razorpay", "Stripe"]
};

export const CREDIT_SYSTEM = {
  packages: [
    { name: "Starter", price: 999, credits: 1000, currency: "INR" },
    { name: "Growth", price: 2699, credits: 3000, currency: "INR" },
    { name: "Scale", price: 4249, credits: 5000, currency: "INR" }
  ],
  expirationDays: 365,
  refundPolicy: "No refunds",
  onCancellation: "Credits are forfeited and cannot be reverted",
  onAccountDeletion: "All purchased credits are permanently lost and cannot be recovered"
};

export const COMPLIANCE_CERTIFICATIONS = [
  {
    name: "GDPR Compliant",
    description: "Full compliance with EU General Data Protection Regulation",
    icon: "🇪🇺"
  },
  {
    name: "DPDP Act 2023",
    description: "Compliant with India's Digital Personal Data Protection Act",
    icon: "🇮🇳"
  },
  {
    name: "CCPA Ready",
    description: "California Consumer Privacy Act compliance for US users",
    icon: "🇺🇸"
  },
  {
    name: "ISO 27001 Standards",
    description: "Following information security management best practices",
    icon: "🔒"
  }
];

export const DATA_COLLECTION = {
  accountInfo: [
    "Full name",
    "Email address",
    "Password (encrypted)",
    "Phone number (optional)",
    "Organization/Company name (optional)",
    "Profile picture (optional)"
  ],
  courseContent: [
    "Course titles and descriptions",
    "User-generated prompts",
    "AI-generated course content",
    "Uploaded files and materials",
    "Course settings and preferences"
  ],
  usageData: [
    "Features used and frequency",
    "Credits consumed per operation",
    "Course creation timestamps",
    "Export activities",
    "Referral activities"
  ],
  paymentInfo: [
    "Transaction IDs",
    "Payment amounts and dates",
    "Credit purchase history",
    "Billing addresses",
    "Payment method (tokenized, we don't store card details)"
  ],
  technicalData: [
    "IP address",
    "Browser type and version",
    "Device information",
    "Operating system",
    "Session data",
    "Cookies and similar technologies"
  ]
};

export const DATA_USAGE_PURPOSES = [
  {
    purpose: "Service Delivery",
    details: "To provide AI-powered course generation, process your requests, and deliver the core functionality of Personal Academy"
  },
  {
    purpose: "AI Content Generation",
    details: "To generate educational content, learning outcomes, modules, lessons, quizzes, and assessments using advanced AI models"
  },
  {
    purpose: "Payment Processing",
    details: "To process credit purchases, manage subscriptions, and handle refunds through Razorpay and Stripe"
  },
  {
    purpose: "Account Management",
    details: "To create and maintain your account, authenticate users, and provide customer support"
  },
  {
    purpose: "Platform Improvement",
    details: "To analyze usage patterns, improve AI models, enhance user experience, and develop new features"
  },
  {
    purpose: "Communication",
    details: "To send service updates, credit balance notifications, promotional offers, and respond to inquiries"
  },
  {
    purpose: "Security & Fraud Prevention",
    details: "To detect and prevent fraud, abuse, and unauthorized access to our platform"
  },
  {
    purpose: "Legal Compliance",
    details: "To comply with applicable laws, regulations, legal processes, and government requests"
  }
];

export const THIRD_PARTY_SERVICES = [
  {
    name: "OpenAI",
    purpose: "AI content generation",
    dataShared: "User prompts, course requirements",
    privacy: "https://openai.com/policies/privacy-policy",
    location: "United States"
  },
  {
    name: "Supabase",
    purpose: "Data storage and database management",
    dataShared: "All user data and course content",
    privacy: "https://supabase.com/privacy",
    location: "India Region"
  },
  {
    name: "Razorpay",
    purpose: "Payment processing (India)",
    dataShared: "Transaction details, billing information",
    privacy: "https://razorpay.com/privacy/",
    location: "India"
  },
  {
    name: "Stripe",
    purpose: "Payment processing (International)",
    dataShared: "Transaction details, billing information",
    privacy: "https://stripe.com/privacy",
    location: "United States / Europe"
  }
];

export const USER_RIGHTS = {
  gdpr: [
    {
      right: "Right to Access",
      description: "Request a copy of all personal data we hold about you"
    },
    {
      right: "Right to Rectification",
      description: "Request correction of inaccurate or incomplete data"
    },
    {
      right: "Right to Erasure ('Right to be Forgotten')",
      description: "Request deletion of your personal data under certain conditions"
    },
    {
      right: "Right to Restriction of Processing",
      description: "Request limitation of how we process your data"
    },
    {
      right: "Right to Data Portability",
      description: "Receive your data in a structured, machine-readable format"
    },
    {
      right: "Right to Object",
      description: "Object to processing of your data for certain purposes"
    },
    {
      right: "Right to Withdraw Consent",
      description: "Withdraw consent at any time where processing is based on consent"
    },
    {
      right: "Right to Lodge a Complaint",
      description: "File a complaint with your local data protection authority"
    }
  ],
  dpdpAct: [
    {
      right: "Right to Access Information",
      description: "Know what personal data is being processed"
    },
    {
      right: "Right to Correction",
      description: "Request correction of inaccurate data"
    },
    {
      right: "Right to Erasure",
      description: "Request deletion when data is no longer necessary"
    },
    {
      right: "Right to Grievance Redressal",
      description: "Lodge complaints with the Data Protection Board of India"
    }
  ],
  ccpa: [
    {
      right: "Right to Know",
      description: "Know what personal information is collected and how it's used"
    },
    {
      right: "Right to Delete",
      description: "Request deletion of personal information"
    },
    {
      right: "Right to Opt-Out",
      description: "Opt-out of the sale of personal information (we don't sell data)"
    },
    {
      right: "Right to Non-Discrimination",
      description: "Not be discriminated against for exercising privacy rights"
    }
  ]
};

export const DATA_RETENTION = {
  activeAccounts: "Duration of account + 6 months after closure",
  deletedAccounts: "30 days (then permanently deleted)",
  courseContent: "Duration of account + 90 days backup retention",
  paymentRecords: "7 years (Indian tax compliance requirement)",
  usageLogs: "12 months for security and analytics",
  marketingData: "Until opt-out or account deletion",
  backups: "90 days rolling backup, then permanently deleted"
};

export const SECURITY_MEASURES = [
  "End-to-end encryption for data in transit (TLS/SSL)",
  "Encryption at rest for sensitive data",
  "Regular security audits and vulnerability assessments",
  "Multi-factor authentication (MFA) support",
  "Role-based access control (RBAC)",
  "Automated backup systems with 90-day retention",
  "DDoS protection and rate limiting",
  "Secure API authentication with JWT tokens",
  "Password hashing with industry-standard algorithms",
  "Regular security patches and updates"
];

export const COOKIE_POLICY = {
  essential: [
    {
      name: "Session Cookies",
      purpose: "Maintain your logged-in state",
      duration: "Session (deleted when browser closes)"
    },
    {
      name: "Authentication Token",
      purpose: "Secure authentication and authorization",
      duration: "7 days or until logout"
    },
    {
      name: "CSRF Token",
      purpose: "Protect against cross-site request forgery attacks",
      duration: "Session"
    }
  ],
  analytics: [
    {
      name: "Google Analytics",
      purpose: "Understand how users interact with our platform",
      duration: "2 years",
      optOut: "https://tools.google.com/dlpage/gaoptout"
    },
    {
      name: "Usage Analytics",
      purpose: "Track feature usage and performance metrics",
      duration: "12 months"
    }
  ],
  marketing: [
    {
      name: "Referral Tracking",
      purpose: "Track referral links and attribute bonuses",
      duration: "90 days"
    },
    {
      name: "Campaign Tracking",
      purpose: "Measure effectiveness of marketing campaigns",
      duration: "6 months"
    }
  ]
};

export const PROHIBITED_ACTIVITIES = [
  "Creating courses with illegal, hateful, or discriminatory content",
  "Generating content that violates intellectual property rights",
  "Using the platform for spam, phishing, or malware distribution",
  "Attempting to circumvent credit limits or payment systems",
  "Reverse engineering or attempting to extract AI models",
  "Creating sexually explicit or adult content",
  "Generating content that promotes violence or self-harm",
  "Sharing login credentials with unauthorized users",
  "Automated scraping or data extraction",
  "Creating content that violates export control laws",
  "Using the service to train competing AI models",
  "Impersonating other users or organizations"
];

export const WARRANTY_DISCLAIMER = `
THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

Personal Academy does not warrant that:
- The service will be uninterrupted, secure, or error-free
- AI-generated content will be accurate, complete, or suitable for your purposes
- The service will meet your specific requirements
- Any errors or defects will be corrected

YOU ACKNOWLEDGE THAT AI-GENERATED CONTENT MAY CONTAIN ERRORS, INACCURACIES, OR 
INAPPROPRIATE CONTENT. YOU ARE SOLELY RESPONSIBLE FOR REVIEWING, EDITING, AND 
VALIDATING ALL AI-GENERATED CONTENT BEFORE USE.
`;

export const LIABILITY_LIMITATION = `
TO THE MAXIMUM EXTENT PERMITTED BY LAW, PERSONAL ACADEMY'S TOTAL LIABILITY ARISING 
OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 
12 MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.

IN NO EVENT SHALL PERSONAL ACADEMY BE LIABLE FOR:
- Indirect, incidental, special, consequential, or punitive damages
- Loss of profits, revenue, data, or business opportunities
- Cost of substitute services
- Errors or inaccuracies in AI-generated content
- Any damages arising from third-party services (OpenAI, Razorpay, Stripe)

Some jurisdictions do not allow the exclusion or limitation of certain damages, 
so the above limitations may not apply to you.
`;

export const DISPUTE_RESOLUTION = {
  jurisdiction: "Hyderabad, Telangana, India",
  governingLaw: "Laws of India",
  process: `
Any dispute arising out of or relating to these Terms shall be resolved as follows:

1. Informal Resolution (30 days)
   - Contact us at ${COMPANY_INFO.contact.legal}
   - We will attempt to resolve the dispute informally

2. Arbitration (if informal resolution fails)
   - Binding arbitration under the Arbitration and Conciliation Act, 1996
   - Seat of arbitration: Hyderabad, Telangana, India
   - Language: English
   - Single arbitrator appointed by mutual agreement
   - Arbitrator's decision is final and binding

3. Exceptions to Arbitration
   - Intellectual property disputes
   - Claims for injunctive relief
   - Small claims court matters (within jurisdictional limits)

ARBITRATION MEANS YOU WAIVE YOUR RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN 
CLASS ACTION LAWSUITS.
  `,
  exceptions: [
    "Intellectual property infringement claims",
    "Requests for injunctive or equitable relief",
    "Claims that can be brought in small claims court"
  ]
};

export const GDPR_PRINCIPLES = [
  {
    principle: "Lawfulness, Fairness, and Transparency",
    ourCommitment: "We process data lawfully with clear communication about our practices"
  },
  {
    principle: "Purpose Limitation",
    ourCommitment: "We collect data only for specified, explicit, and legitimate purposes"
  },
  {
    principle: "Data Minimization",
    ourCommitment: "We collect only data that is necessary for our services"
  },
  {
    principle: "Accuracy",
    ourCommitment: "We keep data accurate and up-to-date, with user correction rights"
  },
  {
    principle: "Storage Limitation",
    ourCommitment: "We retain data only as long as necessary for the stated purposes"
  },
  {
    principle: "Integrity and Confidentiality",
    ourCommitment: "We implement appropriate security measures to protect data"
  }
];

export const FAQ_TRUST_CENTER = [
  {
    question: "How does Personal Academy protect my data?",
    answer: "We use industry-standard encryption, secure cloud infrastructure (Supabase India Region), regular security audits, and strict access controls. All data in transit is encrypted with TLS/SSL, and sensitive data at rest is encrypted."
  },
  {
    question: "Where is my data stored?",
    answer: "Your data is stored in Supabase's India Region servers, ensuring compliance with Indian data localization requirements. Payment data is handled by Razorpay (India) and Stripe (international) and is not stored on our servers."
  },
  {
    question: "Do you use my course content to train AI models?",
    answer: "No. We do NOT use your course content, prompts, or any user data to train our AI models or any third-party models. Your content remains your intellectual property."
  },
  {
    question: "Can I delete my account and data?",
    answer: "Yes. You can request account deletion at any time by contacting personalacademy1@gmail.com. We will permanently delete your data within 30 days, except where we're legally required to retain certain records (e.g., payment records for tax purposes)."
  },
  {
    question: "What happens to my credits if I cancel?",
    answer: "Credits are non-refundable and expire 365 days from purchase. If you cancel or delete your account, all unused credits are forfeited and cannot be recovered or refunded."
  },
  {
    question: "Is Personal Academy GDPR compliant?",
    answer: "Yes. We are fully compliant with GDPR for our European users, DPDP Act 2023 for Indian users, and CCPA for California residents. We provide all required data subject rights including access, correction, and deletion."
  },
  {
    question: "How long do you keep my data?",
    answer: "Active account data is retained while your account is active plus 6 months. After account deletion, most data is removed within 30 days. Payment records are retained for 7 years per Indian tax laws. See our Privacy Policy for complete retention details."
  },
  {
    question: "Do you sell my personal information?",
    answer: "No. We do not sell, rent, or trade your personal information to third parties for monetary compensation. We only share data with service providers (OpenAI, Supabase, payment processors) necessary to deliver our services."
  },
  {
    question: "What AI models do you use?",
    answer: "We use advanced AI models optimized for educational content generation. The specific models may change based on quality and performance requirements. We select models that generate the most effective educational content."
  },
  {
    question: "How can I exercise my data rights?",
    answer: "Contact us at personalacademy1@gmail.com with your request. We support access, correction, deletion, portability, and opt-out rights. We will respond within 30 days for most requests."
  }
];

export const RECENT_UPDATES = [
  {
    date: "October 24, 2025",
    title: "Privacy Policy",
    description: "Initial publication of Privacy Policy",
    link: "/trust/privacy"
  },
  {
    date: "October 24, 2025",
    title: "Terms of Service",
    description: "Initial publication of Terms of Service",
    link: "/terms-of-service"
  },
  {
    date: "October 24, 2025",
    title: "GDPR Compliance",
    description: "Published GDPR compliance documentation",
    link: "/trust/gdpr"
  }
];

// Helper function to format dates
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to get contact email
export function getContactEmail(type: 'legal' | 'support' = 'legal'): string {
  return COMPANY_INFO.contact[type];
}
