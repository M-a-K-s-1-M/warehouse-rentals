'use client';

import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

export type CreateTenantValues = {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
};

type CreateTenantModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CreateTenantValues) => void;
    isSubmitting: boolean;
};

export function CreateTenantModal({ opened, onClose, onSubmit, isSubmitting }: CreateTenantModalProps) {
    const [values, setValues] = useState<CreateTenantValues>({
        lastName: "",
        firstName: "",
        middleName: "",
        phone: "",
        email: "",
    });

    useEffect(() => {
        if (!opened) {
            setValues({ lastName: "", firstName: "", middleName: "", phone: "", email: "" });
        }
    }, [opened]);

    const handleChange = (field: keyof CreateTenantValues) =>
        (value: string | React.ChangeEvent<HTMLInputElement> | null) => {
            const nextValue = typeof value === "string" ? value : value?.currentTarget?.value ?? "";
            setValues((prev) => ({ ...prev, [field]: nextValue }));
        };

    const nameRegex = /^[А-Яа-яЁё\-\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = values.phone.replace(/\D/g, "");

    const lastNameError = values.lastName.trim() && !nameRegex.test(values.lastName)
        ? "Только русские буквы"
        : null;
    const firstNameError = values.firstName.trim() && !nameRegex.test(values.firstName)
        ? "Только русские буквы"
        : null;
    const middleNameError = values.middleName.trim() && !nameRegex.test(values.middleName)
        ? "Только русские буквы"
        : null;
    const phoneError = values.phone.trim() && phoneDigits.length !== 11
        ? "Введите 11 цифр"
        : null;
    const emailError = values.email.trim() && !emailRegex.test(values.email)
        ? "Некорректная почта"
        : null;

    const isValid = values.lastName.trim()
        && values.firstName.trim()
        && values.phone.trim()
        && values.email.trim()
        && !lastNameError
        && !firstNameError
        && !middleNameError
        && !phoneError
        && !emailError;

    return (
        <Modal opened={opened} onClose={onClose} title="Добавить арендатора" centered>
            <div className="space-y-4">
                <TextInput
                    label="Фамилия"
                    value={values.lastName}
                    onChange={handleChange("lastName")}
                    error={lastNameError}
                    required
                />
                <TextInput
                    label="Имя"
                    value={values.firstName}
                    onChange={handleChange("firstName")}
                    error={firstNameError}
                    required
                />
                <TextInput
                    label="Отчество"
                    value={values.middleName}
                    onChange={handleChange("middleName")}
                    error={middleNameError}
                />
                <TextInput
                    label="Телефон"
                    placeholder="+7 (999) 123-45-67"
                    value={values.phone}
                    onChange={handleChange("phone")}
                    error={phoneError}
                    required
                />
                <TextInput
                    label="Почта"
                    type="email"
                    value={values.email}
                    onChange={handleChange("email")}
                    error={emailError}
                    required
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose} disabled={isSubmitting}>
                        Отмена
                    </Button>
                    <Button onClick={() => onSubmit(values)} disabled={!isValid} loading={isSubmitting}>
                        Добавить
                    </Button>
                </Group>
            </div>
        </Modal>
    );
}
