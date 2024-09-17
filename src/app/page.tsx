"use client";

import { Modal, Tooltip } from "antd";
import axios from "axios";
import { LucideEye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReservationsFilterModal from "./components/ReservationsFilter";

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

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpenView, setIsModalOpenView] = useState(false);
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);

  useEffect(() => {

    const fetchReservations = async () => {
      try {
        const response = await axios.get<Reservation[]>(`${process.env.NEXT_PUBLIC_API_URL}/reservations`);
        setReservations(response.data);
      } catch (error) {
        setError("Error fetching reservations");
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();

  }, [])

  const handleViewReservation = (reservation: Reservation) => {
    setViewReservation(reservation);
    setIsModalOpenView(true);
  };

  const [userIdState, setUserIdState] = useState<number | string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Now we are sure this is client-side, so we can access localStorage
      const userId = localStorage.getItem("userId");
      setUserIdState(userId);
    }
  }, []);

  return (
    <div className="flex justify-center items-start min-h-screen p-5 pt-10">
      <main className="flex flex-col gap-5 row-start-2 items-center max-w-4xl sm:items-start w-full ">
        <div className="flex justify-between gap-5 w-full flex-col md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-4xl">Reservation System</h2>
            <ol className="list-inside flex flex-col gap-1 list-decimal text-sm text-start sm:text-left font-[family-name:var(--font-geist-mono)]">
              <li>Repository: GitHub - <Link className="hover:underline" target="_blank" href="https://github.com/codewithsebas/reservation-system-backend">
                Reservation System Frontend.</Link></li>
              <li>Repository: GitHub - <Link className="hover:underline" target="_blank" href="https://github.com/codewithsebas/reservation-system-backend">
                Reservation System Backend.</Link></li>
              <li>Documentation in POSTMAN - <Link className="hover:underline" target="_blank" href="https://github.com/codewithsebas/reservation-system-backend">
                Reservation System Documentation.</Link></li>
            </ol>
          </div>

          <div className="flex gap-4 items-center sm:flex-row">
            {
              !userIdState ? (
                <>
                  <Link

                    className="bg-white text-black border text-nowrap border-black/20 rounded-md px-4 py-2 flex gap-2 items-center"
                    href="/register"
                  >
                    <Image
                      className="dark:invert"
                      src="https://nextjs.org/icons/vercel.svg"
                      alt="Vercel logomark"
                      width={20}
                      height={20}
                    />
                    Registrate
                  </Link>
                  <Link
                    className="bg-black text-white border text-nowrap border-black/20 rounded-md px-4 py-2 flex gap-2 items-center"
                    href="/login"
                  >
                    Iniciar sesión
                  </Link></>
              ) : (<Link href="/reservations" className='rounded-md text-center text-sm w-full py-2 px-4 text-nowrap bg-black text-white duration-200 hover:bg-black/90'>
                Crear Reserva
              </Link>)
            }

          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <div className="w-full flex justify-between gap-2">
          <h3 className="font-medium text-xl">Reservas</h3>
          <ReservationsFilterModal setReservations={setReservations} />
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white border border-black/20 rounded-lg p-4 flex justify-between items-end gap-5 duration-200 hover:shadow">
                  <div className="flex flex-col overflow-hidden max-h-20">
                    <p className="text-gray-500 text-sm mb-2">
                      {reservation.reservationDate}
                    </p>
                    <h3 className="font-medium text-ellipsis overflow-hidden w-full truncate">{reservation.serviceTitle}</h3>
                    <p className="text-gray-700 text-ellipsis overflow-hidden truncate w-full">
                      {reservation.reservationDetails}
                    </p>
                  </div>
                  <Tooltip placement="top" title="Ver">
                    <button
                      onClick={() => handleViewReservation(reservation)}>
                      <LucideEye className="w-5 h-5 text-black/50 duration-200 hover:text-black" />
                    </button>
                  </Tooltip>
                </div>
              ))
            ) : (
              <p>¡No hay reservar!</p>
            )}

            {error && <p className="text-red-500">{error}</p>}

          </ul>
        </div>
      </main>

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
    </div>
  );
}
