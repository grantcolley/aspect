import { useLocation, type Location } from "react-router-dom";

export default function GenericGrid() {
  const location: Location = useLocation();
  return (
    <div className="text-red-500">GenericGrid for {location.pathname}</div>
  );
}
