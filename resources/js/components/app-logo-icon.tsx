import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.svg"
            alt="Logo"
            className={`object-contain ${className || ''}`}
            {...props}
        />
    );
}
