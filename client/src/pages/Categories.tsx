import React, { useEffect } from 'react'
import { useOutletContext } from 'react-router';

function Categories() {
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  
  useEffect(() => {
    setPageTitle("Categories");
  }, []);
  return (
    <div>
      <h1>Categories</h1>
      <p>Welcome to the categories page</p>
    </div>
  )
}

export default Categories