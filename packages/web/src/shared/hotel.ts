export type Room = {
  id: string;
  name: string;
  photo: string;
  price: number | null;
  capacity: number | null;
  features: string[];
  services: string[];
  description: string | null;
  availability: string | null;
};
export const hotel = {
  name: "Appart'hotel Costa Verde",
  phone: "(809) 714-6337",
  phoneLink: "+18097146337",
  whatsapp: "18097146337",
  address: "C. Cuarta 8, Santo Domingo 11117, República Dominicana",
  plusCode: "C2F3+65 Santo Domingo",
  referencePrice: 1697,
  rating: 4.1,
  reviewCount: 37,
  maps:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Appart hotel Costa Verde C. Cuarta 8 Santo Domingo República Dominicana"),
};
// Complete only with information approved by the establishment. No sample rooms are published.
export const rooms: Room[] = [];
export const seasons: { roomId: string; start: string; end: string; price: number }[] = [];
export const availability: { roomId: string; date: string; available: boolean }[] = [];
export const services = [
  { icon: "wifi", name: "Wi-Fi gratis", text: "Mantente conectado durante tu estadía." },
  { icon: "parking", name: "Estacionamiento gratis", text: "Un servicio incluido para tu visita." },
  {
    icon: "coffee",
    name: "Desayuno de pago",
    text: "Consulta opciones y precio al establecimiento.",
  },
];
export const gallery = [
  { src: "/images/exterior.webp", category: "Exterior", title: "Un rincón para desconectar" },
  {
    src: "/images/habitacion-1.webp",
    category: "Habitaciones",
    title: "Espacios para tu descanso",
  },
  { src: "/images/patio.webp", category: "Exterior", title: "El encanto de lo natural" },
  { src: "/images/habitacion-2.webp", category: "Habitaciones", title: "Una mirada al interior" },
  { src: "/images/comunes.webp", category: "Áreas comunes", title: "Espacios para compartir" },
  { src: "/images/habitacion-4.webp", category: "Habitaciones", title: "Conoce nuestros espacios" },
];
export const photoNotice =
  "Fotos de referencia de listados públicos, pendientes de validar por el alojamiento.";
