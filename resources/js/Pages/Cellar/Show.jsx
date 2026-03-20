import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { getCellarItem, updateCellarItem, removeFromCellar, getPairingsForWine } from 'A/Services/api';
import toast from 'react-hot-toast';

export default function CellarShow({ id }) {
    const [item, setItem] = useState(null);
    const [pairings, setPairings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        try {
            const response = await getCellarItem(id);
            setItem(response.data.data);
            setEditForm({
                rating: response.data.data.rating || '',
                personal_notes: response.data.data.personal_notes || '',
                location: response.data.data.location || '',
                rack: response.data.data.rack || '',
                shelf: response.data.data.shelf || '',
            });

            // Last matanbefalinger
            if (response.data.data.wine_id) {
                const pairingResponse = await getPairingsForWine(response.data.data.wine_id);
                setPairings(pairingResponse.data.pairings);
            }
        } catch (err) {
            toast.error('Kunne ikke laste vindet');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setEditing(true);
        try {
            await updateCellarItem(id, editForm);
            toast.success('