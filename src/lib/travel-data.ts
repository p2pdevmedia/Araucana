export type RouteStop = {
  name: string;
  km: number;
  minutes: number;
  note: string;
};

export type TravelRoute = {
  id: string;
  slug: string;
  from: string;
  to: string;
  via: string;
  duration: string;
  price: number;
  frequency: string;
  category: "Argentina" | "Chile";
  featured?: boolean;
  description: string;
  stops: RouteStop[];
};

export const lakes: RouteStop[] = [
  { name: "Lacar", km: 0, minutes: 0, note: "San Martin de los Andes" },
  { name: "Machonico", km: 38, minutes: 45, note: "Ingreso al corredor" },
  { name: "Falkner", km: 56, minutes: 70, note: "Mirador y cascada" },
  { name: "Villarino", km: 60, minutes: 78, note: "Bosque andino" },
  { name: "Escondido", km: 62, minutes: 82, note: "Parada tecnica" },
  { name: "Correntoso", km: 91, minutes: 130, note: "Villa La Angostura" },
  { name: "Espejo", km: 99, minutes: 145, note: "Ultimo lago" }
];

export const routes: TravelRoute[] = [
  {
    id: "r1",
    slug: "sma-bariloche-7-lagos",
    from: "SMA",
    to: "Bariloche",
    via: "Camino de los 7 Lagos",
    duration: "4h 30m",
    price: 18900,
    frequency: "Diaria · 08:30 y 14:00",
    category: "Argentina",
    featured: true,
    description:
      "La ruta signature de Araucana: San Martin, Villa La Angostura y Bariloche unidos por Ruta 40, lagos, miradores y guia bilingue.",
    stops: lakes
  },
  {
    id: "r2",
    slug: "sma-villa-la-angostura",
    from: "SMA",
    to: "Villa La Angostura",
    via: "Ruta 40",
    duration: "2h 30m",
    price: 9800,
    frequency: "Diaria · 09:00 y 16:30",
    category: "Argentina",
    description:
      "Conexion directa entre San Martin y Villa La Angostura, ideal para moverse por el corredor de los lagos.",
    stops: lakes.slice(0, 7)
  },
  {
    id: "r3",
    slug: "bariloche-sma-7-lagos",
    from: "Bariloche",
    to: "SMA",
    via: "Camino de los 7 Lagos",
    duration: "4h 30m",
    price: 18900,
    frequency: "Diaria · 09:00 y 15:30",
    category: "Argentina",
    description:
      "Regreso desde Bariloche a San Martin con paradas programadas y asistencia a bordo.",
    stops: [...lakes].reverse()
  },
  {
    id: "r4",
    slug: "sma-pucon-mamuil-malal",
    from: "SMA",
    to: "Pucon (CL)",
    via: "Paso Mamuil Malal",
    duration: "5h 15m",
    price: 32400,
    frequency: "Lun · Mie · Vie · 07:00",
    category: "Chile",
    description:
      "Cruce internacional a Chile con asistencia documental y acompanamiento en aduana.",
    stops: [
      { name: "SMA", km: 0, minutes: 0, note: "Salida" },
      { name: "Junin de los Andes", km: 42, minutes: 45, note: "Parada breve" },
      { name: "Mamuil Malal", km: 110, minutes: 150, note: "Aduana" },
      { name: "Pucon", km: 210, minutes: 315, note: "Destino" }
    ]
  },
  {
    id: "r5",
    slug: "bariloche-puerto-varas-samore",
    from: "Bariloche",
    to: "Puerto Varas (CL)",
    via: "Paso Cardenal Samore",
    duration: "7h",
    price: 38900,
    frequency: "Mar · Jue · Sab · 06:30",
    category: "Chile",
    description:
      "Cruce andino desde Bariloche hacia la zona de los lagos chilenos, con asistencia de frontera.",
    stops: [
      { name: "Bariloche", km: 0, minutes: 0, note: "Salida" },
      { name: "Villa La Angostura", km: 83, minutes: 85, note: "Conexion" },
      { name: "Cardenal Samore", km: 130, minutes: 210, note: "Aduana" },
      { name: "Puerto Varas", km: 320, minutes: 420, note: "Destino" }
    ]
  }
];

export const schedules = [
  { route: "SMA → Bariloche", date: "Mar 12 nov", time: "08:30", seats: 14, status: "Abierta" },
  { route: "SMA → Bariloche", date: "Mar 12 nov", time: "14:00", seats: 9, status: "Abierta" },
  { route: "SMA → Pucon", date: "Mie 13 nov", time: "07:00", seats: 18, status: "Documentacion" }
];

export const reservations = [
  { code: "ARC-2511-A6X", passenger: "Camila Vidal", route: "SMA → Bariloche", seat: "16", status: "Confirmada" },
  { code: "ARC-2511-B9K", passenger: "Martin Keller", route: "SMA → Pucon", seat: "08", status: "Docs pendientes" }
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price);
}

export function getRouteBySlug(slug: string) {
  return routes.find((route) => route.slug === slug);
}
