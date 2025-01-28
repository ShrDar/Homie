import GoogleCaptchaWrapper from "./GoogleCaptchaWrapper";

export default function AuthLayout({children} : {children: React.ReactNode}) {
    return (
        <div className="w-full">
            <GoogleCaptchaWrapper>
                {children}
            </GoogleCaptchaWrapper>
        </div>
    )
}