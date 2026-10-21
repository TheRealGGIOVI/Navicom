import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthProvider";
import { useNotification } from "../context/NotificationContext.jsx";
import { API_BASE_URL } from '../../config';
import "./styles/Module.AdminPanel.css";

const AdminPanel = () => {
    const { user, token } = React.useContext(AuthContext);
    const { toast } = useNotification();
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('productos');
    const [isActiveFilter, setIsActiveFilter] = useState(true); // 👈 NUEVO

    const navigate = useNavigate();
    const role = user?.role;
    const currentUserId = user?.Id;

    useEffect(() => {
        if (!token || !role || role.toLowerCase() !== 'admin') {
            navigate('/');
        } else {
            fetchProducts();
        }
    }, [token, role, isActiveFilter]); // 👈 recarga cuando cambia el filtro

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

            if (!response.ok) {
                if (response.status === 401) {
                    sessionStorage.clear();
                    localStorage.clear();
                    navigate('/login-register');
                    throw new Error('No autorizado');
                }
                throw new Error('Error al cargar usuarios');
            }

            const data = await response.json();
            const normalizedUsers = Array.isArray(data) ? data.map(u => ({
                Id: u.Id || u.id,
                Nombre: u.Nombre || u.nombre || 'Sin nombre',
                Email: u.Email || u.email || 'Sin email',
                Rol: u.rol || u.Rol || u.role || 'user',
            })) : [];
            setUsers(normalizedUsers.filter(u => u.Id !== currentUserId));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/User/update-role/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newRole }),
            });

            if (!response.ok) throw new Error('Error al actualizar el rol');

            const result = await response.json();
            toast.success(result.message || 'Rol actualizado con éxito', '¡Actualizado!');
            fetchUsers();
        } catch (err) {
            console.error(err);
            setError('Error al actualizar el rol');
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
            formData.append('isActive', isActiveFilter.toString()); // 👈 aplica el filtro

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
            const normalizedProducts = productItems.map(p => ({
                Id: p.Id || p.id,
                Brand: p.Brand || p.brand,
                Model: p.Model || p.model,
                Description: p.Description || p.description,
                Caracteristicas: p.details || p.Details,
                Price: p.Precio || p.precio,
                Stock: p.Stock || p.stock,
                Category: p.Category || p.category,
                isActive: p.isActive,
                Imagenes: p.Imagenes || [],
            }));
            setProducts(normalizedProducts);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
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
            formData.append('isActive', productData.isActive || null)

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

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                toast.success(result.message || 'Producto guardado con éxito', '¡Guardado!');
            } else {
                const text = await response.text();
                toast.success(text || 'Producto guardado con éxito', '¡Guardado!');
            }

            fetchProducts();
            setShowModal(false);
            setSelectedProduct(null);
            setError(null);
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
            isActive: null,
            Images: [],
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

            {activeTab === 'usuarios' && users.length > 0 && (
                <div className="admin-section-card">
                    <div className="admin-header-row">
                        <div className="admin-header-titles">
                            <h3 className="admin-section-title">Gestión de Usuarios</h3>
                            <p className="admin-section-desc">Consulta y gestiona los privilegios de los usuarios registrados</p>
                        </div>
                        <span className="product-count-chip">
                            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
                        </span>
                    </div>
                    <div className="table-responsive-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol Actual</th>
                                <th>Modificar Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.Id}>
                                    <td className="cell-id">#{user.Id}</td>
                                    <td><strong>{user.Nombre}</strong></td>
                                    <td className="cell-email">{user.Email}</td>
                                    <td>
                                      <span className={`role-pill ${user.Rol?.toLowerCase() === 'admin' ? 'role-admin' : 'role-user'}`}>
                                        {user.Rol?.toUpperCase()}
                                      </span>
                                    </td>
                                    <td>
                                        <select className="select-role" value={user.Rol} onChange={(e) => handleRoleChange(user.Id, e.target.value)}>
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {activeTab === 'productos' && (
                <div className="admin-section-card">
                    <div className="admin-header-row">
                        <div className="admin-header-titles">
                            <h3 className="admin-section-title">Gestión de Productos</h3>
                            <p className="admin-section-desc">Controla el catálogo de hardware, existencias y estados de visibilidad</p>
                        </div>
                        <button className="btn-add" onClick={() => openModal()}>
                            <span className="btn-add-plus">+</span> Añadir Producto
                        </button>
                    </div>

                    {/* Toolbar con Filtros Segmentados Modernos */}
                    <div className="product-toolbar">
                        <div className="segmented-filter">
                            <button
                                type="button"
                                className={`segmented-btn ${isActiveFilter ? 'active' : ''}`}
                                onClick={() => setIsActiveFilter(true)}
                            >
                                <span className="status-dot dot-enabled"></span>
                                Habilitados
                            </button>
                            <button
                                type="button"
                                className={`segmented-btn ${!isActiveFilter ? 'active' : ''}`}
                                onClick={() => setIsActiveFilter(false)}
                            >
                                <span className="status-dot dot-disabled"></span>
                                Deshabilitados
                            </button>
                        </div>
                        <span className="product-count-chip">
                            {products.length} {products.length === 1 ? 'producto' : 'productos'} listados
                        </span>
                    </div>

                    <div className="table-responsive-wrapper">
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
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.Id}>
                                    <td className="cell-id">#{product.Id}</td>
                                    <td><span className="cell-brand">{product.Brand}</span></td>
                                    <td><strong className="cell-model">{product.Model}</strong></td>
                                    <td className="cell-desc" title={product.Description}>{product.Description}</td>
                                    <td className="cell-specs" title={product.Caracteristicas}>{product.Caracteristicas}</td>
                                    <td><span className="cell-price">{product.Price} €</span></td>
                                    <td>
                                      <span className={`cell-stock-badge ${Number(product.Stock) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.Stock} ud.
                                      </span>
                                    </td>
                                    <td><span className="cell-cat-tag">{product.Category}</span></td>
                                    <td>
                                      <span className={`status-pill ${product.isActive ? 'pill-enabled' : 'pill-disabled'}`}>
                                        <span className="pill-dot"></span>
                                        {product.isActive ? 'Habilitado' : 'Deshabilitado'}
                                      </span>
                                    </td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openModal(product)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{selectedProduct?.Id ? 'Actualizar Producto' : 'Añadir Producto'}</h3>
                        <input type="text" value={selectedProduct?.Brand || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Brand: e.target.value })} placeholder="Marca" />
                        <input type="text" value={selectedProduct?.Model || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Model: e.target.value })} placeholder="Modelo" />
                        <input type="text" value={selectedProduct?.Description || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Description: e.target.value })} placeholder="Descripción" />
                        <input type="text" value={selectedProduct?.Caracteristicas || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Caracteristicas: e.target.value })} placeholder="Características" />
                        <input type="number" value={selectedProduct?.Price || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Price: e.target.value })} placeholder="Precio" />
                        <input type="number" value={selectedProduct?.Stock || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Stock: e.target.value })} placeholder="Stock" />
                        <select value={selectedProduct?.Category || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, Category: e.target.value })}>
                            <option value="">Selecciona una categoría</option>
                            <option value="Portatiles">Portátiles</option>
                            <option value="Ordenadores">Ordenadores</option>
                            <option value="Monitores">Monitores</option>
                        </select>
                        <select value={selectedProduct?.isActive || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, isActive: e.target.value })}>
                            <option value="">Selecciona si será visible, o no.</option>
                            <option value="true">Habilitado</option>
                            <option value="false">Deshabilitado</option>
                        </select>
                        <input type="file" multiple onChange={(e) => setSelectedProduct({ ...selectedProduct, Images: Array.from(e.target.files) })} />
                        {selectedProduct?.Images?.length > 0 && (
                            <p>{selectedProduct.Images.length} imagen(es) seleccionada(s)</p>
                        )}
                        <div className="modal-buttons">
                            <button onClick={() => handleProductAction(selectedProduct)}>Guardar</button>
                            <button onClick={() => setShowModal(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
