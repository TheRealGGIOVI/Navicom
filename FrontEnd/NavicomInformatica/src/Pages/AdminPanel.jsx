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
            alert(result.message || 'Rol actualizado con éxito');
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

                    {/* Botones Habilitados / Deshabilitados */}
                    <div className="product-filters">
                        <button
                            className={isActiveFilter ? 'active' : ''}
                            onClick={() => setIsActiveFilter(true)}
                        >
                            Habilitados
                        </button>
                        <button
                            className={!isActiveFilter ? 'active' : ''}
                            onClick={() => setIsActiveFilter(false)}
                        >
                            Deshabilitados
                        </button>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
