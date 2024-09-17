"use client"
import React, { useState, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Button, Input } from 'antd';
import Link from 'next/link';
import { House } from 'lucide-react';

const Login: React.FC = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, form);
            const { token, userId, email, username } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('email', email);
            localStorage.setItem('username', username);
            router.push('/reservations');
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response) {
                console.log();
                setError(error.response.data.error);
            } else {
                console.error('Error desconocido', error);
            }
        }



    };

    return (

        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start  w-full max-w-sm">
                <h2 className="font-medium text-4xl flex flex-col-reverse gap-2"><span className='font-light text-2xl'>Reservation System</span> Login</h2>


                <div className="flex flex-col items-center justify-center w-full">
                    <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">

                        <div className='flex flex-col gap-1'>
                            <label className='text-sm' htmlFor="email">Email</label>
                            <Input
                                type="email"
                                name="email"
                                id='email'
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                className="flex items-center justify-center text-sm py-2"
                                required
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-sm' htmlFor="password">Password</label>
                            <Input.Password
                                name="password"
                                placeholder="Password"
                                id='password'
                                value={form.password}
                                onChange={handleChange}
                                className="flex items-center justify-center text-sm py-2"
                                required
                            />
                        </div>
                        <Button
                            type="default"
                            htmlType="submit"
                            className="flex items-center justify-center text-sm py-5"
                            block
                        >
                            Login
                        </Button>
                        {error && <p className="text-red-500">{error}</p>}
                    </form>

                    <div className='w-full flex flex-col items-center justify-between gap-2 pt-3'>

                        <Link href='/register' className='rounded-md text-center text-sm w-full py-2.5 bg-black text-white duration-200 hover:bg-black/90'>
                            Register
                        </Link>

                        <Link href='/' className='rounded-md text-center flex gap-3 justify-center text-sm w-full py-2.5 bg-slate-50  border text-black duration-200 hover:bg-slate-100'>
                            <House size={18} /></Link>

                    </div>


                </div>
            </main>
        </div>




    );
};

export default Login;
