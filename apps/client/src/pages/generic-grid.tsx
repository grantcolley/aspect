import { useLocation, type Location } from "react-router-dom";

function GenericGrid() {
  const location: Location = useLocation();
  return (
    <div className="text-red-500">GenericGrid for {location.pathname}</div>
  );
}

export default GenericGrid;
