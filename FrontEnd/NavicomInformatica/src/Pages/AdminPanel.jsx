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
    const navigate = useNavigate();

    const role = user?.role;
    const currentUserId = user?.Id;

    useEffect(() => {
        console.log("Token encontrado en AdminPanel desde AuthContext:", token);
        console.log("Role encontrado en AdminPanel desde AuthContext:", role);
        console.log("Usuario completo en AdminPanel (incluye ID):", user);
        if (!token || !role || role.toLowerCase() !== 'admin') {
            console.log("Condición de redirección activada, navegando a / por falta de autorización");
        } else {
            console.log("Condición de renderizado satisfecha, mostrando AdminPanel sin peticiones al backend");
        }
    }, [token, role, user]);

    useEffect(() => {
        console.log("Estado users actual después de renderizado:", users);
    }, [users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log("Enviando solicitud a /api/User con token:", token);
            const response = await fetch(`${API_BASE_URL}/api/User`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Error response from /api/User:", errorText, "Status:", response.status);
                if (response.status === 401) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('role');
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login-register');
                    throw new Error('Session expired or unauthorized. Please log in again.');
                }
                throw new Error(`Failed to fetch users: ${errorText} (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log("Usuarios recibidos (raw):", data);
            const normalizedUsers = Array.isArray(data) ? data.map(u => ({
                Id: u.Id || u.id,
                Nombre: u.Nombre || u.nombre || 'Sin nombre',
                Email: u.Email || u.email || 'Sin email',
                Rol: u.rol || u.Rol || u.role || 'user', // Priorizar "rol" como principal
            })) : [];
            const filteredUsers = normalizedUsers.filter(u => u.Id !== currentUserId);
            console.log("Usuarios normalizados:", normalizedUsers);
            console.log("Usuarios filtrados:", filteredUsers);
            setUsers(filteredUsers);
            console.log("Estado users establecido con:", filteredUsers);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setLoading(true);
        try {
            console.log("Enviando solicitud para cambiar rol de usuario ID:", userId, "a", newRole, "con token:", token);
            const response = await fetch(`${API_BASE_URL}/api/User/update-role/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                },
                body: JSON.stringify({ newRole }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Error response role change:", errorText, "Status:", response.status);
                if (response.status === 401) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('role');
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login-register');
                    throw new Error('Session expired or unauthorized. Please log in again.');
                }
                throw new Error(`Failed to update user role: ${errorText} (Status: ${response.status})`);
            }

            const result = await response.json();
            alert(result.message);

            setUsers(users.map(u =>
                u.Id === userId ? { ...u, Rol: newRole.toLowerCase() } : u
            ));
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
            console.log("Enviando solicitud a /api/Product/ListOfProducts con token:", token);
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

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Error response from /api/Product/ListOfProducts:", errorText, "Status:", response.status);
                if (response.status === 401) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('role');
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login-register');
                    throw new Error('Session expired or unauthorized. Please log in again.');
                }
                throw new Error(`Failed to fetch products: ${errorText} (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log("Productos recibidos (raw):", data);
            const productItems = data.items || [];
            const normalizedProducts = productItems.map(p => ({
                Id: p.Id || p.id, 
                Band: p.Brand || p.brand,
                Model: p.Model || p.model,
                Description: p.Description || p.description,
                Caracteristicas: p.details || p.Details,
                Price: p.Precio || p.precio,
                Stock: p.Stock || p.stock,
                Category: p.Category || p.category,
            }));
            setProducts(normalizedProducts);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductAction = async (productData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('Id', productData.Id || Date.now());
            formData.append('Name', productData.Name);
            formData.append('Description', productData.Description);
            formData.append('Price', productData.Price);
            formData.append('Stock', productData.Stock);
            formData.append('Category', productData.Category);
            if (productData.Image) {
                formData.append('Image', productData.Image);
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

            if (!response.ok) {
                throw new Error('Failed to save product');
            }

            const result = await response.json();
            alert(result.message || result);
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

    const deleteProduct = async (productId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Product/DeleteProduct/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            const result = await response.json();
            alert(result.message);
            fetchProducts();
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
            Name: '',
            Description: '',
            Price: '',
            Stock: '',
            Category: '',
            Image: null,
        });
        setShowModal(true);
    };

    if (!token || !role || role.toLowerCase() !== 'admin') {
        console.log("No se renderiza AdminPanel por falta de autorización");
        return null;
    }

    console.log("Renderizando componente, estado users:", users);

    return (
        <div className="admin-panel">
            <h2>Panel de Admin - Gestión de Usuarios y Productos</h2>
            {loading && <p>Cargando datos...</p>}
            {error && <p className="error">{error}</p>}

            <div>
                <h3>Gestión de Usuarios</h3>
                {users.length === 0 && !loading && !error && (
                    <div>
                        <p>No se han cargado usuarios aún.</p>
                        <button onClick={fetchUsers} disabled={loading}>Cargar usuarios</button>
                    </div>
                )}
                {users.length > 0 && (
                    <div>
                        <p>Usuarios cargados: {users.length}</p>
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
                                            <select
                                                value={user.Rol}
                                                onChange={(e) => handleRoleChange(user.Id, e.target.value)}
                                            >
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
            </div>

            <div>
                <h3>Gestión de Productos</h3>
                {products.length === 0 && !loading && !error && <button onClick={fetchProducts} disabled={loading}>Cargar productos</button>}
                {products.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Descripción</th>
                                <th>Caracteristicas</th>
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
                                    <td>{product.Band}</td>
                                    <td>{product.Model}</td>
                                    <td>{product.Description}</td>
                                    <td>{product.Caracteristicas}</td>
                                    <td>{product.Price}</td>
                                    <td>{product.Stock}</td>
                                    <td>{product.Category}</td>
                                    <td>
                                        <button onClick={() => openModal(product)}>Actualizar</button>
                                        <button onClick={() => deleteProduct(product.Id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <button onClick={() => openModal()}>Añadir Producto</button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{selectedProduct?.Id ? 'Actualizar Producto' : 'Añadir Producto'}</h3>
                        <input
                            type="text"
                            value={selectedProduct?.Name || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Name: e.target.value })}
                            placeholder="Nombre"
                        />
                        <input
                            type="text"
                            value={selectedProduct?.Description || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Description: e.target.value })}
                            placeholder="Descripción"
                        />
                        <input
                            type="number"
                            value={selectedProduct?.Price || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Price: e.target.value })}
                            placeholder="Precio"
                        />
                        <input
                            type="number"
                            value={selectedProduct?.Stock || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Stock: e.target.value })}
                            placeholder="Stock"
                        />
                        <input
                            type="text"
                            value={selectedProduct?.Category || ''}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Category: e.target.value })}
                            placeholder="Categoría"
                        />
                        <input
                            type="file"
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, Image: e.target.files[0] })}
                            placeholder="Imagen"
                        />
                        <button onClick={() => handleProductAction(selectedProduct)}>Guardar</button>
                        <button onClick={() => setShowModal(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;