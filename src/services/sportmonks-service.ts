// IMPORTANT: This file should not be marked with 'use server'
// as it is a pure data-fetching utility and doesn't need to be
// directly callable from the client. It will be used by server actions.

interface SportMonksCountry {
    id: number;
    continent_id: number;
    name: string;
    official_name: string;
    fifa_name: string;
    iso2: string;
    iso3: string;
    latitude: string;
    longitude: string;
    borders: string[];
    image_path: string;
}

interface SportMonksPlan {
    plan: string;
    sport: string;
    category: string;
}

interface SportMonksSubscription {
    meta: any[];
    plans: SportMonksPlan[];
    add_ons: any[];
    widgets: any[];
}

interface SportMonksRateLimit {
    resets_in_seconds: number;
    remaining: number;
    requested_entity: string;
}

interface SportMonksApiResponse<T> {
    data: T;
    subscription: SportMonksSubscription[];
    rate_limit: SportMonksRateLimit;
    timezone: string;
}

// Reusable fetch function for the SportMonks API
async function fetchFromSportMonksApi<T>(endpoint: string): Promise<SportMonksApiResponse<T> | null> {
  const apiKey = process.env.SPORTMONKS_API_KEY;

  if (!apiKey) {
      console.error("SportMonks API key is missing. Please add SPORTMONKS_API_KEY to your .env file.");
      throw new Error("API key for SportMonks is not configured.");
  }
  
  const url = `https://api.sportmonks.com/v3/football/${endpoint}?api_token=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      // Cache results for 1 hour
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SportMonks API Error Response:", errorText);
      throw new Error(`SportMonks API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from SportMonks API:`, error);
    return null;
  }
}

// Example service function to get a country by its ID
export async function getCountryById(countryId: number): Promise<SportMonksCountry | null> {
  const apiData = await fetchFromSportMonksApi<SportMonksCountry>(`countries/${countryId}`);
  return apiData ? apiData.data : null;
}
