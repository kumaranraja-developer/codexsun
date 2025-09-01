// import React, { useEffect, useState } from "react";

// type Tenant = {
//     id: number;
//     slug: string;
//     name: string;
//     email: string | null;
//     is_active: boolean;
//     created_at: string;
// };

// export default function TenantList() {
//     const [tenants, setTenants] = useState<Tenant[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [editingId, setEditingId] = useState<number | null>(null);
//     const [formData, setFormData] = useState<{
//         name: string;
//         email: string;
//         is_active: boolean;
//     }>({ name: "", email: "", is_active: true });

//     const [adding, setAdding] = useState(false);
//     const [newTenant, setNewTenant] = useState({
//         name: "",
//         email: "",
//         slug: "",
//         is_active: true,
//     });

//     const apiUrl = import.meta.env.VITE_API_URL;

//     useEffect(() => {
//         fetchTenants();
//     }, [apiUrl]);

//     const fetchTenants = () => {
//         setLoading(true);
//         fetch(`${apiUrl}/api/tenants`)
//             .then((res) => res.json())
//             .then((data) => setTenants(data))
//             .catch((err) => setError(err.message))
//             .finally(() => setLoading(false));
//     };

//     // Delete tenant
//     const deleteTenant = (id: number) => {
//         if (!confirm("Are you sure you want to delete this tenant?")) return;

//         fetch(`${apiUrl}/api/tenants/${id}`, { method: "DELETE" })
//             .then((res) => {
//                 if (!res.ok) throw new Error("Failed to delete");
//                 setTenants((prev) => prev.filter((t) => t.id !== id));
//             })
//             .catch((err) => alert(err.message));
//     };

//     // Start editing
//     const startEdit = (tenant: Tenant) => {
//         setEditingId(tenant.id);
//         setFormData({
//             name: tenant.name,
//             email: tenant.email ?? "",
//             is_active: tenant.is_active,
//         });
//     };

//     // Save edit
//     const saveEdit = (id: number) => {
//         const tenant = tenants.find((t) => t.id === id);
//         if (!tenant) return;

//         const updated = {
//             ...tenant,
//             name: formData.name,
//             email: formData.email,
//             is_active: formData.is_active,
//         };

//         fetch(`${apiUrl}/api/tenants/${id}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(updated),
//         })
//             .then((res) => {
//                 if (!res.ok) throw new Error("Failed to update");
//                 setTenants((prev) =>
//                     prev.map((t) => (t.id === id ? updated : t))
//                 );
//                 setEditingId(null);
//             })
//             .catch((err) => alert(err.message));
//     };

//     // Add new tenant
//     const addTenant = () => {
//         if (!newTenant.name || !newTenant.slug) {
//             alert("Name and Slug are required");
//             return;
//         }

//         const payload = {
//             ...newTenant,
//             created_at: new Date().toISOString(),
//         };

//         fetch(`${apiUrl}/api/tenants`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(payload),
//         })
//             .then((res) => {
//                 if (!res.ok) throw new Error("Failed to create");
//                 return res.json();
//             })
//             .then((created) => {
//                 setTenants((prev) => [created, ...prev]);
//                 setAdding(false);
//                 setNewTenant({ name: "", email: "", slug: "", is_active: true });
//             })
//             .catch((err) => alert(err.message));
//     };

//     if (loading) return <p>Loading tenants...</p>;
//     if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

//     return (
//         <div>
//             <h2>Tenant List</h2>

//             {/* Add New Tenant */}
//             {adding ? (
//                 <div style={{ marginBottom: "1rem" }}>
//                     <input
//                         placeholder="Slug"
//                         value={newTenant.slug}
//                         onChange={(e) =>
//                             setNewTenant({ ...newTenant, slug: e.target.value })
//                         }
//                     />
//                     <input
//                         placeholder="Name"
//                         value={newTenant.name}
//                         onChange={(e) =>
//                             setNewTenant({ ...newTenant, name: e.target.value })
//                         }
//                     />
//                     <input
//                         placeholder="Email"
//                         value={newTenant.email}
//                         onChange={(e) =>
//                             setNewTenant({ ...newTenant, email: e.target.value })
//                         }
//                     />
//                     <label>
//                         Active{" "}
//                         <input
//                             type="checkbox"
//                             checked={newTenant.is_active}
//                             onChange={(e) =>
//                                 setNewTenant({
//                                     ...newTenant,
//                                     is_active: e.target.checked,
//                                 })
//                             }
//                         />
//                     </label>
//                     <button onClick={addTenant}>Save</button>
//                     <button onClick={() => setAdding(false)}>Cancel</button>
//                 </div>
//             ) : (
//                 <button onClick={() => setAdding(true)}>➕ Add New Tenant</button>
//             )}

//             {/* Tenants Table */}
//             <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", marginTop: "1rem" }}>
//                 <thead>
//                 <tr>
//                     <th>ID</th>
//                     <th>Slug</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Active</th>
//                     <th>Created</th>
//                     <th>Actions</th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {tenants.map((t) => (
//                     <tr key={t.id}>
//                         <td>{t.id}</td>
//                         <td>{t.slug}</td>
//                         <td>
//                             {editingId === t.id ? (
//                                 <input
//                                     value={formData.name}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, name: e.target.value })
//                                     }
//                                 />
//                             ) : (
//                                 t.name
//                             )}
//                         </td>
//                         <td>
//                             {editingId === t.id ? (
//                                 <input
//                                     value={formData.email}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, email: e.target.value })
//                                     }
//                                 />
//                             ) : (
//                                 t.email ?? "-"
//                             )}
//                         </td>
//                         <td>
//                             {editingId === t.id ? (
//                                 <input
//                                     type="checkbox"
//                                     checked={formData.is_active}
//                                     onChange={(e) =>
//                                         setFormData({
//                                             ...formData,
//                                             is_active: e.target.checked,
//                                         })
//                                     }
//                                 />
//                             ) : t.is_active ? (
//                                 "✅"
//                             ) : (
//                                 "❌"
//                             )}
//                         </td>
//                         <td>{new Date(t.created_at).toLocaleString()}</td>
//                         <td>
//                             {editingId === t.id ? (
//                                 <>
//                                     <button onClick={() => saveEdit(t.id)}>Save</button>{" "}
//                                     <button onClick={() => setEditingId(null)}>Cancel</button>
//                                 </>
//                             ) : (
//                                 <>
//                                     <button onClick={() => startEdit(t)}>Edit</button>{" "}
//                                     <button onClick={() => deleteTenant(t.id)}>Delete</button>
//                                 </>
//                             )}
//                         </td>
//                     </tr>
//                 ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

import TableForm from "../../../../../resources/layouts/Form/TableForm";
import { ApiList } from "../../../../../resources/components/common/commonform";
import tenants from "../../../json/tenants.json";
import React from "react";

const formApi: ApiList = {
  create: "/api/tenants",
  read: "/api/tenants",
  update: "/api/tenants",
  delete: "/api/tenants",
};

function TenantList() {
  return (
    <div>
      <TableForm
        formName="Tenants"
        formApi={formApi}
        jsonPath={tenants}
        fieldPath="tenants.table"
        multipleEntry={true}
        popup={false}
      />
    </div>
  );
}

export default TenantList;
