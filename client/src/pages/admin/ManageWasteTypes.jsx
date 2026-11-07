import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageWasteTypes() {
    const [wasteTypes, setWasteTypes] = useState([]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "0"
    });

    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWasteTypes();
    }, []);

    async function loadWasteTypes() {
        try {
            const response = await api.get("/wastetypes/admin");

            const data =
                response.data.wasteTypes ??
                response.data.data ??
                response.data;

            setWasteTypes(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error("Load Waste Types Error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load waste types"
            );
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");

        try {
            setLoading(true);

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.price)
            };

            const response = editId
                ? await api.put(`/wastetypes/${editId}`, payload)
                : await api.post("/wastetypes", payload);

            setMessage(
                response.data.message ||
                "Waste type saved successfully"
            );

            setForm({
                name: "",
                description: "",
                price: "0"
            });

            setEditId(null);

            await loadWasteTypes();

        } catch (error) {
            console.error("Save Waste Type Error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save waste type"
            );

        } finally {
            setLoading(false);
        }
    }

    function editWasteType(waste) {
        setEditId(waste.id);

        setForm({
            name: waste.name || "",
            description: waste.description || "",
            price: String(waste.price ?? 0)
        });

        setMessage("");
    }

    function cancelEdit() {
        setEditId(null);

        setForm({
            name: "",
            description: "",
            price: "0"
        });
    }

    async function deleteWasteType(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this waste type?"
        );

        if (!confirmed) return;

        try {
            const response = await api.delete(`/wastetypes/${id}`);

            setMessage(
                response.data.message ||
                "Waste type deleted successfully"
            );

            await loadWasteTypes();

        } catch (error) {
            console.error("Delete Waste Type Error:", error);

            setMessage(
                error.response?.data?.message ||
                "Delete failed"
            );
        }
    }

    return (
        <div className="container">
            <h1>Manage Waste Types</h1>

            {message && <p>{message}</p>}

            <form className="form" onSubmit={handleSubmit}>
                <label>Waste Name</label>

                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter waste name"
                    required
                />

                <label>Description</label>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                />

                <label>Price</label>

                <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading
                        ? "Saving..."
                        : editId
                            ? "Update Waste Type"
                            : "Add Waste Type"}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={cancelEdit}
                    >
                        Cancel Edit
                    </button>
                )}
            </form>

            <div className="table-container">
                <h2>Available Waste Types</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {wasteTypes.length > 0 ? (
                            wasteTypes.map(waste => (
                                <tr key={waste.id}>
                                    <td>{waste.name}</td>

                                    <td>{waste.description}</td>

                                    <td>₹{waste.price}</td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => editWasteType(waste)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => deleteWasteType(waste.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">
                                    No waste types found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
