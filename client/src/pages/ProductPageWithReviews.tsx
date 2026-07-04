import React from 'react';
import ProductDetailsPage from './ProductDetailsPage';
import ProductReviews from './ProductReviews';

export default function ProductPageWithReviews() {
  return (
    <>
      <ProductDetailsPage />
      <ProductReviews />
    </>
  );
}
