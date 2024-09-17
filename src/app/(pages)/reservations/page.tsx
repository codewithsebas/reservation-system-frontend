"use client";

import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DatePicker, Input, Modal, Tooltip } from "antd";
import dayjs from "dayjs";
import { House, LucideEdit, LucideEye, LucideX } from "lucide-react";
import Link from "next/link";

interface User {
    id: number;
    username: string;
    email: string;
}

interface Reservation {
    id: number;
    user: User;
    reservationDate: string;
    reservationDetails: string;
    serviceTitle: string;
}

const Reservations: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [form, setForm] = useState({
        userId: "",
        reservationDate: "",
        reservationDetails: "",
        serviceTitle: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Confirm delete modal state
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
    const [isModalOpenView, setIsModalOpenView] = useState(false);
    const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
    const [user, setUser] = useState<string | null>(null);
    const [userIdState, setUserIdState] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            setUser(localStorage.getItem("username"));
            const userId = localStorage.getItem("userId") || "";
            setUserIdState(userId);

            if (!token) {
                router.push("/login");
                return;
            }

            setForm((prevForm) => ({
                ...prevForm,
                userId
            }));

            const fetchReservations = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setReservations(response.data);
                } catch (error) {
                    setError("Error fetching reservations");
                    console.error("Error fetching reservations:", error);
                }
            };

            fetchReservations();
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleDateChange = (date: any) => {
        setForm((prevForm) => ({
            ...prevForm,
            reservationDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
        }));
    };

    const handleCreateReservation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setForm({ userId: userIdState || "", reservationDate: "", reservationDetails: "", serviceTitle: "" });
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReservations(response.data);
                setIsModalOpen(false);
                setError(null);
            }
        } catch (error) {
            setError("Error creating reservation");
            console.error("Error creating reservation:", error);
        }
    };

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setForm({
            userId: userIdState || "",
            reservationDate: reservation.reservationDate
                ? dayjs(reservation.reservationDate).format("YYYY-MM-DD")
                : "",
            reservationDetails: reservation.reservationDetails || "",
            serviceTitle: reservation.serviceTitle
        });
        setIsModalOpen(true);
    };

    const handleUpdateReservation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (token && editingReservation) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/reservations/${editingReservation.id}`,
                    {
                        userId: userIdState || "",
                        reservationDate: dayjs(form.reservationDate).toISOString(),
                        reservationDetails: form.reservationDetails,
                        serviceTitle: form.serviceTitle
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReservations(response.data);
                setEditingReservation(null);
                setError(null);
                setForm({ userId: "", reservationDate: "", reservationDetails: "", serviceTitle: "" });
                setIsModalOpen(false);
            }
        } catch (error) {
            setError("Error updating reservation");
            console.error("Error updating reservation:", error);
        }
    };

    const handleDeleteReservation = async () => {
        if (reservationToDelete === null) return;

        try {
            const token = localStorage.getItem("token");
            if (token) {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReservations(response.data);
                setReservationToDelete(null);
                setIsConfirmModalOpen(false);
                setError(null);
            }
        } catch (error) {
            setError("Error deleting reservation");
            console.error("Error deleting reservation:", error);
        }
    };

    const showConfirmDeleteModal = (reservationId: number) => {
        setReservationToDelete(reservationId);
        setIsConfirmModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        router.push("/login");
    };

    const handleViewReservation = (reservation: Reservation) => {
        setViewReservation(reservation);
        setIsModalOpenView(true);
    };

    return (
        <div className="flex justify-center items-start min-h-screen p-5">
            <main className="flex flex-col gap-3 row-start-2 items-center max-w-4xl sm:items-start w-full">
                <div className="flex gap-5 items-start w-full justify-between border-b pb-3 flex-col md:flex-row md:items-center">
                    <h2 className="font-medium text-4xl flex flex-col w-full">
                        <span className="font-medium text-black text-2xl">Reservation System</span>
                        <code className="font-extralight text-base">{user}</code>
                    </h2>

                    <div className="flex gap-2 items-center">
                        <Link href='/' className='rounded-md text-center flex gap-3 px-4 justify-center text-sm w-full py-2.5 bg-slate-50 border text-black duration-200 hover:bg-slate-100'>
                            <House size={18} /></Link>
                        <button className='rounded-md text-center text-sm w-full py-2.5 px-4 text-nowrap bg-black text-white duration-200 hover:bg-black/90' onClick={() => { setIsModalOpen(true); setForm({ userId: userIdState || "", reservationDate: "", reservationDetails: "", serviceTitle: "" }); }}>
                            Crear Reserva
                        </button>
                        <button className='rounded-md text-center flex gap-3 justify-center text-sm w-full py-2.5 px-4 text-nowrap bg-slate-50 border text-black duration-200 hover:bg-slate-100' onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                <Modal
                    title={editingReservation ? "Editar Reserva" : "Nueva Reserva"}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingReservation(null); // Clear editing state
                    }}
                    footer={null}
                    width={400}
                >
                    <form
                        onSubmit={editingReservation ? handleUpdateReservation : handleCreateReservation}
                        className="flex flex-col gap-2"
                    >
                        <Input
                            name="serviceTitle"
                            placeholder="Service of reservation"
                            value={form.serviceTitle}
                            onChange={handleChange}
                        />
                        <Input
                            name="reservationDetails"
                            placeholder="Reservation Details"
                            value={form.reservationDetails}
                            onChange={handleChange}
                        />
                        <DatePicker
                            placeholder="Reservation Date"
                            value={form.reservationDate ? dayjs(form.reservationDate) : null}
                            onChange={handleDateChange}
                            style={{ width: "100%" }}
                        />
                        <button
                            type="submit"
                            className="py-2.5 text-center text-sm text-white rounded-md bg-black mt-2 hover:bg-black/90"
                        >
                            {editingReservation ? "Actualizar Reserva" : "Crear Reserva"}
                        </button>
                    </form>
                </Modal>

                <Modal
                    title="Ver Reserva"
                    open={isModalOpenView}
                    onCancel={() => setIsModalOpenView(false)}
                    footer={null}
                    width={400}
                >
                    {viewReservation && (
                        <div>
                            <p><strong>Service Title:</strong> {viewReservation.serviceTitle}</p>
                            <p><strong>Details:</strong> {viewReservation.reservationDetails}</p>
                            <p><strong>Date:</strong> {dayjs(viewReservation.reservationDate).format("YYYY-MM-DD")}</p>
                        </div>
                    )}
                </Modal>

                <Modal
                    title="Confirmar Eliminación"
                    open={isConfirmModalOpen}
                    onCancel={() => setIsConfirmModalOpen(false)}
                    footer={null}
                    width={400}
                >
                    <p>¿Está seguro de que desea eliminar esta reserva?</p>
                    <div className="flex gap-3 justify-end mt-3">
                        <button
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="py-2 px-4 rounded-md text-sm text-white bg-gray-500 hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteReservation}
                            className="py-2 px-4 rounded-md text-sm text-white bg-red-500 hover:bg-red-600"
                        >
                            Eliminar
                        </button>
                    </div>
                </Modal>

                <div className="w-full flex flex-col gap-3">
                    {reservations.length > 0 ? (
                        reservations.map((reservation) => (
                            <div key={reservation.id} className="bg-white border border-black/20 rounded-lg p-4  flex justify-between items-start gap-5 duration-200 hover:shadow">
                                <div className="flex flex-col overflow-hidden max-h-20">
                                    <p className="text-gray-500 text-sm mb-2">
                                        {reservation.reservationDate}
                                    </p>
                                    <h3 className="font-medium text-ellipsis overflow-hidden w-full truncate">{reservation.serviceTitle}</h3>
                                    <p className="text-gray-700 text-ellipsis overflow-hidden truncate w-full">
                                        {reservation.reservationDetails}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 items-center justify-center">

                                    <Tooltip placement="top" title="Ver">
                                        <button
                                            onClick={() => handleViewReservation(reservation)}>
                                            <LucideEye className="w-5 h-5" />
                                        </button>
                                    </Tooltip>

                                    <Tooltip placement="top" title="Editar">
                                        <button
                                            onClick={() => handleEditReservation(reservation)}

                                        >
                                            <LucideEdit className="w-5 h-5" />
                                        </button>
                                    </Tooltip>

                                    <Tooltip placement="top" title="Cancelar">
                                        <button onClick={() => showConfirmDeleteModal(reservation.id)}>
                                            <LucideX className="w-5 h-5" />
                                        </button>
                                    </Tooltip>

                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Tienes 0 reservaciones</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Reservations;
