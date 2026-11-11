
const PREFIX = "riderconnect_";

// Read data from browser localStorage
export function readData(key, fallback = null) {
  try {
    const value = localStorage.getItem(PREFIX + key);

    return value !== null
      ? JSON.parse(value)
      : fallback;
  } catch (error) {
    console.error("Error reading data:", error);
    return fallback;
  }
}

// Save data in browser localStorageok 
export function writeData(key, value) {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
}

// Remove specific stored data
export function removeData(key) {
  localStorage.removeItem(PREFIX + key);
}

// Clear RiderConnect application data
export function clearAppData() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
