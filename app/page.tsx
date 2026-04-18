import TripApp from "@/components/TripApp";
import { defaultTrip } from "@/lib/trip";

export default function Page() {
  return <TripApp initialTrip={defaultTrip} />;
}
