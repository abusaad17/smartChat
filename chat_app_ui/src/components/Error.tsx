import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft} from "lucide-react";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex justify-center items-center h-svh">
      <div className="flex justify-center flex-col gap-4">
        <h1 className="text-center">Oops!</h1>
        <p>404 not found!</p>
        <Button className="flex gap-2">
          <ChevronLeft />
          <Link to="/"> back</Link>
        </Button>
      </div>
    </div>
  );
}
