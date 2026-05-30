'use client'

import { AuthApi } from "@/lib";
import { Button, Paper, PasswordInput, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Auth() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim() || !password.trim()) {
            return;
        }

        try {
            setIsSubmitting(true);
            await AuthApi.login({ email: email.trim(), password });
            notifications.show({
                title: "Добро пожаловать",
                message: "Вы успешно вошли в систему.",
                color: "green",
            });
            router.replace("/");
        } catch {
            notifications.show({
                title: "Ошибка входа",
                message: "Проверьте почту и пароль.",
                color: "red",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100/80 flex items-center justify-center p-6">
            <Paper withBorder shadow="sm" radius="lg" className="w-full max-w-md p-6">
                <div className="space-y-2 mb-6">
                    <Text fw={700} size="xl">
                        Вход в систему
                    </Text>
                    <Text size="sm" c="dimmed">
                        Используйте учетные данные, выданные администратором.
                    </Text>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <TextInput
                        label="Почта"
                        placeholder="example@mail.ru"
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                        required
                    />
                    <PasswordInput
                        label="Пароль"
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        required
                    />

                    <Button type="submit" fullWidth loading={isSubmitting}>
                        Войти
                    </Button>
                </form>
            </Paper>
        </div>
    );
}
