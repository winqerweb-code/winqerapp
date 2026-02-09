import { supabase } from './auth';

// API Endpoints
const BASE_URL_ACCOUNT = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const BASE_URL_INFO = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const BASE_URL_REVIEWS = 'https://mybusiness.googleapis.com/v4';

// Types
export interface GmbAccount {
    name: string; // Format: accounts/{accountId}
    accountName: string;
    type: string;
    verificationState: string;
}

export interface GmbLocation {
    name: string; // Format: accounts/{accountId}/locations/{locationId}
    title: string;
    storeCode?: string;
    languageCode?: string;
    phoneNumbers?: {
        primaryPhone?: string;
    };
    categories?: {
        primaryCategory?: {
            displayName: string;
        };
    };
    metadata?: {
        mapsUri?: string;
        newReviewUri?: string;
    };
}

export interface GmbReview {
    reviewId: string;
    reviewer: {
        displayName: string;
        profilePhotoUrl?: string;
    };
    starRating: string; // "FIVE", "FOUR", etc.
    comment?: string;
    createTime: string;
    updateTime: string;
    reviewReply?: {
        comment: string;
        updateTime: string;
    };
    name: string; // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
}

// Helper to get current session token
const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token;
};

export const googleBusinessApi = {
    // 1. Get Accounts
    getAccounts: async (): Promise<GmbAccount[]> => {
        const token = await getAccessToken();
        if (!token) throw new Error("No Google Access Token found. Please sign in with Google.");

        try {
            const res = await fetch(`${BASE_URL_ACCOUNT}/accounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error?.message || 'Failed to fetch accounts');
            }

            const data = await res.json();
            return data.accounts || [];
        } catch (error) {
            console.error("GMB API Error (getAccounts):", error);
            throw error;
        }
    },

    // 2. Get Locations for an Account
    getLocations: async (accountName: string): Promise<GmbLocation[]> => {
        const token = await getAccessToken();
        if (!token) throw new Error("No Google Access Token found.");

        try {
            // readMask is required to specify which fields to return
            const readMask = "name,title,storeCode,phoneNumbers,categories,metadata";
            const res = await fetch(`${BASE_URL_INFO}/${accountName}/locations?readMask=${readMask}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error?.message || 'Failed to fetch locations');
            }

            const data = await res.json();
            console.log("GMB Locations Response:", data); // Debug log
            return data.locations || [];
        } catch (error) {
            console.error("GMB API Error (getLocations):", error);
            throw error;
        }
    },

    // 3. Get Reviews for a Location
    getReviews: async (locationName: string): Promise<GmbReview[]> => {
        const token = await getAccessToken();
        if (!token) throw new Error("No Google Access Token found.");

        try {
            // Note: Use v4 API for reviews as it is the current standard for this resource
            const res = await fetch(`${BASE_URL_REVIEWS}/${locationName}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error?.message || 'Failed to fetch reviews');
            }

            const data = await res.json();
            return data.reviews || [];
        } catch (error) {
            console.error("GMB API Error (getReviews):", error);
            throw error;
        }
    },

    // 4. Reply to a Review
    replyToReview: async (reviewName: string, replyText: string) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No Google Access Token found.");

        try {
            const res = await fetch(`${BASE_URL_REVIEWS}/${reviewName}/reply`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    comment: replyText
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error?.message || 'Failed to reply to review');
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error("GMB API Error (replyToReview):", error);
            throw error;
        }
    }
};
