import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDc5rsbsKl1c-uYySOFDRkqIqGr9LoOIMI",
  authDomain: "new-bus-treking.firebaseapp.com",
  databaseURL: "https://new-bus-treking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "new-bus-treking",
  storageBucket: "new-bus-treking.firebasestorage.app",
  messagingSenderId: "1044937747406",
  appId: "1:1044937747406:web:da9b5237f52acc979cd99f",
  measurementId: "G-KCYBVZLHWZ",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, get, set, onValue, off };

export interface Station {
  name: string;
  city: string;
  lat: number;
  lng: number;
  searchTerms: string[];
}

export interface RouteStop {
  stationId: string;
  distance: string;
}

export interface BusRoute {
  name: string;
  fromStation: string;
  toStation: string;
  totalDistance: string;
  forwardTravelTime: string;
  returnTravelTime: string;
  stops: RouteStop[];
}

export interface Trip {
  id: string;
  departure: string;
  arrival: string;
  direction: "forward" | "return";
  isReturnTrip: boolean;
  delay: number;
}

export interface Bus {
  busNumber: string;
  busName: string;
  busCode: string;
  type: string;
  fare: string;
  totalSeats: number;
  amenities: string[];
  routeId: string;
  fromStation: string;
  toStation: string;
  crowd: string;
  availableSeats: number;
  trips: Trip[];
}

