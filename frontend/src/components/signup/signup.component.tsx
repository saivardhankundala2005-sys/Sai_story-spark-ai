import AuthLayout from "../auth/AuthLayout";
import { useForm, SubmitHandler } from "react-hook-form";
import SSInput from "../ui-component/ss-input/ss-input";
import SSButton from "../ui-component/ss-button/ss-button";
import { useState } from "react";
import { storeUserInfo } from "../../services/auth.service";
import toast, { Toaster } from "react-hot-toast";
import {
  useEmailVerifyMutation,
  useVerifyOtpMutation,
} from "../../redux/apis/otp.verify.api";
import { useRegisterUserMutation } from "../../redux/apis/auth.api";
import { useNavigate } from "react-router-dom";

interface IRegisterInfo {
  name: string;
  email: string;
  password: string;
}

interface Inputs extends IRegisterInfo {
  confirmPassword: string;
  otp: string;
}

const getPasswordError = (password: string) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return "";
};

const SignUpComponent = () => {
  const navigate = useNavigate();
  const [emailVerify] = useEmailVerifyMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [registerUser] = useRegisterUserMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ mode: "onChange" });
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [showOtpField, setShowOtpField] = useState<boolean>(false);
  const [registerInfo, setRegisterInfo] = useState<IRegisterInfo>();
  const [expiredAt, setExpiredAt] = useState(0);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const otp = watch("otp");
  const passwordChecks = {
  length: password?.length >= 8,
  uppercase: /[A-Z]/.test(password || ""),
  lowercase: /[a-z]/.test(password || ""),
  number: /[0-9]/.test(password || ""),
  special: /[^A-Za-z0-9]/.test(password || ""),
};

const passedChecks =
  Object.values(passwordChecks).filter(Boolean).length;

const passwordStrength =
  passedChecks <= 2
    ? "Weak"
    : passedChecks <= 4
    ? "Medium"
    : "Strong";

const strengthColor =
  passwordStrength === "Weak"
    ? "bg-red-500"
    : passwordStrength === "Medium"
    ? "bg-yellow-400"
    : "bg-green-500";

const strengthWidth =
  passwordStrength === "Weak"
    ? "w-1/3"
    : passwordStrength === "Medium"
    ? "w-2/3"
    : "w-full";

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (data) {
      const user = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const otpPayload = {
        name: data.name,
        email: data.email,
      };
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      const passwordError = getPasswordError(data.password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      setIsBusy(true);
      try {
        const res = await emailVerify({ ...otpPayload }).unwrap();
        if (res?.data) {
          const { expiresAt } = res.data;
          setExpiredAt(new Date(expiresAt).getTime());
          toast.success("OTP sent to your email");
          setRegisterInfo(user);
          setShowOtpField(true);
        }
      } catch (error) {
        const message =
          (error as { data?: Array<{ message?: string }> })?.data?.[0]
            ?.message ||
          "Failed to send OTP. Check backend .env email credentials.";
        toast.error(message);
        console.log("error: ", error);
      } finally {
        setIsBusy(false);
      }
    }
  };

  const handleOtpValidation = async () => {
    const enteredOtp = otp?.trim();
    if (!enteredOtp) {
      toast.error("Please enter OTP");
      return;
    }
    if (!registerInfo) {
      toast.error("Something went wrong. Please restart the process.");
      return;
    }
    if (Date.now() > expiredAt) {
      toast.error("OTP expired. Please request a new one.");
      return;
    }
    setIsBusy(true);
    try {
      const otpResponse = await verifyOtp({
        email: registerInfo.email,
        otp: enteredOtp,
      }).unwrap();

      if (otpResponse?.data?.verificationToken) {
        const res = await registerUser({
          ...registerInfo,
          verificationToken: otpResponse.data.verificationToken,
        }).unwrap();

        if (res.data.accessToken) {
          toast.success("OTP validated successfully!");
          storeUserInfo({ accessToken: res.data.accessToken });
          navigate("/");
        }
      } else {
        throw new Error("No verification token received");
      }
    } catch (err: unknown) {
      const message =
        (err as { data?: Array<{ message?: string }> })?.data?.[0]?.message ||
        "OTP verification failed. Please check the code and try again.";
      toast.error(message);
      console.log("error: ", err);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Create Account"
        subtitle="Join StorySparkAI and begin your creative journey."
      >
        <div className="w-full space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-400 font-semibold">
                SIGN UP WITH EMAIL
              </span>
            </div>
          </div>

          {!showOtpField ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <SSInput
                label="Name"
                name="name"
                placeholder="Enter your name"
                required={true}
                icon="fas fa-user"
                register={register}
                validation={{
                  required: "Name is required",
                  minLength: {
                    value: 8,
                    message: "Name must be at least 8 characters",
                  },
                  pattern: {
                    value: /^[A-Za-z0-9\s._]+$/,
                    message:
                      "Only letters, numbers, spaces, underscores, and dots are allowed",
                  },
                }}
                error={errors.name}
              />

              <SSInput
                label="Email address"
                name="email"
                type="email"
                placeholder="Enter your email"
                required={true}
                icon="fas fa-envelope"
                register={register}
                error={errors.email}
              />

              <SSInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required={true}
                icon="fas fa-lock"
                register={register}
                error={errors.password}
              />

              <div className="space-y-3 -mt-2">
  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
    <div
      className={`h-full transition-all duration-300 ${strengthColor} ${strengthWidth}`}
    ></div>
  </div>

  <p
    className={`text-sm font-medium ${
      passwordStrength === "Weak"
        ? "text-red-400"
        : passwordStrength === "Medium"
        ? "text-yellow-300"
        : "text-green-400"
    }`}
  >
    {passwordStrength} Password
  </p>

  <ul className="space-y-1 text-xs">
    <li
      className={
        passwordChecks.length ? "text-green-400" : "text-red-400"
      }
    >
      {passwordChecks.length ? "✅" : "❌"} Minimum 8 characters
    </li>

    <li
      className={
        passwordChecks.uppercase ? "text-green-400" : "text-red-400"
      }
    >
      {passwordChecks.uppercase ? "✅" : "❌"} One uppercase letter
    </li>

    <li
      className={
        passwordChecks.lowercase ? "text-green-400" : "text-red-400"
      }
    >
      {passwordChecks.lowercase ? "✅" : "❌"} One lowercase letter
    </li>

    <li
      className={
        passwordChecks.number ? "text-green-400" : "text-red-400"
      }
    >
      {passwordChecks.number ? "✅" : "❌"} One number
    </li>

    <li
      className={
        passwordChecks.special ? "text-green-400" : "text-red-400"
      }
    >
      {passwordChecks.special ? "✅" : "❌"} One special character
    </li>
  </ul>
</div>

              <SSInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required={true}
                icon="fas fa-eye"
                register={register}
                error={errors.confirmPassword}
              />

              <SSButton text="Sign Up" type="submit" isLoading={isBusy} />
            </form>
          ) : (
            <div className="space-y-4">
              <SSInput
                label="OTP"
                name="otp"
                placeholder="Enter your OTP"
                required={true}
                icon="fas fa-key"
                register={register}
              />

              <SSButton
                text="Verify OTP"
                type="button"
                onClick={handleOtpValidation}
                isLoading={isBusy}
              />
            </div>
          )}

          {!showOtpField && (
            <div className="text-center text-sm text-indigo-600">
              <a href="/login" className="block text-custom hover:underline">
                Already have an account? Sign In
              </a>
            </div>
          )}
        </div>
      </AuthLayout>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default SignUpComponent;
