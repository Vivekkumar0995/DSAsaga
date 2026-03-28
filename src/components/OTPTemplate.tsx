import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OTPTemplateProps {
  otp: string;
}

export const OTPTemplate = ({ otp }: OTPTemplateProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>Use the following code to complete your verification:</Text>
        <Section style={codeContainer}>
          <Text style={code}>{otp}</Text>
        </Section>
        <Text style={footer}>If you didn&apos;t request this, please ignore this email.</Text>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: "#ffffff", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "20px 0 48px" };
const h1 = { fontSize: "24px", fontWeight: "bold", textAlign: "center" as const };
const text = { fontSize: "16px", lineHeight: "26px", textAlign: "center" as const };
const codeContainer = { background: "#f4f4f4", borderRadius: "4px", margin: "16px auto", width: "280px" };
const code = { fontSize: "32px", fontWeight: "bold", textAlign: "center" as const, letterSpacing: "8px" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
