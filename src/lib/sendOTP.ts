import {Resend} from "resend"
import React from "react";
import { OTPTemplate } from "@/components/api/OTPTemplate";


const sendOTP = async (email: string, otp: string) => {
    try{
        const resend  = new Resend(process.env.RESEND_API_KEY);

        const response = await resend.emails.send({
            from: "DSA Saga <no-reply@dsasaga.in>",
            to: email,
            subject:"OTP for email verification on DSAsaga",
            react: React.createElement(OTPTemplate, { otp: otp })
        });
        console.log(response);

        if (response.error) {
            console.error("Resend Error:", response.error);
            return { success: false, message: response.error.message || "Failed to send OTP" };
        }

        return { success: true, message: "Check your email for verification OTP" };
    }
    catch(e) {
        console.error(e);
        return { success: false, message: "Failed to send OTP" };
    }
}

export default sendOTP;