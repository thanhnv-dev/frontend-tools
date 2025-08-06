"use client";
import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import { providerMap } from "../../../auth";
import signIn from "./actions";

// function ForgotPasswordLink() {
//   return (
//     <span>
//       <Link fontSize="0.75rem" href="/auth/forgot-password">
//         Forgot password?
//       </Link>
//     </span>
//   );
// }

// function SignUpLink() {
//   return (
//     <span style={{ fontSize: '0.8rem' }}>
//       Don&apos;t have an account?&nbsp;<Link href="/auth/signup">Sign up</Link>
//     </span>
//   );
// }

// function DemoInfo() {
//   return (
//     <Alert severity="info">
//       You can use <strong>test@gmail.com</strong> with the password <strong>123456</strong> to
//       test
//     </Alert>
//   );
// }

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
      slots={
        {
          // forgotPasswordLink: ForgotPasswordLink,
          // signUpLink: SignUpLink,
          // subtitle: DemoInfo,
        }
      }
    />
  );
}
