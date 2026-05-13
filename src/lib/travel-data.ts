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
  departureTime: string;
  arrivalTime: string;
  serviceStart: string;
  serviceEnd: string;
};

function stop(name: string, time: string, minutes: number, note: string): RouteStop {
  return { name, km: 0, minutes, note: `${note} ${time}` };
}

export const lakes: RouteStop[] = [
  { name: "Lacar", km: 0, minutes: 0, note: "San Martin de los Andes" },
  { name: "Catrite", km: 0, minutes: 0, note: "Primera parada hacia Traful" },
  { name: "Rio Hermoso", km: 0, minutes: 30, note: "Puente y acceso al corredor" },
  { name: "Lago Hermoso", km: 0, minutes: 37, note: "Acceso Lago Hermoso" },
  { name: "Falkner", km: 0, minutes: 51, note: "Parada del Camino de los 7 Lagos" },
  { name: "Pichi Traful", km: 0, minutes: 69, note: "Acceso Pichi Traful" },
  { name: "Villa Traful", km: 0, minutes: 135, note: "Destino lacustre" }
];

export const routes: TravelRoute[] = [
  {
    id: "route-sma-villa-traful-2026",
    slug: "sma-villa-traful-verano-2026",
    from: "San Martin de los Andes",
    to: "Villa Traful",
    via: "Ruta 40 - 7 Lagos",
    duration: "2h 15m",
    price: 0,
    frequency: "Todos los dias · 10:00",
    category: "Argentina",
    featured: true,
    departureTime: "10:00",
    arrivalTime: "12:15",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Servicio diario de verano desde San Martin de los Andes hasta Villa Traful, con paradas en Catrite, Rio Hermoso, Lago Hermoso, Falkner, Pichi Traful, Ruta Provincial 65 y Puerto Arrayan. Tarifa a confirmar.",
    stops: [
      stop("S. M. Andes", "10:00", 0, "Sale"),
      stop("Catrite", "10:00", 0, "Pasa"),
      stop("Pte. Rio Hermoso", "10:30", 30, "Pasa"),
      stop("Acceso Lago Hermoso", "10:37", 37, "Pasa"),
      stop("Falkner", "10:51", 51, "Pasa"),
      stop("Acceso Pichi Traful", "11:09", 69, "Pasa"),
      stop("Emp. Ruta Prov. 65", "11:38", 98, "Pasa"),
      stop("Puerto Arrayan", "11:54", 114, "Pasa"),
      stop("Villa Traful", "12:15", 135, "Llega")
    ]
  },
  {
    id: "route-villa-traful-sma-2026",
    slug: "villa-traful-sma-verano-2026",
    from: "Villa Traful",
    to: "San Martin de los Andes",
    via: "Ruta 40 - 7 Lagos",
    duration: "2h 15m",
    price: 0,
    frequency: "Todos los dias · 17:30",
    category: "Argentina",
    departureTime: "17:30",
    arrivalTime: "19:45",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Regreso diario de verano desde Villa Traful a San Martin de los Andes por Puerto Arrayan, Ruta Provincial 65, Pichi Traful, Falkner y Lago Hermoso. Tarifa a confirmar.",
    stops: [
      stop("Villa Traful", "17:30", 0, "Sale"),
      stop("Puerto Arrayan", "17:51", 21, "Pasa"),
      stop("Emp. Ruta Prov. 65", "18:07", 37, "Pasa"),
      stop("Acceso Pichi Traful", "18:35", 65, "Pasa"),
      stop("Falkner", "18:45", 75, "Pasa"),
      stop("Acceso Lago Hermoso", "19:08", 98, "Pasa"),
      stop("Pte. Rio Hermoso", "19:15", 105, "Pasa"),
      stop("S. M. Andes", "19:45", 135, "Llega")
    ]
  },
  {
    id: "route-vla-villa-traful-2026",
    slug: "villa-la-angostura-villa-traful-verano-2026",
    from: "Villa La Angostura",
    to: "Villa Traful",
    via: "Ruta 40 - Ruta Provincial 65",
    duration: "1h 30m",
    price: 0,
    frequency: "Todos los dias · 11:00",
    category: "Argentina",
    departureTime: "11:00",
    arrivalTime: "12:30",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Servicio diario de verano desde Villa La Angostura hacia Villa Traful por Lago Espejo, Ruca Malen, empalme Ruta Provincial 65 y Puerto Arrayan. Tarifa a confirmar.",
    stops: [
      stop("Villa La Angostura", "11:00", 0, "Sale"),
      stop("Lago Espejo", "11:20", 20, "Pasa"),
      stop("Ruca Malen", "11:40", 40, "Pasa"),
      stop("Emp. Ruta Prov. 65", "11:53", 53, "Pasa"),
      stop("Puerto Arrayan", "12:09", 69, "Pasa"),
      stop("Villa Traful", "12:30", 90, "Llega")
    ]
  },
  {
    id: "route-villa-traful-vla-2026",
    slug: "villa-traful-villa-la-angostura-verano-2026",
    from: "Villa Traful",
    to: "Villa La Angostura",
    via: "Ruta Provincial 65 - Ruta 40",
    duration: "1h 30m",
    price: 0,
    frequency: "Todos los dias · 17:30",
    category: "Argentina",
    departureTime: "17:30",
    arrivalTime: "19:00",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Regreso diario de verano desde Villa Traful hacia Villa La Angostura por Puerto Arrayan, Ruta Provincial 65, Ruca Malen y Lago Espejo. Tarifa a confirmar.",
    stops: [
      stop("Villa Traful", "17:30", 0, "Sale"),
      stop("Puerto Arrayan", "17:51", 21, "Pasa"),
      stop("Emp. Ruta Prov. 65", "18:07", 37, "Pasa"),
      stop("Ruca Malen", "18:20", 50, "Pasa"),
      stop("Lago Espejo", "18:40", 70, "Pasa"),
      stop("Villa La Angostura", "19:00", 90, "Llega")
    ]
  },
  {
    id: "route-sma-hua-hum-2026",
    slug: "sma-hua-hum-verano-2026",
    from: "San Martin de los Andes",
    to: "Hua Hum",
    via: "Lago Lacar - Yuco",
    duration: "1h 30m",
    price: 0,
    frequency: "Todos los dias · 10:30",
    category: "Argentina",
    departureTime: "10:30",
    arrivalTime: "12:00",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Servicio diario de verano desde San Martin de los Andes hacia Hua Hum con parada en Yuco. Tarifa a confirmar.",
    stops: [
      stop("S. M. Andes", "10:30", 0, "Sale"),
      stop("Yuco", "11:30", 60, "Pasa"),
      stop("Hua Hum", "12:00", 90, "Llega")
    ]
  },
  {
    id: "route-hua-hum-sma-2026",
    slug: "hua-hum-sma-verano-2026",
    from: "Hua Hum",
    to: "San Martin de los Andes",
    via: "Yuco - Lago Lacar",
    duration: "1h 30m",
    price: 0,
    frequency: "Todos los dias · 17:00",
    category: "Argentina",
    departureTime: "17:00",
    arrivalTime: "18:30",
    serviceStart: "2026-01-02",
    serviceEnd: "2026-03-01",
    description:
      "Regreso diario de verano desde Hua Hum a San Martin de los Andes con parada en Yuco. Tarifa a confirmar.",
    stops: [
      stop("Hua Hum", "17:00", 0, "Sale"),
      stop("Yuco", "17:30", 30, "Pasa"),
      stop("S. M. Andes", "18:30", 90, "Llega")
    ]
  }
];

export const schedules = routes.map((route) => ({
  route: `${route.from} -> ${route.to}`,
  date: "02 ene - 01 mar 2026",
  time: route.departureTime,
  seats: 24,
  status: "Abierta"
}));

export const reservations: Array<{
  code: string;
  passenger: string;
  route: string;
  seat: string;
  status: string;
}> = [];

export function formatPrice(price: number) {
  if (price <= 0) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(price);
}

export function getRouteBySlug(slug: string) {
  return routes.find((route) => route.slug === slug);
}
