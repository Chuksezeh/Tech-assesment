import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { MdPeople } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { FaCoins } from "react-icons/fa";

import { getProducts } from "./services/productServices";
import type { Product } from "./services/productServices";
import "./home.scss";

interface StockFormData {
    stock: number;
}

const Home: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // <-- Success alert
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const productsPerPage = 20;

    // Filtered products
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    const lowStockCount = filteredProducts.filter((p) => p.stock < 10).length;

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch {
                setError("Failed to fetch products. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Pagination helpers
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginate = (page: number) => setCurrentPage(page);
    const getPageButtons = () => {
        const pages: (number | string)[] = [];
        const total = totalPages || 1;
        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++)
                pages.push(i);
            if (currentPage < total - 2) pages.push("...");
            pages.push(total);
        }
        return pages;
    };

    // Search handler 
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchParams(value ? { search: value } : {});
        setCurrentPage(1);
    };

    // Modal handlers
    const openModal = (product: Product) => setModalProduct(product);
    const closeModal = () => setModalProduct(null);

    const updateStock = (id: string, newStock: number) => {
        // Optimistic update
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
        );

        // Show success alert
        const productName = products.find(p => p.id === id)?.name || "Product";
        setSuccessMessage(`Stock for "${productName}" updated to ${newStock}`);
        setTimeout(() => setSuccessMessage(null), 3000);

        closeModal();
    };

    // Stock Modal
    const StockModal: React.FC<{
        product: Product;
        onClose: () => void;
        onSave: (newStock: number) => void;
    }> = ({ product, onClose, onSave }) => {
        const { register, handleSubmit, formState: { errors } } = useForm<StockFormData>({
            defaultValues: { stock: product.stock },
        });

        const submit = (data: StockFormData) => onSave(data.stock);

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <h3>Update Stock for {product.name}</h3>
                    <form onSubmit={handleSubmit(submit)} noValidate>
                        <label htmlFor="stock">Stock Quantity</label>
                        <input
                            id="stock"
                            type=""
                            {...register("stock", {
                                required: "Stock is required",
                                min: { value: 0, message: "Stock must be 0 or more" },
                                pattern: { value: /^[0-9]+$/, message: "Only integers allowed" },
                            })}
                            className={errors.stock ? "input-error" : ""}
                            placeholder="Enter stock quantity"
                        />
                        {errors.stock && (
                            <p className="error-text">{errors.stock.message}</p>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="users-page">
            {successMessage && (
                <div className="alert-success">
                    {successMessage}
                </div>
            )}

            <div className="users-wrapper">
                <div className="users-header">
                    <h2 className="users-title">Products</h2>
                </div>

                {/* Stats */}
                <div className="users-stats">
                    <div className="users-stat-card">
                        <div className="users-stat-icon purple"><MdPeople size={22} /></div>
                        <div><span>Total Products</span> - <strong>{filteredProducts.length}</strong></div>
                    </div>
                    <div className="users-stat-card">
                        <div className="users-stat-icon green"><IoIosPeople size={22} /></div>
                        <div><span>Low Stock</span> - <strong>{lowStockCount}</strong></div>
                    </div>
                    <div className="users-stat-card">
                        <div className="users-stat-icon orange"><FaCoins size={22} /></div>
                        <div><span>In Stock</span> - <strong>{filteredProducts.length - lowStockCount}</strong></div>
                    </div>
                </div>

                <div className="users-search">
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                {/* Table */}
                <div className="users-table-card">
                    {loading ? (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(10)].map((_, i) => (
                                    <tr key={i}>
                                        <td><div className="skeleton skeleton-text"></div></td>
                                        <td><div className="skeleton skeleton-text"></div></td>
                                        <td><div className="skeleton skeleton-text"></div></td>
                                        <td><div className="skeleton skeleton-text"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : error ? (
                        <div className="users-error">{error}</div>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map((product) => (
                                    <tr key={product.id} onClick={() => openModal(product)}>
                                        <td data-label="SKU">{product.sku}</td>
                                        <td data-label="Product Name">{product.name}</td>
                                        <td data-label="Category">{product.category}</td>
                                        <td data-label="Stock">{product.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {!loading && (
                        <div className="users-pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                            <div className="users-pagination-pages">
                                {getPageButtons().map((item, i) =>
                                    item === "..." ? <span key={i}>...</span> : (
                                        <button key={i} onClick={() => paginate(Number(item))} className={currentPage === item ? "active" : ""}>{item}</button>
                                    )
                                )}
                            </div>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    )}
                </div>

                {modalProduct && (
                    <StockModal
                        product={modalProduct}
                        onClose={closeModal}
                        onSave={(newStock) => updateStock(modalProduct.id, newStock)}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;