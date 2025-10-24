'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Code, Key, Zap, AlertCircle, CheckCircle, Copy, ExternalLink, Book, Shield, Clock } from '@/lib/icons'

export default function APIDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      description: 'Authenticate user and receive access token',
      auth: false,
      category: 'Authentication'
    },
    {
      method: 'POST',
      path: '/api/v1/auth/refresh',
      description: 'Refresh expired access token',
      auth: false,
      category: 'Authentication'
    },
    {
      method: 'GET',
      path: '/api/v1/user/profile',
      description: 'Get authenticated user profile',
      auth: true,
      category: 'User'
    },
    {
      method: 'GET',
      path: '/api/v1/user/credits',
      description: 'Get user credit balance and usage',
      auth: true,
      category: 'User'
    },
    {
      method: 'POST',
      path: '/api/v1/courses/generate',
      description: 'Generate a new course using AI',
      auth: true,
      category: 'Courses'
    },
    {
      method: 'GET',
      path: '/api/v1/courses',
      description: 'List all user courses',
      auth: true,
      category: 'Courses'
    },
    {
      method: 'GET',
      path: '/api/v1/courses/:id',
      description: 'Get specific course details',
      auth: true,
      category: 'Courses'
    },
    {
      method: 'PUT',
      path: '/api/v1/courses/:id',
      description: 'Update course content',
      auth: true,
      category: 'Courses'
    },
    {
      method: 'DELETE',
      path: '/api/v1/courses/:id',
      description: 'Delete a course',
      auth: true,
      category: 'Courses'
    },
    {
      method: 'POST',
      path: '/api/v1/courses/:id/export',
      description: 'Export course (PDF, SCORM, DOCX)',
      auth: true,
      category: 'Export'
    }
  ]

  const errorCodes = [
    { code: 200, status: 'OK', description: 'Request successful' },
    { code: 201, status: 'Created', description: 'Resource created successfully' },
    { code: 400, status: 'Bad Request', description: 'Invalid request parameters' },
    { code: 401, status: 'Unauthorized', description: 'Missing or invalid authentication' },
    { code: 403, status: 'Forbidden', description: 'Insufficient permissions' },
    { code: 404, status: 'Not Found', description: 'Resource not found' },
    { code: 429, status: 'Too Many Requests', description: 'Rate limit exceeded' },
    { code: 500, status: 'Internal Server Error', description: 'Server error occurred' },
    { code: 503, status: 'Service Unavailable', description: 'Service temporarily unavailable' }
  ]

  const codeExamples = {
    auth: {
      javascript: `// Authentication Example (JavaScript)
const response = await fetch('https://api.personalacademy.app/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your_password'
  })
});

const data = await response.json();
const accessToken = data.access_token;

// Store token securely
localStorage.setItem('access_token', accessToken);`,
      python: `# Authentication Example (Python)
import requests

response = requests.post(
    'https://api.personalacademy.app/v1/auth/login',
    json={
        'email': 'user@example.com',
        'password': 'your_password'
    }
)

data = response.json()
access_token = data['access_token']

# Store token securely
# Use environment variables or secure storage`,
      curl: `# Authentication Example (cURL)
curl -X POST https://api.personalacademy.app/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }`
    },
    generateCourse: {
      javascript: `// Generate Course Example (JavaScript)
const response = await fetch('https://api.personalacademy.app/v1/courses/generate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Introduction to Python Programming',
    description: 'Beginner-friendly Python course',
    target_audience: 'Beginners with no programming experience',
    difficulty_level: 'beginner',
    number_of_modules: 8,
    include_assessments: true
  })
});

const course = await response.json();
console.log('Course ID:', course.id);`,
      python: `# Generate Course Example (Python)
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

payload = {
    'title': 'Introduction to Python Programming',
    'description': 'Beginner-friendly Python course',
    'target_audience': 'Beginners with no programming experience',
    'difficulty_level': 'beginner',
    'number_of_modules': 8,
    'include_assessments': True
}

response = requests.post(
    'https://api.personalacademy.app/v1/courses/generate',
    headers=headers,
    json=payload
)

course = response.json()
print(f"Course ID: {course['id']}")`,
      curl: `# Generate Course Example (cURL)
curl -X POST https://api.personalacademy.app/v1/courses/generate \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Introduction to Python Programming",
    "description": "Beginner-friendly Python course",
    "target_audience": "Beginners with no programming experience",
    "difficulty_level": "beginner",
    "number_of_modules": 8,
    "include_assessments": true
  }'`
    },
    exportCourse: {
      javascript: `// Export Course Example (JavaScript)
const response = await fetch(\`https://api.personalacademy.app/v1/courses/\${courseId}/export\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    format: 'pdf' // Options: 'pdf', 'scorm', 'docx'
  })
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'course.pdf';
a.click();`,
      python: `# Export Course Example (Python)
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    f'https://api.personalacademy.app/v1/courses/{course_id}/export',
    headers=headers,
    json={'format': 'pdf'}  # Options: 'pdf', 'scorm', 'docx'
)

# Save file
with open('course.pdf', 'wb') as f:
    f.write(response.content)`,
      curl: `# Export Course Example (cURL)
curl -X POST https://api.personalacademy.app/v1/courses/COURSE_ID/export \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"format": "pdf"}' \\
  --output course.pdf`
    }
  }

  const [activeLanguage, setActiveLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              🔌 API Documentation
            </h1>
            <p className="text-xl text-indigo-100 mb-6">
              Integrate Personal Academy into your applications
            </p>
            <div className="flex items-center justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Code size={20} />
                <span>REST API</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Zap size={20} />
                <span>Fast & Reliable</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Shield size={20} />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto py-4">
            <a href="#getting-started" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Getting Started
            </a>
            <a href="#authentication" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Authentication
            </a>
            <a href="#endpoints" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Endpoints
            </a>
            <a href="#examples" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Code Examples
            </a>
            <a href="#errors" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Error Codes
            </a>
            <a href="#rate-limits" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap">
              Rate Limits
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Getting Started */}
        <section id="getting-started" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Getting Started
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The Personal Academy API allows you to programmatically generate courses, manage content, and export learning materials. 
              All API requests are made to <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-sm">https://api.personalacademy.app/v1</code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="text-blue-600 dark:text-blue-400" size={24} />
                  <h3 className="font-bold text-blue-900 dark:text-blue-200">Base URL</h3>
                </div>
                <code className="text-sm text-blue-800 dark:text-blue-300">
                  https://api.personalacademy.app/v1
                </code>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-3">
                  <Book className="text-purple-600 dark:text-purple-400" size={24} />
                  <h3 className="font-bold text-purple-900 dark:text-purple-200">Content Type</h3>
                </div>
                <code className="text-sm text-purple-800 dark:text-purple-300">
                  application/json
                </code>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">API Access Requirements</h4>
                  <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                    <li>• API access may require a specific subscription plan</li>
                    <li>• All API calls consume credits from your account balance</li>
                    <li>• Rate limits apply to prevent abuse</li>
                    <li>• Authentication required for all protected endpoints</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🔐 Authentication
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              The API uses Bearer token authentication. Include your access token in the Authorization header:
            </p>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-6 relative">
              <code className="text-green-400 text-sm">
                Authorization: Bearer YOUR_ACCESS_TOKEN
              </code>
              <button
                onClick={() => copyToClipboard('Authorization: Bearer YOUR_ACCESS_TOKEN', 'auth-header')}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
              >
                {copiedCode === 'auth-header' ? (
                  <CheckCircle className="text-green-400" size={16} />
                ) : (
                  <Copy className="text-gray-400" size={16} />
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Obtaining an Access Token</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  POST to <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">/api/v1/auth/login</code> with your email and password. 
                  The response will include an <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">access_token</code> valid for 1 hour.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Token Expiration</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Access tokens expire after 1 hour. Use the refresh token endpoint to obtain a new token without re-authenticating.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security Best Practices</h4>
                <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>Never expose your access token in client-side code</li>
                  <li>Store tokens securely (environment variables, secure storage)</li>
                  <li>Implement token refresh logic to handle expiration</li>
                  <li>Use HTTPS for all API requests</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            📡 API Endpoints
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Endpoint</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {endpoints.map((endpoint, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          endpoint.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          endpoint.method === 'POST' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-900 dark:text-white">{endpoint.path}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {endpoint.description}
                      </td>
                      <td className="px-6 py-4">
                        {endpoint.auth ? (
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">Required</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-xs">Public</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section id="examples" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            💻 Code Examples
          </h2>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-6">
            {(['javascript', 'python', 'curl'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeLanguage === lang
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
              </button>
            ))}
          </div>

          {/* Authentication Example */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h3>
            <div className="bg-gray-900 rounded-lg p-6 relative">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{codeExamples.auth[activeLanguage]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples.auth[activeLanguage], 'auth-example')}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
              >
                {copiedCode === 'auth-example' ? (
                  <CheckCircle className="text-green-400" size={18} />
                ) : (
                  <Copy className="text-gray-400" size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Generate Course Example */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate Course</h3>
            <div className="bg-gray-900 rounded-lg p-6 relative">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{codeExamples.generateCourse[activeLanguage]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples.generateCourse[activeLanguage], 'generate-example')}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
              >
                {copiedCode === 'generate-example' ? (
                  <CheckCircle className="text-green-400" size={18} />
                ) : (
                  <Copy className="text-gray-400" size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Export Course Example */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Export Course</h3>
            <div className="bg-gray-900 rounded-lg p-6 relative">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{codeExamples.exportCourse[activeLanguage]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples.exportCourse[activeLanguage], 'export-example')}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded transition-colors"
              >
                {copiedCode === 'export-example' ? (
                  <CheckCircle className="text-green-400" size={18} />
                ) : (
                  <Copy className="text-gray-400" size={18} />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section id="errors" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            ⚠️ Error Codes
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {errorCodes.map((error) => (
                    <tr key={error.code} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <code className={`px-2 py-1 rounded text-xs font-semibold ${
                          error.code >= 200 && error.code < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          error.code >= 400 && error.code < 500 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {error.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {error.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {error.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            ⏱️ Rate Limits
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              To ensure fair usage and system stability, API requests are rate-limited based on your subscription plan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                <Clock className="text-blue-600 dark:text-blue-400 mb-3" size={32} />
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Starter Plan</h4>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-1">60</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">requests per minute</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <Clock className="text-purple-600 dark:text-purple-400 mb-3" size={32} />
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Growth Plan</h4>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-1">120</p>
                <p className="text-sm text-purple-700 dark:text-purple-400">requests per minute</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <Clock className="text-green-600 dark:text-green-400 mb-3" size={32} />
                <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Scale Plan</h4>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300 mb-1">300</p>
                <p className="text-sm text-green-700 dark:text-green-400">requests per minute</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3">Rate Limit Headers</h4>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                Every API response includes rate limit headers:
              </p>
              <div className="bg-gray-900 rounded p-4 text-xs">
                <code className="text-green-400">
                  X-RateLimit-Limit: 60<br />
                  X-RateLimit-Remaining: 45<br />
                  X-RateLimit-Reset: 1698765432
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-indigo-200 dark:border-indigo-700 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help with API Integration?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our support team is here to help you get started with the API
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:personalacademy1@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md"
            >
              Email API Support
            </a>
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-lg font-semibold transition-all"
            >
              <ExternalLink size={20} />
              View Tutorials
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
