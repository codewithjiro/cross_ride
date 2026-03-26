// Shared data for vans and drivers
// Used in booking forms and marketing pages

export const VANS = [
  {
    id: "1",
    name: "Hiace Commuter Deluxe",
    capacity: 14,
    color: "from-blue-500 to-blue-600",
    image: "/images/deluxe.png",
    description: "Comfortable air-conditioned transport for daily commutes",
  },
  {
    id: "2",
    name: "Hiace Grandia",
    capacity: 11,
    color: "from-purple-500 to-purple-600",
    image: "/images/grandia.png",
    description: "Premium executive van with enhanced comfort features",
  },
  {
    id: "3",
    name: "L300 Van",
    capacity: 10,
    color: "from-emerald-500 to-emerald-600",
    image: "/images/L300.png",
    description: "Reliable and efficient transport for flexible routes",
  },
];

export const DRIVERS = [
  {
    id: "1",
    name: "Jiro Gonzales",
    role: "Senior Driver",
    image: "/drivers/jiro.jpg",
    experience: "10+ Years",
    specialization: "Fleet Coordinator",
  },
  {
    id: "2",
    name: "Jenah Ambagan",
    role: "Professional Driver",
    image: "/drivers/jenah.jpg",
    experience: "10+ Years",
    specialization: "Safety Specialist",
  },
  {
    id: "3",
    name: "Joyce Manaloto",
    role: "Professional Driver",
    image: "/drivers/joyce.jpg",
    experience: "8+ Years",
    specialization: "Route Expert",
  },
  {
    id: "4",
    name: "Venice Bumagat",
    role: "Professional Driver",
    image: "/drivers/venice.jpg",
    experience: "8+ Years",
    specialization: "Customer Care",
  },
];

export type Van = (typeof VANS)[0];
export type Driver = (typeof DRIVERS)[0];
