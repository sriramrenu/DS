export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Track pending requests to avoid duplicates
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Delay utility for retry backoff
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced fetch API with retry logic, timeout, and deduplication
 */
export const fetchApi = async (endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type to application/json if not explicitly provided and body is not FormData
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Create request key for deduplication (only for GET requests)
    const method = options.method || 'GET';
    const requestKey = method === 'GET' ? `${method}:${endpoint}` : null;

    // Return existing pending request if duplicate
    if (requestKey && pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
    }

    const fetchWithTimeout = async (timeoutMs = 30000): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - server is taking too long to respond');
            }
            throw error;
        }
    };

    const executeRequest = async (attemptNumber = 0): Promise<any> => {
        try {
            const response = await fetchWithTimeout();

            if (!response.ok) {
                // Don't retry on auth errors (401, 403)
                if (response.status === 401 || response.status === 403) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Authentication failed. Please log in again.');
                }

                // Retry on server errors (500+) if retries remain
                if (response.status >= 500 && attemptNumber < retries) {
                    const backoffMs = Math.min(1000 * Math.pow(2, attemptNumber), 5000);
                    console.warn(`API error ${response.status}, retrying in ${backoffMs}ms... (attempt ${attemptNumber + 1}/${retries})`);
                    await delay(backoffMs);
                    return executeRequest(attemptNumber + 1);
                }

                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error (${response.status}). Please try again.`);
            }

            return response.json();
        } catch (error: any) {
            // Retry on network errors if retries remain
            if (attemptNumber < retries && (error.message.includes('timeout') || error.message.includes('fetch'))) {
                const backoffMs = Math.min(1000 * Math.pow(2, attemptNumber), 5000);
                console.warn(`Network error, retrying in ${backoffMs}ms... (attempt ${attemptNumber + 1}/${retries})`);
                await delay(backoffMs);
                return executeRequest(attemptNumber + 1);
            }

            // Provide user-friendly error messages
            if (error.message.includes('fetch')) {
                throw new Error('Network connection lost. Please check your internet connection.');
            }

            throw error;
        }
    };

    // Store promise for GET requests to deduplicate
    const requestPromise = executeRequest().finally(() => {
        if (requestKey) {
            pendingRequests.delete(requestKey);
        }
    });

    if (requestKey) {
        pendingRequests.set(requestKey, requestPromise);
    }

    return requestPromise;
};
