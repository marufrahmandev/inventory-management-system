import React, { useEffect } from 'react'
import { useOutletContext } from 'react-router';

function Products() {
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  
  useEffect(() => {
    setPageTitle("Products");
  }, []);
  return (
    <div>
      <h1>Products</h1>
      <p>Welcome to the products page</p>
    </div>
  )
}

export default Products