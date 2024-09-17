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
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Nuevo estado para modal de confirmación
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
    const [isModalOpenView, setIsModalOpenView] = useState(false);
    const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
    const router = useRouter();
    const [user, setUser] = useState<string | null>("")
    const [userIdState] = useState<number | string | null>(localStorage.getItem("userId"));

    useEffect(() => {
        const token = localStorage.getItem("token");
        setUser(localStorage.getItem("username"))


        if (!token) {
            router.push("/login");
            return;
        }

        if (typeof window !== "undefined") {
            const userId = localStorage.getItem("userId") || "";
            setForm((prevForm) => ({
                ...prevForm,
                userId
            }));
        }

        const fetchReservations = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `${token}` },
                });
                setReservations(response.data);
            } catch (error) {
                setError("Error fetching reservations");
                console.error("Error fetching reservations:", error);
            }
        };

        fetchReservations();
    }, [router, userIdState]);

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
                    headers: { Authorization: `${token}` },
                });
                setForm({ userId: localStorage.getItem("userId") || "", reservationDate: "", reservationDetails: "", serviceTitle: "" });
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `${token}` },
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
            userId: localStorage.getItem("userId") || "",
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
                        userId: localStorage.getItem("userId") || "",
                        reservationDate: dayjs(form.reservationDate).toISOString(),
                        reservationDetails: form.reservationDetails,
                        serviceTitle: form.serviceTitle
                    },
                    {
                        headers: { Authorization: `${token}` },
                    }
                );
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `${token}` },
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
                    headers: { Authorization: `${token}` },
                });
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reservations/user/${userIdState}`, {
                    headers: { Authorization: `${token}` },
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
            <main className="flex flex-col gap-3 row-start-2 items-center max-w-4xl sm:items-start w-full ">
                <div className="flex gap-5 items-start w-full justify-between border-b pb-3 flex-col md:flex-row md:items-center">
                    <h2 className="font-medium text-4xl flex flex-col  w-full">
                        <span className="font-medium text-black text-2xl">Reservation System</span>
                        <code className="font-extralight text-base">{user}</code>
                    </h2>


                    <div className="flex gap-2 items-center">
                        <Link href='/' className='rounded-md text-center flex gap-3 px-4 justify-center text-sm w-full py-2.5 bg-slate-50  border text-black duration-200 hover:bg-slate-100'>
                            <House size={18} /></Link>
                        <button className='rounded-md text-center text-sm w-full py-2.5 px-4 text-nowrap bg-black text-white duration-200 hover:bg-black/90' onClick={() => { setIsModalOpen(true); setForm({ userId: localStorage.getItem("userId") || "", reservationDate: "", reservationDetails: "", serviceTitle: "" }); }}>
                            Crear Reserva
                        </button>
                        <button className='rounded-md text-center flex gap-3 justify-center text-sm w-full py-2.5 px-4 text-nowrap bg-slate-50  border text-black duration-200 hover:bg-slate-100' onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                </div>






                <Modal
                    title={editingReservation ? "Editar Reserva" : "Nueva Reserva"}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingReservation(null); // Limpiar estado de edición
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
                            required
                        />

                        <Input
                            name="reservationDetails"
                            placeholder="Reservation Details"
                            value={form.reservationDetails}
                            onChange={handleChange}
                            required
                        />

                        <DatePicker
                            onChange={handleDateChange}
                            value={form.reservationDate ? dayjs(form.reservationDate) : null}
                            format="YYYY-MM-DD"
                            placeholder="Selecciona la fecha"
                            style={{ width: "100%" }}
                        />
                        <button className='rounded-md text-center text-sm w-full py-2 bg-black text-white duration-200 hover:bg-black/90' type="submit">
                            {editingReservation ? "Actualizar" : "Crear Reserva"}
                        </button>
                        {error && <p className="text-red-500">{error}</p>}
                    </form>
                </Modal>


                <Modal
                    title="Reserva"
                    open={isModalOpenView}
                    onCancel={() => {
                        setIsModalOpenView(false);
                    }}
                    footer={null}
                    width={400}
                >
                    <div className="flex flex-col gap-2 overflow-hidden">
                        <p className="text-gray-500 text-sm mt-2">
                            {viewReservation?.reservationDate}
                        </p>
                        <h3 className="font-medium text-ellipsis overflow-hidden w-full">{viewReservation?.serviceTitle}</h3>
                        <p className="text-gray-700 text-ellipsis overflow-hidden w-full">
                            {viewReservation?.reservationDetails}
                        </p>
                    </div>
                </Modal>

                <div className="w-full">
                    <h2 className="font-medium text-xl mb-3">Tus reservaciones</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    </ul>
                </div>
            </main>

            <Modal
                title="Confirmar Cancelación"
                open={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onOk={handleDeleteReservation}
                okText="Confirmar"
                cancelText="Cancelar"
                okButtonProps={{ className: 'custom-confirm-button' }}
            >
                <p>¿Estás seguro que deseas cancelar esta reserva?</p>
            </Modal>

        </div>
    );
};

export default Reservations;
