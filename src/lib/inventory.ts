/**
 * SYNTHETIC DEMO DATA — every row below is invented for this demo.
 *
 * This is not a real dealership's stock. No real inventory, pricing or
 * customer data appears anywhere in this repository. Prices, odometer
 * readings and variants are hand-written to be plausible for the Indian
 * used-car market so that the retrieval demo behaves the way the production
 * system does.
 */

export type Fuel = "Petrol" | "Diesel" | "CNG";
export type Transmission = "Manual" | "Automatic";

export type Car = {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  priceInr: number;
  kmDriven: number;
  fuel: Fuel;
  transmission: Transmission;
  owners: number;
  colour: string;
  description: string;
};

export const inventory: Car[] = [
  { id: "GM-0001", make: "Maruti Suzuki", model: "Swift", variant: "VXi", year: 2019, priceInr: 585000, kmDriven: 38000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Pearl Arctic White", description: "Single-owner petrol hatchback, full service history, city driven, new tyres." },
  { id: "GM-0002", make: "Maruti Suzuki", model: "Swift", variant: "ZXi", year: 2019, priceInr: 640000, kmDriven: 29000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Fire Red", description: "Top-end petrol hatchback with alloys and touchscreen, low running, showroom condition." },
  { id: "GM-0003", make: "Maruti Suzuki", model: "Swift", variant: "VDi", year: 2018, priceInr: 520000, kmDriven: 61000, fuel: "Diesel", transmission: "Manual", owners: 2, colour: "Silky Silver", description: "Economical diesel hatchback, highway driven, timing belt replaced." },
  { id: "GM-0004", make: "Maruti Suzuki", model: "Swift", variant: "ZXi+ AMT", year: 2021, priceInr: 745000, kmDriven: 24000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Midnight Blue", description: "Automatic petrol hatchback, AMT gearbox, ideal for stop-start city traffic." },
  { id: "GM-0005", make: "Maruti Suzuki", model: "Baleno", variant: "Delta", year: 2020, priceInr: 665000, kmDriven: 33000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Nexa Blue", description: "Spacious premium hatchback, roomy boot, excellent mileage on petrol." },
  { id: "GM-0006", make: "Maruti Suzuki", model: "Baleno", variant: "Alpha CVT", year: 2022, priceInr: 895000, kmDriven: 18500, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Arctic White", description: "Fully loaded automatic premium hatchback, CVT gearbox, head-up display, 360 camera." },
  { id: "GM-0007", make: "Maruti Suzuki", model: "Dzire", variant: "VXi", year: 2019, priceInr: 595000, kmDriven: 45000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Silky Silver", description: "Compact sedan, family car, petrol manual, well maintained interiors." },
  { id: "GM-0008", make: "Maruti Suzuki", model: "Dzire", variant: "ZDi+", year: 2018, priceInr: 640000, kmDriven: 72000, fuel: "Diesel", transmission: "Manual", owners: 2, colour: "Gallant Red", description: "Top diesel compact sedan, long-distance cruiser, fleet maintained." },
  { id: "GM-0009", make: "Maruti Suzuki", model: "Dzire", variant: "VXi CNG", year: 2021, priceInr: 725000, kmDriven: 39000, fuel: "CNG", transmission: "Manual", owners: 1, colour: "Pearl White", description: "Company fitted CNG sedan, very low running cost, ideal for daily commute." },
  { id: "GM-0010", make: "Hyundai", model: "i20", variant: "Sportz", year: 2019, priceInr: 655000, kmDriven: 41000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Polar White", description: "Premium hatchback, petrol manual, Sportz trim, accident free." },
  { id: "GM-0011", make: "Hyundai", model: "i20", variant: "Asta (O)", year: 2021, priceInr: 895000, kmDriven: 22000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Titan Grey", description: "Top-spec premium hatchback with sunroof and Bose audio, single owner." },
  { id: "GM-0012", make: "Hyundai", model: "i20", variant: "Magna", year: 2018, priceInr: 545000, kmDriven: 58000, fuel: "Petrol", transmission: "Manual", owners: 2, colour: "Fiery Red", description: "Budget premium hatchback, petrol, honest condition, new battery." },
  { id: "GM-0013", make: "Hyundai", model: "Creta", variant: "SX", year: 2019, priceInr: 1145000, kmDriven: 52000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Phantom Black", description: "Mid-size SUV, diesel manual, sunroof, strong highway performance." },
  { id: "GM-0014", make: "Hyundai", model: "Creta", variant: "SX (O) AT", year: 2021, priceInr: 1595000, kmDriven: 31000, fuel: "Diesel", transmission: "Automatic", owners: 1, colour: "Polar White", description: "Fully loaded automatic diesel SUV, ventilated seats, panoramic sunroof." },
  { id: "GM-0015", make: "Hyundai", model: "Creta", variant: "E Plus", year: 2018, priceInr: 945000, kmDriven: 68000, fuel: "Petrol", transmission: "Manual", owners: 2, colour: "Stardust", description: "Entry trim mid-size SUV, petrol, spacious family car, well kept." },
  { id: "GM-0016", make: "Hyundai", model: "Venue", variant: "S", year: 2020, priceInr: 785000, kmDriven: 36000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Fiery Red", description: "Compact SUV, petrol manual, easy to park, connected car features." },
  { id: "GM-0017", make: "Hyundai", model: "Venue", variant: "SX (O) Turbo DCT", year: 2022, priceInr: 1185000, kmDriven: 19000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Denim Blue", description: "Turbo petrol automatic compact SUV, DCT gearbox, sunroof, very low km." },
  { id: "GM-0018", make: "Tata", model: "Nexon", variant: "XZ+", year: 2020, priceInr: 885000, kmDriven: 34000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Calgary White", description: "Five-star safety compact SUV, petrol manual, sunroof, single owner." },
  { id: "GM-0019", make: "Tata", model: "Nexon", variant: "XM", year: 2019, priceInr: 795000, kmDriven: 49000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Foliage Green", description: "Diesel compact SUV, torquey engine, good for highway family trips." },
  { id: "GM-0020", make: "Tata", model: "Nexon", variant: "XZ+ (O) AMT", year: 2022, priceInr: 1225000, kmDriven: 16000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Daytona Grey", description: "Automatic compact SUV, AMT gearbox, ventilated seats, nearly new condition." },
  { id: "GM-0021", make: "Tata", model: "Punch", variant: "Accomplished", year: 2022, priceInr: 745000, kmDriven: 21000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Tropical Mist", description: "Micro SUV, high seating position, petrol manual, five-star crash rating." },
  { id: "GM-0022", make: "Tata", model: "Punch", variant: "Adventure AMT", year: 2023, priceInr: 825000, kmDriven: 12000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Atomic Orange", description: "Automatic micro SUV, AMT gearbox, barely used, warranty transferable." },
  { id: "GM-0023", make: "Tata", model: "Altroz", variant: "XZ", year: 2021, priceInr: 715000, kmDriven: 28000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Downtown Red", description: "Premium hatchback with a very strong body shell, petrol manual." },
  { id: "GM-0024", make: "Tata", model: "Altroz", variant: "XM", year: 2020, priceInr: 665000, kmDriven: 47000, fuel: "Diesel", transmission: "Manual", owners: 2, colour: "Avenue White", description: "Diesel premium hatchback, frugal, comfortable ride over bad roads." },
  { id: "GM-0025", make: "Honda", model: "City", variant: "VX CVT", year: 2020, priceInr: 1195000, kmDriven: 33000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Platinum White", description: "Executive sedan, smooth CVT automatic petrol, sunroof, refined ride." },
  { id: "GM-0026", make: "Honda", model: "City", variant: "ZX", year: 2018, priceInr: 895000, kmDriven: 64000, fuel: "Petrol", transmission: "Manual", owners: 2, colour: "Golden Brown", description: "Top-end petrol sedan, leather seats, reliable and well serviced." },
  { id: "GM-0027", make: "Honda", model: "City", variant: "V i-DTEC", year: 2019, priceInr: 985000, kmDriven: 71000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Modern Steel", description: "Diesel sedan, outstanding mileage, single owner, highway driven." },
  { id: "GM-0028", make: "Honda", model: "Amaze", variant: "S CVT", year: 2021, priceInr: 785000, kmDriven: 26000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Radiant Red", description: "Automatic compact sedan, CVT gearbox, roomy rear seat, first owner." },
  { id: "GM-0029", make: "Honda", model: "Amaze", variant: "E", year: 2019, priceInr: 545000, kmDriven: 43000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Taffeta White", description: "Affordable compact sedan, petrol manual, low maintenance family car." },
  { id: "GM-0030", make: "Mahindra", model: "XUV300", variant: "W8 (O)", year: 2021, priceInr: 1085000, kmDriven: 29000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Aquamarine", description: "Diesel compact SUV, seven airbags, dual-zone climate, planted at speed." },
  { id: "GM-0031", make: "Mahindra", model: "XUV300", variant: "W6", year: 2019, priceInr: 795000, kmDriven: 55000, fuel: "Petrol", transmission: "Manual", owners: 2, colour: "D-Sat Silver", description: "Petrol compact SUV, strong build, comfortable city SUV for a family." },
  { id: "GM-0032", make: "Mahindra", model: "Thar", variant: "LX Hard Top 4x4", year: 2022, priceInr: 1495000, kmDriven: 23000, fuel: "Diesel", transmission: "Automatic", owners: 1, colour: "Red Rage", description: "Four-wheel-drive lifestyle SUV, diesel automatic, off-road capable." },
  { id: "GM-0033", make: "Mahindra", model: "Thar", variant: "AX (O)", year: 2021, priceInr: 1285000, kmDriven: 37000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Galaxy Grey", description: "Diesel manual off-road SUV, convertible top, weekend trail machine." },
  { id: "GM-0034", make: "Kia", model: "Seltos", variant: "HTX", year: 2020, priceInr: 1245000, kmDriven: 44000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Intelligency Blue", description: "Feature-rich mid-size SUV, petrol manual, sunroof, premium cabin." },
  { id: "GM-0035", make: "Kia", model: "Seltos", variant: "GTX+ DCT", year: 2022, priceInr: 1785000, kmDriven: 21000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Gravity Grey", description: "Turbo petrol automatic mid-size SUV, DCT gearbox, ventilated seats, Bose audio." },
  { id: "GM-0036", make: "Kia", model: "Sonet", variant: "HTK+", year: 2021, priceInr: 895000, kmDriven: 31000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Beige", description: "Diesel compact SUV, frugal, well equipped, single owner, city driven." },
  { id: "GM-0037", make: "Kia", model: "Sonet", variant: "GTX+", year: 2022, priceInr: 1145000, kmDriven: 18000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Aurora Black", description: "Turbo petrol automatic compact SUV, loaded trim, warranty remaining." },
  { id: "GM-0038", make: "Toyota", model: "Glanza", variant: "G", year: 2020, priceInr: 685000, kmDriven: 34000, fuel: "Petrol", transmission: "Manual", owners: 1, colour: "Enticing Silver", description: "Reliable premium hatchback, petrol manual, Toyota service backing." },
  { id: "GM-0039", make: "Toyota", model: "Glanza", variant: "V CVT", year: 2022, priceInr: 845000, kmDriven: 17000, fuel: "Petrol", transmission: "Automatic", owners: 1, colour: "Cafe White", description: "Automatic premium hatchback, CVT gearbox, very low running, first owner." },
  { id: "GM-0040", make: "Toyota", model: "Innova Crysta", variant: "GX", year: 2019, priceInr: 1695000, kmDriven: 88000, fuel: "Diesel", transmission: "Manual", owners: 1, colour: "Attitude Black", description: "Seven seater diesel MPV, workhorse family carrier, tour and travel ready." },
  { id: "GM-0041", make: "Toyota", model: "Innova Crysta", variant: "ZX AT", year: 2021, priceInr: 2395000, kmDriven: 54000, fuel: "Diesel", transmission: "Automatic", owners: 1, colour: "Super White", description: "Top-end automatic diesel MPV, seven seats, captain chairs, chauffeur driven." },
];

/**
 * The string that gets embedded for each row. Mirrors the production
 * approach: one denormalised sentence per vehicle rather than a JSON blob.
 */
export function carText(car: Car): string {
  return [
    String(car.year),
    car.make,
    car.model,
    car.variant,
    car.fuel,
    car.transmission,
    `${car.owners} owner`,
    car.colour,
    `${formatKm(car.kmDriven)} km`,
    `${(car.priceInr / 100000).toFixed(2)} lakh`,
    car.description,
  ].join(" ");
}

export function carLabel(car: Car): string {
  return `${car.year} ${car.make} ${car.model} ${car.variant}`;
}

/** Short price, the way a dealership quotes it: 5.85L. */
export function formatLakh(priceInr: number): string {
  return `₹${(priceInr / 100000).toFixed(2).replace(/\.00$/, "")}L`;
}

/** Full rupee amount with Indian digit grouping: 6,00,000. */
export function formatInr(value: number): string {
  const digits = Math.round(Math.abs(value)).toString();
  if (digits.length <= 3) return `₹${digits}`;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return `₹${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`;
}

/** 38,000 — plain thousands separators; odometers are not rupees. */
export function formatKm(value: number): string {
  const digits = Math.round(Math.abs(value)).toString();
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