export const seedFirebaseData = async () => {
  const dbRef = ref(db, "/");
  const snapshot = await get(dbRef);
  if (snapshot.exists()) return;

  const data = {
    stations: {
      barmer_stand: {
        name: "बाड़मेर बस स्टैंड",
        city: "बाड़मेर",
        lat: 25.7510,
        lng: 71.4116,
        searchTerms: ["barmer", "बाड़मेर", "बाडमेर"],
      },
      chouhtan_stand: {
        name: "चौहटन बस स्टैंड",
        city: "चौहटन",
        lat: 25.8768,
        lng: 71.8925,
        searchTerms: ["chouhtan", "चौहटन"],
      },
      nimbdi: {
        name: "निम्बड़ी",
        city: "बाड़मेर",
        lat: 25.6137,
        lng: 71.2818,
        searchTerms: ["nimbdi", "निम्बड़ी"],
      },
      taratra: {
        name: "तारात्रा",
        city: "बाड़मेर",
        lat: 25.5918,
        lng: 71.2334,
        searchTerms: ["taratra", "तारात्रा"],
      },
      balotra: {
        name: "बालोतरा बस स्टैंड",
        city: "बालोतरा",
        lat: 25.8327,
        lng: 72.2381,
        searchTerms: ["balotra", "बालोतरा"],
      },
      jaisalmer_stand: {
        name: "जैसलमेर बस स्टैंड",
        city: "जैसलमेर",
        lat: 26.9157,
        lng: 70.9083,
        searchTerms: ["jaisalmer", "जैसलमेर"],
      },
    },
    routes: {
      route_barmer_chouhtan: {
        name: "बाड़मेर-चौहटन रूट",
        fromStation: "barmer_stand",
        toStation: "chouhtan_stand",
        totalDistance: "60 किमी",
        forwardTravelTime: "2h 0m",
        returnTravelTime: "2h 0m",
        stops: [
          { stationId: "barmer_stand", distance: "0 किमी" },
          { stationId: "nimbdi", distance: "20 किमी" },
          { stationId: "taratra", distance: "40 किमी" },
          { stationId: "chouhtan_stand", distance: "60 किमी" },
        ],
      },
      route_barmer_balotra: {
        name: "बाड़मेर-बालोतरा रूट",
        fromStation: "barmer_stand",
        toStation: "balotra",
        totalDistance: "75 किमी",
        forwardTravelTime: "2h 30m",
        returnTravelTime: "2h 30m",
        stops: [
          { stationId: "barmer_stand", distance: "0 किमी" },
          { stationId: "balotra", distance: "75 किमी" },
        ],
      },
      route_barmer_jaisalmer: {
        name: "बाड़मेर-जैसलमेर रूट",
        fromStation: "barmer_stand",
        toStation: "jaisalmer_stand",
        totalDistance: "153 किमी",
        forwardTravelTime: "4h 0m",
        returnTravelTime: "4h 0m",
        stops: [
          { stationId: "barmer_stand", distance: "0 किमी" },
          { stationId: "jaisalmer_stand", distance: "153 किमी" },
        ],
      },
    },
    buses: {
      jodha_baba: {
        busNumber: "RJ19-Pd-1761",
        busName: "जोधा बाबा",
        busCode: "PVT",
        type: "नॉन-AC बस",
        fare: "₹60",
        totalSeats: 52,
        amenities: ["सामान्य सीटें", "सामान"],
        routeId: "route_barmer_chouhtan",
        fromStation: "barmer_stand",
        toStation: "chouhtan_stand",
        crowd: "मध्यम",
        availableSeats: 40,
        trips: [
          { id: "t1", departure: "09:30", arrival: "11:30", direction: "forward", isReturnTrip: false, delay: 0 },
          { id: "t2", departure: "13:00", arrival: "15:00", direction: "return", isReturnTrip: true, delay: 0 },
          { id: "t3", departure: "16:30", arrival: "18:30", direction: "forward", isReturnTrip: false, delay: 10 },
        ],
      },
      shree_ram: {
        busNumber: "RJ19-SA-2234",
        busName: "श्री राम",
        busCode: "RSRTC",
        type: "AC बस",
        fare: "₹90",
        totalSeats: 45,
        amenities: ["AC", "आरामदायक सीटें", "मोबाइल चार्जिंग"],
        routeId: "route_barmer_chouhtan",
        fromStation: "barmer_stand",
        toStation: "chouhtan_stand",
        crowd: "कम",
        availableSeats: 30,
        trips: [
          { id: "t1", departure: "07:00", arrival: "09:00", direction: "forward", isReturnTrip: false, delay: 0 },
          { id: "t2", departure: "14:30", arrival: "16:30", direction: "forward", isReturnTrip: false, delay: 15 },
        ],
      },
      desert_express: {
        busNumber: "RJ19-DE-5521",
        busName: "डेजर्ट एक्सप्रेस",
        busCode: "PVT",
        type: "AC स्लीपर",
        fare: "₹250",
        totalSeats: 36,
        amenities: ["AC", "स्लीपर", "WiFi", "चार्जिंग पोर्ट"],
        routeId: "route_barmer_jaisalmer",
        fromStation: "barmer_stand",
        toStation: "jaisalmer_stand",
        crowd: "अधिक",
        availableSeats: 8,
        trips: [
          { id: "t1", departure: "22:00", arrival: "02:00", direction: "forward", isReturnTrip: false, delay: 0 },
          { id: "t2", departure: "06:00", arrival: "10:00", direction: "forward", isReturnTrip: false, delay: 0 },
        ],
      },
      rajdhani_travels: {
        busNumber: "RJ19-RT-8890",
        busName: "राजधानी ट्रैवल्स",
        busCode: "PVT",
        type: "नॉन-AC बस",
        fare: "₹120",
        totalSeats: 52,
        amenities: ["सामान्य सीटें", "सामान", "पानी"],
        routeId: "route_barmer_balotra",
        fromStation: "barmer_stand",
        toStation: "balotra",
        crowd: "मध्यम",
        availableSeats: 25,
        trips: [
          { id: "t1", departure: "08:00", arrival: "10:30", direction: "forward", isReturnTrip: false, delay: 0 },
          { id: "t2", departure: "12:00", arrival: "14:30", direction: "forward", isReturnTrip: false, delay: 5 },
          { id: "t3", departure: "17:00", arrival: "19:30", direction: "forward", isReturnTrip: false, delay: 0 },
        ],
      },
    },
  };

  await set(ref(db, "/"), data);
};
