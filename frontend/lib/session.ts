export const saveSession = (sessionId: string, token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('tl_session_id', sessionId);
    sessionStorage.setItem('tl_session_token', token);
  }
};

export const getSessionId = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('tl_session_id');
  }
  return null;
};

export const getSessionToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('tl_session_token');
  }
  return null;
};

export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('tl_session_id');
    sessionStorage.removeItem('tl_session_token');
  }
};

export const formatLoanAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
