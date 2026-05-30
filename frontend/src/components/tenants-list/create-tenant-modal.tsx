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
    fieldErrors?: Partial<Record<keyof CreateTenantValues, string>>;
    formError?: string | null;
    onFieldChange?: (field: keyof CreateTenantValues) => void;
};

export function CreateTenantModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
    fieldErrors,
    formError,
    onFieldChange,
}: CreateTenantModalProps) {
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
            onFieldChange?.(field);
        };

    const nameRegex = /^[А-Яа-яЁё\-\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = values.phone.replace(/\D/g, "");
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
    const phoneError = values.phone.trim() && !phoneStrict.test(values.phone)
        ? "Телефон должен начинаться с 8 и содержать 11 цифр"
        : null;
    const emailError = (values.email.trim() && !emailRegex.test(values.email)
        ? "Некорректная почта"
        : null) ?? fieldErrors?.email ?? null;

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
                    type="tel"
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
