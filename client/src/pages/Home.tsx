import { useOutletContext } from "react-router";
import { useEffect } from "react";
export default function Home() {
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  
  // Set the title when the component loads
  useEffect(() => {
    setPageTitle("Dashboard");
  }, []);
  return (
    <div>
      <p>Welcome to the dashboard</p>
    </div>
  );
}