# Usage Limits Implementation

## Overview
Implementasi batasan penggunaan untuk versi free tier yang membatasi:
- **3 forms** per bulan
- **50 responses** per bulan

## Changes Made

### 1. SubscriptionService (src/lib/subscription-service.ts)
- ✅ **getUserSubscription()**: Menggunakan Firebase untuk menyimpan dan mengambil data subscription
- ✅ **getUserUsage()**: Menggunakan Firebase untuk menyimpan dan mengambil data usage
- ✅ **updateUsage()**: Menggunakan Firebase untuk update usage dengan increment operations
- ✅ **canPerformAction()**: Mengecek apakah user bisa melakukan action berdasarkan plan limits

### 2. Form Creation Tracking (src/app/actions.ts)
- ✅ **saveFormAction()**: 
  - Mengecek limit form creation sebelum membuat form baru
  - Track usage ketika form berhasil dibuat
  - Return error jika limit exceeded

### 3. Response Tracking (src/app/actions.ts)
- ✅ **saveSubmissionAction()**:
  - Mengecek limit response sebelum menyimpan submission
  - Track usage untuk form owner ketika response diterima
  - Return error jika limit exceeded

## Firebase Collections

### `subscriptions` Collection
```javascript
{
  id: "userId",
  userId: "userId",
  planId: "free", // or "pro"
  tier: "free", // or "pro"
  status: "active",
  currentPeriodStart: "2024-01-01T00:00:00.000Z",
  currentPeriodEnd: "2024-01-31T23:59:59.999Z",
  cancelAtPeriodEnd: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### `usage` Collection
```javascript
{
  userId: "userId",
  formsCreated: 0,
  responsesReceived: 0,
  storageUsed: 0,
  apiCallsUsed: 0,
  aiGenerationsUsed: 0,
  lastUpdated: "2024-01-01T00:00:00.000Z"
}
```

## Free Plan Limits
```javascript
{
  forms: 3,
  responses: 50,
  storage: "500MB",
  apiCalls: 25,
  aiGenerations: 5,
  teamMembers: 1
}
```

## How It Works

### Form Creation Flow
1. User mencoba membuat form baru
2. System cek `canPerformAction(userId, 'create_form', 1)`
3. Jika allowed, form dibuat dan usage di-increment
4. Jika tidak allowed, return error message

### Response Submission Flow
1. User submit response ke form
2. System cari form owner dari formId
3. System cek `canPerformAction(formOwnerId, 'receive_response', 1)`
4. Jika allowed, response disimpan dan usage di-increment
5. Jika tidak allowed, return error message

### Dashboard Display
- UsageDashboard component menampilkan real-time usage dari Firebase
- Progress bar menunjukkan persentase penggunaan
- Upgrade prompt muncul untuk free tier users

## Testing
Gunakan script `test-usage-limits.js` untuk test implementasi:
```bash
node test-usage-limits.js
```

## Error Messages
- Form limit: "Form limit exceeded. Your Free plan allows 3 forms."
- Response limit: "Response limit exceeded. Your Free plan allows 50 responses per month."

## Next Steps
1. Test dengan membuat form dan response
2. Verify dashboard menampilkan usage yang benar
3. Test limit enforcement dengan mencoba melebihi batas
4. Implement monthly reset logic jika diperlukan
