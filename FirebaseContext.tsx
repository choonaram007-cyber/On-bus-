import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { db, ref, get, onValue, off, seedFirebaseData } from "@/lib/firebase";
import type { Station, BusRoute, Bus } from "@/lib/firebase";

interface FirebaseContextValue {
  stations: Record<string, Station>;
  routes: Record<string, BusRoute>;
  buses: Record<string, Bus>;
  isLoading: boolean;
  error: string | null;
  searchBuses: (fromId: string, toId: string) => Array<{ id: string; bus: Bus }>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Record<string, Station>>({});
  const [routes, setRoutes] = useState<Record<string, BusRoute>>({});
  const [buses, setBuses] = useState<Record<string, Bus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stationsRef: ReturnType<typeof ref> | null = null;
    let routesRef: ReturnType<typeof ref> | null = null;
    let busesRef: ReturnType<typeof ref> | null = null;

    const initData = async () => {
      try {
        await seedFirebaseData();

        stationsRef = ref(db, "stations");
        routesRef = ref(db, "routes");
        busesRef = ref(db, "buses");

        onValue(stationsRef, (snap) => {
          if (snap.exists()) setStations(snap.val());
        });
        onValue(routesRef, (snap) => {
          if (snap.exists()) setRoutes(snap.val());
        });
        onValue(busesRef, (snap) => {
          if (snap.exists()) setBuses(snap.val());
          setIsLoading(false);
        });
      } catch (e) {
        setError("डेटा लोड करने में समस्या");
        setIsLoading(false);
      }
    };

    initData();

    return () => {
      if (stationsRef) off(stationsRef);
      if (routesRef) off(routesRef);
      if (busesRef) off(busesRef);
    };
  }, []);

  const searchBuses = (fromId: string, toId: string) => {
    return Object.entries(buses).filter(([, bus]) => {
      const route = routes[bus.routeId];
      if (!route) return false;
      const stops = route.stops.map((s) => s.stationId);
      const fromIdx = stops.indexOf(fromId);
      const toIdx = stops.indexOf(toId);

      if (fromIdx !== -1 && toIdx !== -1) {
        if (fromIdx < toIdx) return true;
        if (fromIdx > toIdx) {
          const hasReturnTrip = bus.trips.some((t) => t.isReturnTrip);
          return hasReturnTrip;
        }
      }
      return false;
    }).map(([id, bus]) => ({ id, bus }));
  };

  const value = useMemo(
    () => ({ stations, routes, buses, isLoading, error, searchBuses }),
    [stations, routes, buses, isLoading, error]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("useFirebase must be used within FirebaseProvider");
  return ctx;
}
