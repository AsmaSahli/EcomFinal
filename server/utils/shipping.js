// List of Tunisia governorates grouped by proximity (simple example)
const cityGroups = {
  TunisMetro: ["Tunis", "Ariana", "Ben Arous", "Manouba"],
  NorthEast: ["Bizerte", "Beja", "Jendouba", "Zaghouan", "Nabeul"],
  CentralEast: ["Sousse", "Monastir", "Mahdia", "Kairouan"],
  SouthEast: ["Sfax", "Gabes", "Mednine", "Tataouine"],
  CentralWest: [
    "Kasserine",
    "Sidi Bouzid",
    "Kebili",
    "Gafsa",
    "Tozeur",
    "Siliana",
  ],
  SouthWest: ["Gafsa", "Kebili", "Tozeur"],
};

// Helper to find group name for a city
function findCityGroup(city) {
  city = city.trim();
  for (const group in cityGroups) {
    if (cityGroups[group].includes(city)) {
      return group;
    }
  }
  return null;
}

function getShippingDaysByCity(fromCity, toCity) {
  if (!fromCity || !toCity) return 3; // default max days

  fromCity = fromCity.trim();
  toCity = toCity.trim();

  if (fromCity === toCity) return 1; // same city, 1 day shipping

  const fromGroup = findCityGroup(fromCity);
  const toGroup = findCityGroup(toCity);

  if (!fromGroup || !toGroup) {
    // Unknown city, fallback to max shipping time
    return 3;
  }

  if (fromGroup === toGroup) {
    // Same group but different cities => 2 days
    return 2;
  }

  // Different groups => 3 days
  return 3;
}

module.exports = { getShippingDaysByCity };
