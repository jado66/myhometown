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
    const timestamp = parseInt(tokenData.split("-")[1]);
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
};

export const CommunityIdToPasswordHash = {
  "67411c5795464500ae7aab25": {
    name: "Dev - Dev",
    password: "1234",
  },
  "66a811814800d08c300d88fd": {
    name: "Orem - Geneva Heights",
    password: "8631",
  },
  "fb34e335-5cc6-4e6c-b5fc-2b64588fe921": {
    name: "Orem - Sharon Park",
    password: "9013",
  },
  "66df56bef05bd41ef9493f33": {
    name: "Provo - Pioneer Park",
    password: "0155",
  },
  "66df56e6f05bd41ef9493f34": {
    name: "Provo - Dixon",
    password: "1823",
  },
  "66df5707f05bd41ef9493f35": {
    name: "Provo - South Freedom",
    password: "5815",
  },
  "66df577bf05bd41ef9493f37": {
    name: "Ogden - North",
    password: "1809",
  },
  "66df5790f05bd41ef9493f38": {
    name: "Ogden - South",
    password: "0217",
  },
  "66df57a2f05bd41ef9493f39": {
    name: "Ogden - West",
    password: "9803",
  },
  "66df57b3f05bd41ef9493f3a": {
    name: "Salt Lake City - Central",
    password: "4217",
  },
  "66df57c2f05bd41ef9493f3b": {
    name: "Salt Lake City - Northwest",
    password: "8159",
  },
  "66df57d1f05bd41ef9493f3c": {
    name: "Salt Lake City - Westside",
    password: "6817",
  },
  "66df57e6f05bd41ef9493f3d": {
    name: "West Valley City - Central Granger",
    password: "1037",
  },
  "66df57faf05bd41ef9493f3e": {
    name: "West Valley City - North East Granger",
    password: "6324",
  },
  "66df580bf05bd41ef9493f3f": {
    name: "West Valley City - West Granger",
    password: "7771",
  },
  "66df581af05bd41ef9493f40": {
    name: "West Valley City - Central Valley View",
    password: "1037",
  },
  "6876c09a2a087f662c17feed": {
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
    const timestamp = parseInt(tokenData.split("-")[1]);
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

  if (CommunityIdToPasswordHash[communityId].password === password) {
    const token = generateAuthToken(communityId, isDaysOfService);
    const localStorageKey = isDaysOfService
      ? `communityAuth_${communityId}_daysOfService`
      : `communityAuth_${communityId}`;

    localStorage.setItem(localStorageKey, token);
    return true;
  }
  return false;
};
