export const generateAuthToken = (city) => {
  // Simple token generation - in practice you'd want something more secure
  return btoa(`${city}-${Date.now()}`);
};

export const isAuthenticated = (city) => {
  const token = localStorage.getItem(`cityAuth_${city}`);
  if (!token) return false;

  try {
    // Check if token is expired (1 month)
    const tokenData = atob(token);
    const timestamp = parseInt(tokenData.split("-")[1]);
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return timestamp > oneMonthAgo;
  } catch (e) {
    return false;
  }
};

export const hasAnyAuth = () => {
  const cities = [
    "Provo",
    "Orem",
    "Ogden",
    "Salt Lake City",
    "West Valley City",
  ];

  for (const city of cities) {
    const token = localStorage.getItem(`cityAuth_${city}`);
    if (token) {
      try {
        const tokenData = atob(token);
        const timestamp = parseInt(tokenData.split("-")[1]);
        const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

        if (timestamp > oneMonthAgo) {
          return true;
        }
      } catch (e) {
        continue; // If there's an error with one token, just continue to check others
      }
    }
  }

  return false; // No valid tokens found for any city
};

export const authenticateCity = (city, password) => {
  const CityIdToPasswordHash = {
    Provo: "Provo6940!",
    Orem: "Orem1723!",
    Ogden: "Ogden8324!",
    "Salt Lake City": "SLC4676!",
    "West Valley City": "WVC6961!",
  };

  if (CityIdToPasswordHash[city] === password) {
    const token = generateAuthToken(city);
    localStorage.setItem(`cityAuth_${city}`, token);
    return true;
  }
  return false;
};
