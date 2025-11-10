export const generateAuthToken = (communityId) => {
  // Simple token generation - in practice you'd want something more secure
  return btoa(`${communityId}-${Date.now()}`);
};

export const generateCityAuthToken = (city) => {
  // Simple token generation - in practice you'd want something more secure
  return btoa(`${city}-${Date.now()}`);
};

export const generateBudgetAuthToken = () => {
  // Simple token generation - in practice you'd want something more secure
  return btoa(`budgetAccess-${Date.now()}`);
};

export const isAuthenticated = (
  communityId,
  isCity = false,
  isDaysOfService = false
) => {
  if (isCity) {
    const token = localStorage.getItem(`cityAuth_${communityId}`);
    if (!token) return false;
  }

  const localStorageKey = isDaysOfService
    ? `communityAuth_${communityId}_daysOfService`
    : `communityAuth_${communityId}`;

  const token = localStorage.getItem(localStorageKey);
  if (!token) return false;

  try {
    // Check if token is expired (1 month)
    const tokenData = atob(token);
    const timestamp = parseInt(
      tokenData.substring(tokenData.lastIndexOf("-") + 1)
    );
    const oneMonthAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    return timestamp > oneMonthAgo;
  } catch (e) {
    return false;
  }
};

export const CityIdToPasswordHash = {
  Provo: "082532",
  Orem: "495932",
  Ogden: "837588",
  "Salt Lake City": "434347",
  "West Valley City": "385957",
  Santaquin: "689943",
  Layton: "978612",
};

export const CommunityIdToPasswordHash = {
  // Old MongoDB IDs mapped to new UUIDs for backwards compatibility
  "67411c5795464500ae7aab25": {
    name: "Dev - Dev",
    password: "1234",
  },
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": {
    name: "Layton - Layton",
    password: "9786",
  },
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": {
    name: "Orem - Geneva Heights",
    password: "8631",
  },
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e": {
    name: "Orem - Sharon Park",
    password: "9013",
  },
  "b3381b98-e44f-4f1f-b067-04e575c515ca": {
    name: "Provo - Pioneer Park",
    password: "0155",
  },
  "7c446e80-323d-4268-b595-6945e915330f": {
    name: "Provo - Dixon",
    password: "1823",
  },
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": {
    name: "Provo - Provost",
    password: "2468",
  },
  "7c8731bc-1aee-406a-9847-7dc1e5255587": {
    name: "Provo - South Freedom",
    password: "5815",
  },
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": {
    name: "Ogden - North",
    password: "1809",
  },
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": {
    name: "Ogden - South",
    password: "0217",
  },
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": {
    name: "Ogden - West",
    password: "9803",
  },
  "995c1860-9d5b-472f-a206-1c2dd40947bd": {
    name: "Salt Lake City - Central",
    password: "4217",
  },
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": {
    name: "Salt Lake City - Northwest",
    password: "8159",
  },
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": {
    name: "Salt Lake City - Westside",
    password: "6817",
  },
  "252cd4b1-830c-4cdb-913f-a1460f218616": {
    name: "West Valley City - Central Granger",
    password: "1037",
  },

  "4687e12e-497f-40a2-ab1b-ab455f250fce": {
    name: "West Valley City - North East Granger",
    password: "6324",
  },
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": {
    name: "West Valley City - West Granger",
    password: "7771",
  },
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": {
    name: "West Valley City - Central Valley View",
    password: "1037",
  },
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": {
    name: "Santaquin - Santaquin",
    password: "9433",
  },
};

export const authenticateCity = (city, password) => {
  if (CityIdToPasswordHash[city] === password) {
    const token = generateCityAuthToken(city);
    localStorage.setItem(`cityAuth_${city}`, token);
    return true;
  }
  return false;
};

export const authenticateBudgetAccess = (password) => {
  if (password === "ba1562") {
    const token = generateBudgetAuthToken();
    localStorage.setItem(`budgetAccess`, token);
    return true;
  }
  return false;
};

export const isAuthenticatedBudget = () => {
  const token = localStorage.getItem(`budgetAccess`);
  if (!token) return false;

  try {
    // Check if token is expired (1 month)
    const tokenData = atob(token);
    const timestamp = parseInt(
      tokenData.substring(tokenData.lastIndexOf("-") + 1)
    );
    const oneMonthAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    return timestamp > oneMonthAgo;
  } catch (e) {
    return false;
  }
};

export const authenticateCommunity = (
  communityId,
  password,
  isDaysOfService = false
) => {
  // if days of service, ensure the password starts with a d- and remove it
  if (isDaysOfService) {
    if (password.startsWith("d-")) {
      password = password.substring(2);
    } else {
      return false;
    }
  }

  if (CommunityIdToPasswordHash[communityId]?.password === password) {
    const token = generateAuthToken(communityId, isDaysOfService);
    const localStorageKey = isDaysOfService
      ? `communityAuth_${communityId}_daysOfService`
      : `communityAuth_${communityId}`;

    localStorage.setItem(localStorageKey, token);
    return true;
  }
  return false;
};
