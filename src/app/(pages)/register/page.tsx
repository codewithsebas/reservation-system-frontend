"use client"

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal, notification } from 'antd';
import Link from 'next/link';
import { House } from 'lucide-react';

const Register: React.FC = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, form);
            setSuccessMessage('Registro exitoso! Puedes iniciar sesión ahora.');
            setIsModalVisible(true);
        } catch (error) {
            notification.error({
                message: 'Registro Fallido',
                description: 'No se pudo realizar el registro. Por favor, intenta de nuevo.',
            });
            console.error('Error registering user:', error);
        }
    };

    const handleOk = () => {
        setIsModalVisible(false);
        router.push('/login');
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-sm">
                <h2 className="font-medium text-4xl flex flex-col-reverse gap-2">
                    <span className='font-light text-2xl'>Reservation System</span> Register
                </h2>

                <div className="flex flex-col items-center justify-center w-full">
                    <form onSubmit={handleRegister} className="flex flex-col gap-3 w-full">
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm' htmlFor="username">Username</label>
                            <Input
                                className="flex items-center justify-center text-sm py-2"
                                type="text"
                                id='username'
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        <div className='flex flex-col gap-1'>
                            <label className='text-sm' htmlFor="email">Email</label>
                            <Input
                                className="flex items-center justify-center text-sm py-2"
                                type="email"
                                id='email'
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm' htmlFor="password">Password</label>
                            <Input.Password
                                className="flex items-center justify-center text-sm py-2"
                                type="password"
                                name="password"
                                id='password'
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Button
                            type="default"
                            htmlType="submit"
                            className="flex items-center justify-center text-sm py-5"
                            block
                        >
                            Register
                        </Button>
                    </form>

                    <div className='w-full flex flex-col items-center justify-between gap-2 pt-3'>
                        <Link href='/login' className='rounded-md text-center text-sm w-full py-2.5 bg-black text-white duration-200 hover:bg-black/90'>
                            Login
                        </Link>
                        <Link href='/' className='rounded-md text-center flex gap-3 justify-center text-sm w-full py-2.5 bg-slate-50  border text-black duration-200 hover:bg-slate-100'>
                            <House size={18} /></Link>
                    </div>
                </div>
            </main>

            <Modal
                title="Registro Exitoso"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Iniciar sesión"
            >
                <p>{successMessage}</p>
            </Modal>
        </div>
    );
};

export default Register;
