// Get API configuration from environment variables
const API_BASE_URL =
  import.meta.env.VITE_NOROFF_API_BASE_URL || 'https://v2.api.noroff.dev';
const API_KEY = import.meta.env.VITE_NOROFF_API_KEY;

if (!API_KEY) {
  console.error('⚠️ VITE_NOROFF_API_KEY is not set in environment variables');
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  banner?: {
    url: string;
    alt?: string;
  };
  venueManager?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface User {
  name: string;
  email: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  banner?: {
    url: string;
    alt?: string;
  };
  venueManager?: boolean;
}

export interface AuthResponse {
  name: string;
  email: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
  banner?: {
    url: string;
    alt?: string;
  };
  venueManager?: boolean;
  accessToken?: string;
}

// Helper function to get stored access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to set access token
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// Helper function to remove access token
export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

// Helper function to get stored user data
export const getUserData = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set user data
export const setUserData = (user: User): void => {
  localStorage.setItem('userData', JSON.stringify(user));
};

// Helper function to remove user data
export const removeUserData = (): void => {
  localStorage.removeItem('userData');
};

// API call helper
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAccessToken();
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please set VITE_NOROFF_API_KEY in your environment variables.'
    );
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Noroff-API-Key': API_KEY,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Log request details for debugging
  if (
    options.body &&
    (endpoint === '/auth/register' || endpoint.includes('/holidaze/venues'))
  ) {
    try {
      const bodyData = JSON.parse(options.body as string);
      console.log('🚀 API Request:', {
        endpoint: `${API_BASE_URL}${endpoint}`,
        method: options.method || 'GET',
        body:
          endpoint === '/auth/register'
            ? { ...bodyData, password: '***' } // Hide password in logs
            : bodyData,
      });
    } catch (e) {
      // Ignore parse errors
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = (await response.json()) as Record<string, unknown>;
    } catch {
      // If response is not JSON, use empty object
    }

    // Handle different error response formats
    const errors = errorData.errors as
      | Array<{ message?: string; field?: string }>
      | undefined;
    const errorMessage =
      errors?.[0]?.message ||
      (errorData.message as string) ||
      (errorData.statusCode as string) ||
      `API Error: ${response.statusText}`;

    // Log full error details for debugging
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      errors,
      endpoint,
    });

    // Log the full error response structure
    if (errors && errors.length > 0) {
      console.error('Error details:', errors);
      errors.forEach((error, index) => {
        console.error(`Error ${index + 1}:`, {
          message: error.message,
          field: error.field,
          path: (error as { path?: string }).path,
        });
      });
    }
    if (errorData) {
      console.error('Full error data:', JSON.stringify(errorData, null, 2));
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// Authentication API calls
export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    return apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Venues API calls
export const venuesApi = {
  getAll: async (): Promise<ApiResponse<unknown[]>> => {
    return apiCall<unknown[]>('/holidaze/venues');
  },

  getById: async (id: string): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/venues/${id}`);
  },

  create: async (data: unknown): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>('/holidaze/venues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: unknown): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiCall(`/holidaze/venues/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query: string): Promise<ApiResponse<unknown[]>> => {
    return apiCall<unknown[]>(
      `/holidaze/venues/search?q=${encodeURIComponent(query)}`
    );
  },
};

// Profiles API calls
export const profilesApi = {
  getProfile: async (name: string): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/profiles/${name}`);
  },

  updateProfile: async (
    name: string,
    data: unknown
  ): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/profiles/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProfile: async (): Promise<void> => {
    await apiCall('/auth/profile', {
      method: 'DELETE',
    });
  },
};

// Bookings API calls
export const bookingsApi = {
  getAll: async (): Promise<ApiResponse<unknown[]>> => {
    return apiCall<unknown[]>('/holidaze/bookings');
  },

  getById: async (id: string): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/bookings/${id}`);
  },

  create: async (data: unknown): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>('/holidaze/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: unknown): Promise<ApiResponse<unknown>> => {
    return apiCall<unknown>(`/holidaze/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiCall(`/holidaze/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
