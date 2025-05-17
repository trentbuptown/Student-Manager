import { FieldError } from "react-hook-form";
import { useState } from "react";

type InputFieldProps = {
    label: string;
    type?: string;
    register: any;
    name: string;
    defaultValue?: string;
    error?: FieldError;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    placeholder?: string;
    icon?: React.ReactNode;
};

const InputField = ({
    label,
    type = "text",
    register,
    name,
    defaultValue,
    error,
    inputProps,
    placeholder,
    icon,
}: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            <div className={`relative rounded-md shadow-sm ${error ? 'ring-1 ring-red-300' : ''}`}>
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    {...register(name)}
                    className={`
                        block w-full rounded-md border-0 py-2 
                        ${icon ? 'pl-10' : 'pl-3'} pr-3 
                        text-sm text-gray-900 
                        ring-1 ring-inset ${error 
                            ? 'ring-red-300 focus:ring-red-500' 
                            : isFocused 
                                ? 'ring-blue-500' 
                                : 'ring-gray-300 focus:ring-blue-500'
                        }
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-inset
                        transition-all duration-150
                        hover:ring-gray-400
                    `}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...inputProps}
                    defaultValue={defaultValue}
                />
                {type === "password" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                )}
                {type === "date" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
            {error?.message && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error.message.toString()}
                </p>
            )}
        </div>
    );
};

export default InputField;
