// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { API_BASE_URL } from '../../config';
import "./styles/Module.AdminPanel.css";

const AdminPanel = () => {
    const { user, token } = React.useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('productos');
    const [productSubTab, setProductSubTab] = useState('habilitados');
    const navigate = useNavigate();

    const role = user?.role;
    const currentUserId = user?.Id;

    useEffect(() => {
        if (!token || !role || role.toLowerCase() !== 'admin') {
            navigate('/');
        } else {
            fetchProducts();
        }
    }, [token, role]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/User`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            });

            if (!response.ok) throw new Error('Error al cargar usuarios');

            const data = await response.json();
            const normalizedUsers = (Array.isArray(data) ? data : []).map(u => ({
                Id: u.Id || u.id,
                Nombre: u.Nombre || u.nombre || 'Sin nombre',
                Email: u.Email || u.email || 'Sin email',
                Rol: u.rol || u.Rol || u.role || 'user',
            })).filter(u => u.Id !== currentUserId);

            setUsers(normalizedUsers);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('page', '1');
            formData.append('limit', '100');

            const response = await fetch(`${API_BASE_URL}/api/Product/ListOfProducts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Error al cargar productos');

            const data = await response.json();
            const productItems = data.items || [];
            const filteredProducts = productItems.filter(p => p.IsActive === (productSubTab === 'habilitados'));
            const normalized = filteredProducts.map(p => ({
                Id: p.Id || p.id,
                Brand: p.Brand || p.brand,
                Model: p.Model || p.model,
                Description: p.Description || p.description,
                Caracteristicas: p.details || p.Details,
                Price: p.Precio || p.precio,
                Stock: p.Stock || p.stock,
                Category: p.Category || p.category,
                Imagenes: p.Imagenes || [],
                IsActive: p.IsActive ?? true,
            }));

            setProducts(normalized);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleActiveState = async (product) => {
        await handleProductAction({ ...product, IsActive: !product.IsActive });
    }

    const handleProductAction = async (productData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('Id', productData.Id || 0);
            formData.append('Brand', productData.Brand || '');
            formData.append('Model', productData.Model || '');
            formData.append('Description', productData.Description || '');
            formData.append('Details', productData.Caracteristicas || '');
            formData.append('Precio', productData.Price || 0);
            formData.append('Stock', productData.Stock || 0);
            formData.append('Category', productData.Category || '');
            formData.append('IsActive', productData.IsActive ? 'true' : 'false');

            if (productData.Images && productData.Images.length > 0) {
                productData.Images.forEach((file) => {
                    formData.append('Files', file);
                });
            }

            const url = productData.Id
                ? `${API_BASE_URL}/api/Product/UpdateProduct/${productData.Id}`
                : `${API_BASE_URL}/api/Product/AddProduct`;

            const method = productData.Id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Error al guardar producto');

            setShowModal(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (product = null) => {
        setSelectedProduct(product || {
            Id: null,
            Brand: '',
            Model: '',
            Description: '',
            Caracteristicas: '',
            Price: '',
            Stock: '',
            Category: '',
            Images: [],
            IsActive: true,
        });
        setShowModal(true);
    };

    return (
        <div className="admin-panel">
            <h2>Panel de Administración</h2>
            <div className="tab-buttons">
                <button className={activeTab === 'productos' ? 'active' : ''} onClick={() => { setActiveTab('productos'); fetchProducts(); }}>Productos</button>
                <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => { setActiveTab('usuarios'); fetchUsers(); }}>Usuarios</button>
            </div>

            {error && <p className="error">{error}</p>}
            {loading && <p>Cargando...</p>}

            {activeTab === 'usuarios' && (
                <div>
                    <h3>Gestión de Usuarios</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.Id}>
                                    <td>{user.Id}</td>
                                    <td>{user.Nombre}</td>
                                    <td>{user.Email}</td>
                                    <td>{user.Rol}</td>
                                    <td>
                                        <select value={user.Rol} onChange={(e) => handleRoleChange(user.Id, e.target.value)}>
                                            <option value="user">Usuario</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'productos' && (
                <div>
                    <h3>Gestión de Productos</h3>
                    <div className="subtab-buttons">
                        <button className={productSubTab === 'habilitados' ? 'active' : ''} onClick={() => { setProductSubTab('habilitados'); fetchProducts(); }}>Habilitados</button>
                        <button className={productSubTab === 'deshabilitados' ? 'active' : ''} onClick={() => { setProductSubTab('deshabilitados'); fetchProducts(); }}>Deshabilitados</button>
                    </div>
                    <button className="btn-add" onClick={() => openModal()}>Añadir Producto</button>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Descripción</th>
                                <th>Características</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.Id}>
                                    <td>{product.Id}</td>
                                    <td>{product.Brand}</td>
                                    <td>{product.Model}</td>
                                    <td>{product.Description}</td>
                                    <td>{product.Caracteristicas}</td>
                                    <td>{product.Price}</td>
                                    <td>{product.Stock}</td>
                                    <td>{product.Category}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openModal(product)}>Editar</button>
                                        <button className="btn-delete" onClick={() => toggleActiveState(product)}>
                                            {product.IsActive ? 'Deshabilitar' : 'Habilitar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
