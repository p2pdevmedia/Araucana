"use client";

import { useEffect, useRef, useState } from "react";
import { DRIVER_LOCATION_UPDATE_INTERVAL_MS } from "@/lib/driver/location";

type DriverVehicle = {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string | null;
};

type DriverLocationPanelProps = {
  vehicles: DriverVehicle[];
  initialVehicleId?: string;
};

type ShareState = "idle" | "sharing" | "error";

function vehicleLabel(vehicle: DriverVehicle) {
  return `${vehicle.name} · ${vehicle.brand} ${vehicle.model}${vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ""}`;
}

export function DriverLocationPanel({ vehicles, initialVehicleId = "" }: DriverLocationPanelProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [message, setMessage] = useState("");
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (shareState !== "sharing" || !selectedVehicleId) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setShareState("error");
      setMessage("Este dispositivo no permite compartir ubicacion.");
      return;
    }

    let stopped = false;

    async function sendPosition(position: GeolocationPosition) {
      if (isSendingRef.current || stopped) {
        return;
      }

      isSendingRef.current = true;

      try {
        const response = await fetch("/api/v1/driver/location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            vehicleId: selectedVehicleId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            recordedAt: new Date(position.timestamp).toISOString()
          })
        });

        if (!response.ok) {
          throw new Error("No pudimos actualizar la ubicacion.");
        }

        setMessage(`Ubicacion actualizada ${new Date().toLocaleTimeString("es-AR", { timeStyle: "medium" })}`);
      } catch (error) {
        setShareState("error");
        setMessage(error instanceof Error ? error.message : "No pudimos actualizar la ubicacion.");
      } finally {
        isSendingRef.current = false;
      }
    }

    function requestPosition() {
      navigator.geolocation.getCurrentPosition(
        sendPosition,
        () => {
          setShareState("error");
          setMessage("No pudimos leer tu ubicacion. Revisa el permiso del navegador.");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 8000
        }
      );
    }

    requestPosition();
    const intervalId = window.setInterval(requestPosition, DRIVER_LOCATION_UPDATE_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [selectedVehicleId, shareState]);

  const canShare = vehicles.length > 0 && selectedVehicleId;

  return (
    <section className="plain-card admin-section">
      <div className="admin-form-grid">
        <label className="span-2">
          Nave
          <select
            value={selectedVehicleId}
            onChange={(event) => {
              setSelectedVehicleId(event.target.value);
              setShareState("idle");
              setMessage("");
            }}
          >
            <option value="">Elegir nave</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </label>

        <div className="span-2 table-actions">
          <button
            className="button"
            type="button"
            disabled={!canShare || shareState === "sharing"}
            onClick={() => {
              setMessage("Compartiendo ubicacion...");
              setShareState("sharing");
            }}
          >
            Compartir ubicacion
          </button>
          <button
            className="ghost-button"
            type="button"
            disabled={shareState !== "sharing"}
            onClick={() => {
              setShareState("idle");
              setMessage("Ubicacion pausada.");
            }}
          >
            Pausar
          </button>
        </div>

        {message ? <p className={shareState === "error" ? "error span-2" : "muted span-2"}>{message}</p> : null}
      </div>
    </section>
  );
}
