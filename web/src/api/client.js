import axios from "axios";

/**
 * The access token lives in memory only — never localStorage.
 * The backend keeps the refresh token in an httpOnly cookie, so a page
 * reload recovers the session via refresh() instead of persisting the
 * access token somewhere XSS can reach it.
 */
let accessToken = null;

/** Called when refresh fails — AuthContext registers a handler to log the user out. */
let onAuthFailure = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Required: lets the refreshToken cookie ride along on /auth/refresh.
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** A bare axios call, so refreshing can't recurse through the interceptors below. */
export const requestRefresh = () =>
  axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );

// While a refresh is in flight, other 401s wait on this same promise rather
// than firing a refresh each — otherwise a dashboard that loads six resources
// at once sends six refreshes and five of them race.
let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // The backend answers 401 for a missing token but 403 for an expired one —
    // and 403 is *also* how requireRole denies a valid token. Only the former
    // is worth refreshing, so match on the message the auth middleware sends.
    const { status, data } = error.response ?? {};
    const isExpired =
      status === 401 || (status === 403 && data?.error === "Invalid or expired access token");
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (!isExpired || isRefreshCall || original?._retried) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      refreshPromise = refreshPromise ?? requestRefresh();
      const { data } = await refreshPromise;
      refreshPromise = null;

      setAccessToken(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return client(original);
    } catch (refreshError) {
      refreshPromise = null;
      setAccessToken(null);
      onAuthFailure();
      return Promise.reject(refreshError);
    }
  },
);

export default client;
