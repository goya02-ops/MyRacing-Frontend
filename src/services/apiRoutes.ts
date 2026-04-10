export const API_ROUTES = {
  USERS: {
    ME: '/users/me',
    BY_ID: (id: number) => `/users/${id}`,
  },
  PAYMENT: {
    CREATE_PREFERENCE: '/payment/create-preference',
    PROCESS: '/payment/process-payment',
    CHECK_STATUS: (id: string) => `/payment/check-payment-status/${id}`,
  },
  RACE_USERS: {
    BY_USER: (id: number) => `/race-users/by-user?userId=${id}`,
    MY_RACES: '/race-users/my-races',
    ROOT: '/race-users',
  },
  MEMBERSHIP: {
    CURRENT: '/membership/current',
  },
  RACES: {
    ROOT: '/races',
  },
} as const;
