'use client';

import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

export type CreateEngineerValues = {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
    password: string;
};

type CreateEngineerModalProps = {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CreateEngineerValues) => void;
    isSubmitting: boolean;
    fieldErrors?: Partial<Record<keyof CreateEngineerValues, string>>;
    formError?: string | null;
    onFieldChange?: (field: keyof CreateEngineerValues) => void;
};

export function CreateEngineerModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    fieldErrors,
    formError,
    onFieldChange,
}: CreateEngineerModalProps) {
    const [values, setValues] = useState<CreateEngineerValues>({
        lastName: "",
        firstName: "",
        middleName: "",
        phone: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (!opened) {
            setValues({
                lastName: "",
                firstName: "",
                middleName: "",
                phone: "",
                email: "",
                password: "",
            });
        }
    }, [opened]);

    const handleChange = (field: keyof CreateEngineerValues) =>
        (value: string | React.ChangeEvent<HTMLInputElement> | null) => {
            const nextValue = typeof value === "string" ? value : value?.currentTarget?.value ?? "";
            setValues((prev) => ({ ...prev, [field]: nextValue }));
            onFieldChange?.(field);
        };

    const nameRegex = /^[А-Яа-яЁё\-\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneStrict = /^8\d{10}$/;

    const lastNameError = (values.lastName.trim() && !nameRegex.test(values.lastName)
        ? "Только русские буквы"
        : null) ?? fieldErrors?.lastName ?? null;
    const firstNameError = (values.firstName.trim() && !nameRegex.test(values.firstName)
        ? "Только русские буквы"
        : null) ?? fieldErrors?.firstName ?? null;
    const middleNameError = (values.middleName.trim() && !nameRegex.test(values.middleName)
        ? "Только русские буквы"
        : null) ?? fieldErrors?.middleName ?? null;
    const phoneError = (values.phone.trim() && !phoneStrict.test(values.phone)
        ? "Телефон должен начинаться с 8 и содержать 11 цифр"
        : null) ?? fieldErrors?.phone ?? null;
    const emailError = (values.email.trim() && !emailRegex.test(values.email)
        ? "Некорректная почта"
        : null) ?? fieldErrors?.email ?? null;
    const passwordError = values.password.trim() && values.password.length < 6
        ? "Минимум 6 символов"
        : null;

    const isValid = values.lastName.trim()
        && values.firstName.trim()
        && values.phone.trim()
        && values.email.trim()
        && values.password.trim()
        && !lastNameError
        && !firstNameError
        && !middleNameError
        && !phoneError
        && !emailError;

    return (
        <Modal opened={opened} onClose={onClose} title="Добавить инженера" centered>
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
                    type="tel"
                    placeholder="8XXXXXXXXXX"
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
                <TextInput
                    label="Пароль"
                    type="password"
                    value={values.password}
                    onChange={handleChange("password")}
                    error={passwordError}
                    required
                />

                {formError && (
                    <div className="text-sm text-red-600">{formError}</div>
                )}

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
