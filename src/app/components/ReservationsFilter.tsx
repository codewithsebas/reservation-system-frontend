import React, { useState } from "react";
import { Modal, Button, Input, DatePicker, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

const { RangePicker } = DatePicker;

interface ReservationsFilterModalProps {
    setReservations: React.Dispatch<React.SetStateAction<any[]>>;
}

const ReservationsFilterModal: React.FC<ReservationsFilterModalProps> = ({ setReservations }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [serviceTitle, setServiceTitle] = useState<string>("");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        // Validar si el username es una cadena no vacía
        if (!username.trim()) {
            message.error("Please enter a username.");
            return;
        }

        // Validar que el título del servicio no esté vacío
        if (!serviceTitle.trim()) {
            message.error("Please enter the service title.");
            return;
        }

        // Validar que el rango de fechas esté completo
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            message.error("Please select the date range.");
            return;
        }

        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (dateRange[0].isAfter(dateRange[1])) {
            message.error("Start date cannot be after end date.");
            return;
        }

        const startDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
        const endDate = dayjs(dateRange[1]).format("YYYY-MM-DD");

        try {
            // Construir la URL con los parámetros
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/reservations/filter`);
            url.searchParams.append("username", username);
            url.searchParams.append("serviceTitle", serviceTitle);
            url.searchParams.append("startDate", startDate);
            url.searchParams.append("endDate", endDate);

            const response = await axios.get(url.toString());

            setReservations(response.data);
            message.success("Reservations filtered successfully");

        } catch (error) {
            console.error("Error filtering reservations:", error);
            message.error("Error filtering reservations");
        }

        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Filter Reservations
            </Button>
            <Modal
                title="Filter Reservations"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className="flex flex-col gap-3">
                    <Input
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        placeholder="Title of Service"
                        value={serviceTitle}
                        onChange={(e) => setServiceTitle(e.target.value)}
                    />
                    <RangePicker
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0], dates[1]]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default ReservationsFilterModal;
