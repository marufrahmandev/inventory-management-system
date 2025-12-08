import React from 'react'
import { useOutletContext } from 'react-router';
import { useEffect } from 'react';
function PurchaseOrder() {  
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  
  useEffect(() => {
    setPageTitle("Purchase Order");
  }, []);
  return (  
    <div>
      <h1>Purchase Order</h1>
      <p>Welcome to the purchase order page</p>
    </div>
  )
}

export default PurchaseOrder