import GoogleCaptchaWrapper from "./GoogleCaptchaWrapper";

export default function AuthLayout({children} : {children: React.ReactNode}) {
    return (
        <div>
            <GoogleCaptchaWrapper>
                {children}
            </GoogleCaptchaWrapper>
        </div>
    )
}