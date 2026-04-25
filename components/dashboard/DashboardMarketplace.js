"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardProductCard from "./DashboardProductCard";
import UploadProductModal from "./UploadProductModal";
import "./dashboard-marketplace.css";

export default function DashboardMarketplace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Redirect if not authenticated or not a client/admin/employee
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web-development", label: "Web Development" },
    { value: "app-development", label: "App Development" },
    { value: "ui-ux-design", label: "UI/UX Design" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "software-development", label: "Software Development" },
    { value: "ai-intelligent-systems", label: "AI Intelligent Systems" },
    { value: "research-and-analytics", label: "Research & Analytics" },
  ];

  useEffect(() => {
    fetchProducts();
  }, [category, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        category,
        page,
        limit: 12,
      }).toString();

      const res = await fetch(`/api/marketplace/products?${query}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="dashboard-marketplace-loading">
        <div className="spinner"></div>
        <p>Loading marketplace...</p>
      </div>
    );
  }

  const canUpload = session?.user?.role && ["admin", "employee"].includes(session.user.role);

  return (
    <div className="dashboard-marketplace-container">
      <div className="dashboard-marketplace-header">
        <div>
          <h2>Portfolio Marketplace</h2>
          <p>Explore and discover amazing website portfolios</p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-upload-product"
          >
            + Upload Product
          </button>
        )}
      </div>

      <div className="dashboard-marketplace-controls">
        <div className="category-filter">
          <label htmlFor="category">Filter by Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="category-select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-marketplace-loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <DashboardProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="no-products">
                <p>No products found in this category</p>
              </div>
            )}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="dashboard-pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showUploadModal && (
        <UploadProductModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
