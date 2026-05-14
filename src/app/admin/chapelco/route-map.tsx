type RouteMapStop = {
  id: string;
  pickupName: string;
  pickupLatitude: number;
  pickupLongitude: number;
};

export function ChapelcoRouteMap({ stops }: { stops: RouteMapStop[] }) {
  return (
    <div className="chapelco-admin-map" aria-label="Mapa de paradas Chapelco">
      {stops.map((stop) => (
        <span
          className="map-marker"
          key={stop.id}
          title={stop.pickupName}
          style={{
            left: `${Math.max(4, Math.min(96, ((stop.pickupLongitude + 71.43) / 0.18) * 100))}%`,
            top: `${Math.max(4, Math.min(96, ((-40.11 - stop.pickupLatitude) / 0.1) * 100))}%`
          }}
        />
      ))}
    </div>
  );
}
