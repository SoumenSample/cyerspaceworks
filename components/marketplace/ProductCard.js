"use client";
import { useState } from "react";
import InterestForm from "./InterestForm";
import "./marketplace.css";

export default function ProductCard({ product }) {
  const [showInterestForm, setShowInterestForm] = useState(false);
  const displayPrice = Number(product.price) === 0 ? "Free" : `₹${product.price}`;

  return (
    <>
      <div className="product-card">
        <div className="product-image-wrapper">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="product-image"
          />
          <div className="product-category">{product.category.replace("-", " ")}</div>
        </div>

        <div className="product-content">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-description">{product.description}</p>

          {/* <div className="product-stats">
            <span className="stat">
              <i>👁️</i> {product.views} views
            </span>
            <span className="stat">
              <i>❤️</i> {product.interests} interests
            </span>
          </div> */}

          <div className="product-price">
            <span className="price">{displayPrice}</span>
            <span className="by">by {product.createdByName}</span>
          </div>

          <div className="product-actions">
            <a
              href={product.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-demo"
            >
              View Demo 🔗
            </a>
            <button
              onClick={() => setShowInterestForm(true)}
              className="btn btn-interest"
            >
              I'm Interested 💌
            </button>
          </div>
        </div>
      </div>

      {showInterestForm && (
        <InterestForm
          productId={product._id}
          productTitle={product.title}
          onClose={() => setShowInterestForm(false)}
        />
      )}
    </>
  );
}
