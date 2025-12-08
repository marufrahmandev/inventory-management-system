import { useOutletContext } from "react-router";
import { useEffect } from "react";
export default function Home() {
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  
  useEffect(() => {
    setPageTitle("Dashboard");
  }, []);
  return (
    <div>
      <p>Welcome to the dashboard</p>
    </div>
  );
}