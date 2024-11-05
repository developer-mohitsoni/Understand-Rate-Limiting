export const getRandomQuote = async () => {
  const res = await fetch("https://api.api-ninjas.com/v1/quotes?category=god", {
    cache: "no-cache",
    headers: {
      "X-Api-Key": "p8xodnmoaw1UFf66FDWtkw==OHzZz8IXlHQ6NUMd",
    },
  });

  // The return value is not serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest 'error.js' Error Boundary

    throw new Error("Failed to fetch quote");
  }

  return res.json();
};
