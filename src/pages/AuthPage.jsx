import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, handleGoogleCallback } from "../redux/slices/loginSlice";
import { registerUser } from "../redux/slices/registerSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorTranslator from "../utils/ErrorTranslator";
import AuthLayout from "../components/auth/AuthLayout";
import WelcomeAnimation from "../components/auth/WelcomeAnimation";
import WaitingConfirmation from "../components/auth/WaitingConfirmation";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

// وظائف التنبيهات الموحدة مع الكودين السابقين
const showAuthMobileSuccessToast = (message) => {
  if (window.innerWidth < 768) {
    toast.success(message, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "12px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
      },
    });
  }
};

const showAuthMobileAlertToast = (message, type = "info") => {
  if (window.innerWidth < 768) {
    const toastFunc =
      type === "error"
        ? toast.error
        : type === "warning"
          ? toast.warning
          : toast.info;

    const gradient =
      type === "error"
        ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
        : type === "warning"
          ? "linear-gradient(135deg, #FFA726, #FFCA28)"
          : "linear-gradient(135deg, #2E3E88, #32B9CC)";

    toastFunc(message, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "12px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
        background: gradient,
        color: "white",
      },
    });
  }
};

const showAuthMobileErrorHtml = (htmlContent) => {
  if (window.innerWidth < 768) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "حدث خطأ";
    showAuthMobileAlertToast(textContent, "error");
  }
};

// تنسيق SweetAlert2 الموحد
const showAuthSwal = (title, html, icon, timer = 2500) => {
  if (window.innerWidth >= 768) {
    const backgroundGradient =
      icon === "error"
        ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
        : icon === "warning"
          ? "linear-gradient(135deg, #FFA726, #FFCA28)"
          : icon === "info"
            ? "linear-gradient(135deg, #2E3E88, #32B9CC)"
            : "linear-gradient(135deg, #2E3E88, #32B9CC)";

    Swal.fire({
      title: title,
      html: html,
      icon: icon,
      confirmButtonText: "حسنًا",
      timer: timer,
      showConfirmButton: false,
      background: backgroundGradient,
      color: "white",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
      },
    });
  }
};

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading: loginLoading, isGoogleLoading } = useSelector(
    (state) => state.login,
  );

  const { isLoading: registerLoading } = useSelector((state) => state.register);

  const [activeTab, setActiveTab] = useState(
    location.pathname === "/register" ? "register" : "login",
  );
  const [forgetMode, setForgetMode] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedUserName, setLoggedUserName] = useState("");
  const [loggedUserImage, setLoggedUserImage] = useState("");
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const authLayoutRef = useRef(null);
  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);

  // Login states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forget password state
  const [forgetEmail, setForgetEmail] = useState("");

  // سحب تحويلات الأخطاء من ErrorTranslator
  const translateGoogleError = (error) => {
    const errorMap = {
      "user is already has password": "هذا الحساب مسجل بالفعل بكلمة مرور.",
      "Invalid Google token": "رمز Google غير صالح",
      "User not found": "المستخدم غير موجود",
    };

    return errorMap[error] || "حدث خطأ أثناء تسجيل الدخول باستخدام Google";
  };

  const extractTokenFromUrl = useCallback(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      return hash.replace("#token=", "");
    }
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("token");
  }, []);

  const extractErrorFromUrl = useCallback(() => {
    const hash = window.location.hash;

    if (hash.startsWith("#error=")) {
      return decodeURIComponent(hash.replace("#error=", ""));
    }

    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("error");
  }, []);

  const scrollToForm = useCallback((formType) => {
    if (window.innerWidth >= 1024) return;

    setTimeout(() => {
      if (formType === "login" && loginFormRef.current) {
        loginFormRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (formType === "register" && registerFormRef.current) {
        registerFormRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (authLayoutRef.current) {
        authLayoutRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }, []);

  // معالجة Google Auth
  useEffect(() => {
    const token = extractTokenFromUrl();
    const error = extractErrorFromUrl();

    if (error) {
      window.history.replaceState(null, "", "/auth");

      if (window.innerWidth < 768) {
        showAuthMobileAlertToast(translateGoogleError(error), "error");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        showAuthSwal("تعذر تسجيل الدخول", translateGoogleError(error), "error");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }

      return;
    }

    if (token) {
      window.history.replaceState(null, "", "/auth");
      setIsProcessingGoogle(true);

      const processGoogleLogin = async () => {
        try {
          const result = await dispatch(handleGoogleCallback(token)).unwrap();

          if (result?.token) {
            setLoggedUserName(result.firstName || result.email || "مستخدم");
            setLoggedUserImage(result.imageUrl || "");
            setShowWelcome(true);
            setIsProcessingGoogle(false);

            setTimeout(() => {
              setShowWelcome(false);
              navigate("/");
            }, 3000);
          }
        } catch (err) {
          setIsProcessingGoogle(false);

          if (window.innerWidth < 768) {
            showAuthMobileAlertToast(
              "حدث خطأ أثناء تسجيل الدخول باستخدام Google",
              "error",
            );
            setTimeout(() => {
              navigate("/login");
            }, 2500);
          } else {
            showAuthSwal(
              "خطأ في تسجيل الدخول",
              "حدث خطأ أثناء تسجيل الدخول باستخدام Google",
              "error",
            );
            setTimeout(() => {
              navigate("/login");
            }, 2500);
          }
        }
      };

      processGoogleLogin();
    }
  }, [dispatch, navigate, extractTokenFromUrl, extractErrorFromUrl]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      scrollToForm(activeTab);
    }
  }, [activeTab, scrollToForm]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleLoginTabClick = useCallback(() => {
    scrollToForm("login");
  }, [scrollToForm]);

  const handleRegisterTabClick = useCallback(() => {
    scrollToForm("register");
  }, [scrollToForm]);

  const handleLoginChange = useCallback((name, value) => {
    setLoginData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRegisterChange = useCallback((name, value) => {
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (window.innerWidth >= 768) {
      Swal.fire({
        title: "جاري تسجيل الدخول...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
        },
      });
    }

    const formData = new FormData();
    formData.append("Email", loginData.email);
    formData.append("Password", loginData.password);

    try {
      const res = await dispatch(loginUser(formData)).unwrap();

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res));

        setLoggedUserName(res.firstName || res.email || "مستخدم");
        setLoggedUserImage(res.imageUrl || "");
        setShowWelcome(true);

        if (window.innerWidth >= 768) {
          Swal.close();
        }

        setTimeout(() => {
          setShowWelcome(false);
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      if (window.innerWidth >= 768) {
        Swal.close();
      }

      const errorMessage = ErrorTranslator.translate(error);

      if (window.innerWidth < 768) {
        showAuthMobileErrorHtml(errorMessage);
      } else {
        showAuthSwal("خطأ في تسجيل الدخول", errorMessage, "error");
      }
    }
  };

  // Google Login handler
  const handleGoogleLogin = async () => {
    try {
      const returnUrl = encodeURIComponent(`${window.location.origin}/auth`);
      const tenant = "Chicken_One";

      const googleAuthUrl = `https://restaurant-template.runasp.net/api/account/login/google?returnUrl=${returnUrl}&Tenant=${tenant}`;

      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google login redirect error:", error);

      if (window.innerWidth < 768) {
        showAuthMobileAlertToast(
          "حدث خطأ أثناء التوجيه إلى Google. يرجى المحاولة مرة أخرى.",
          "error",
        );
      } else {
        showAuthSwal(
          "خطأ في الاتصال",
          "حدث خطأ أثناء التوجيه إلى Google. يرجى المحاولة مرة أخرى.",
          "error",
        );
      }
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();

    const passwordValidations = {
      length: registerData.password.length >= 8,
      lowercase: /[a-z]/.test(registerData.password),
      uppercase: /[A-Z]/.test(registerData.password),
      specialChar: /[^A-Za-z0-9]/.test(registerData.password),
      match:
        registerData.password !== "" &&
        registerData.password === registerData.confirmPassword,
    };

    const allValid = Object.values(passwordValidations).every(Boolean);
    if (!allValid) {
      const errorMsg = "يرجى التأكد من استيفاء جميع شروط كلمة المرور";
      if (window.innerWidth < 768) {
        showAuthMobileAlertToast(errorMsg, "warning");
      } else {
        showAuthSwal("تنبيه", errorMsg, "warning");
      }
      return;
    }

    const formData = new FormData();
    formData.append("FirstName", registerData.firstName);
    formData.append("LastName", registerData.lastName);
    formData.append("Email", registerData.email);
    formData.append("PhoneNumber", registerData.phoneNumber);
    formData.append("Password", registerData.password);
    formData.append("ConfirmPassword", registerData.confirmPassword);

    try {
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        setWaitingForConfirmation(true);
        setUserEmail(registerData.email);
        setResendDisabled(true);
        setTimer(60);

        if (window.innerWidth < 768) {
          showAuthMobileSuccessToast(
            "تم إنشاء حسابك بنجاح! يرجى تأكيد بريدك الإلكتروني للمتابعة.",
          );
        } else {
          showAuthSwal(
            "تم إنشاء الحساب",
            "تم إنشاء حسابك بنجاح! يرجى تأكيد بريدك الإلكتروني للمتابعة.",
            "success",
          );
        }
      } else {
        const errorResponse =
          resultAction.payload || resultAction.error?.response?.data || null;

        const errorMessage = ErrorTranslator.translate(errorResponse);

        if (window.innerWidth < 768) {
          showAuthMobileErrorHtml(errorMessage);
        } else {
          showAuthSwal("خطأ في التسجيل", errorMessage, "error");
        }
      }
    } catch (err) {
      if (window.innerWidth < 768) {
        showAuthMobileAlertToast("حدث خطأ غير متوقع.", "error");
      } else {
        showAuthSwal("خطأ في التسجيل", "حدث خطأ غير متوقع.", "error");
      }
    }
  };

  // Forget password handler
  const handleForgetPassword = async (e) => {
    e.preventDefault();

    if (window.innerWidth >= 768) {
      Swal.fire({
        title: "جاري إرسال رمز إعادة التعيين...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: "linear-gradient(135deg, #2E3E88, #32B9CC)",
        color: "white",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
        },
      });
    }

    try {
      await axiosInstance.post(
        "/api/Auth/ForgetPassword",
        { email: forgetEmail },
        { headers: { "Content-Type": "application/json" } },
      );

      if (window.innerWidth >= 768) {
        Swal.close();
      }

      setWaitingForConfirmation(true);
      setUserEmail(forgetEmail);
      setResendDisabled(true);
      setTimer(60);

      if (window.innerWidth < 768) {
        showAuthMobileAlertToast(
          "لقد أرسلنا رمز إعادة التعيين إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.",
          "info",
        );
      } else {
        showAuthSwal(
          "تم إرسال رمز إعادة التعيين",
          "لقد أرسلنا رمز إعادة التعيين إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.",
          "info",
        );
      }
    } catch (err) {
      if (window.innerWidth >= 768) {
        Swal.close();
      }

      const errorData = err.response?.data;
      const translatedMessage = ErrorTranslator.translate(errorData);

      if (window.innerWidth < 768) {
        showAuthMobileErrorHtml(translatedMessage);
      } else {
        showAuthSwal("خطأ", translatedMessage, "error");
      }
    }
  };

  const handleResendEmail = async () => {
    try {
      await axiosInstance.post("/api/Auth/ResendConfirmationEmail", {
        email: forgetMode ? forgetEmail : registerData.email,
      });

      if (window.innerWidth < 768) {
        showAuthMobileSuccessToast(
          "تم إرسال بريد تأكيد جديد إلى صندوق الوارد الخاص بك.",
        );
      } else {
        showAuthSwal(
          "تم إعادة إرسال البريد الإلكتروني",
          "تم إرسال بريد تأكيد جديد إلى صندوق الوارد الخاص بك.",
          "success",
        );
      }

      setResendDisabled(true);
      setTimer(60);
    } catch (err) {
      const errorData = err.response?.data;
      const translatedMessage = ErrorTranslator.translate(errorData);

      if (window.innerWidth < 768) {
        showAuthMobileErrorHtml(translatedMessage);
      } else {
        showAuthSwal("فشل في إعادة الإرسال", translatedMessage, "error");
      }
    }
  };

  // Timer countdown
  useEffect(() => {
    let countdown;
    if (waitingForConfirmation && resendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [waitingForConfirmation, resendDisabled]);

  // Check email confirmation status
  useEffect(() => {
    let interval;
    if (waitingForConfirmation && userEmail && activeTab === "register") {
      interval = setInterval(async () => {
        try {
          const res = await axiosInstance.get(
            `/api/Auth/CheckConfirmationEmail?email=${encodeURIComponent(
              userEmail,
            )}`,
          );
          if (res.status === 200) {
            if (window.innerWidth < 768) {
              showAuthMobileSuccessToast(
                "تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.",
              );
            } else {
              showAuthSwal(
                "تم تأكيد البريد الإلكتروني",
                "تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.",
                "success",
              );
            }

            setWaitingForConfirmation(false);
            clearInterval(interval);
            setActiveTab("login");
          }
        } catch (err) {
          console.error("Error checking email confirmation", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [waitingForConfirmation, userEmail, activeTab]);

  const passwordValidations = {
    length: registerData.password.length >= 8,
    lowercase: /[a-z]/.test(registerData.password),
    uppercase: /[A-Z]/.test(registerData.password),
    specialChar: /[^A-Za-z0-9]/.test(registerData.password),
    match:
      registerData.password !== "" &&
      registerData.password === registerData.confirmPassword,
  };

  return (
    <AuthLayout
      ref={authLayoutRef}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBack={() => navigate(-1)}
      showWelcome={showWelcome}
      isProcessingGoogle={isProcessingGoogle}
      onGoogleLogin={handleGoogleLogin}
      isGoogleLoading={isGoogleLoading}
      onLoginTabClick={handleLoginTabClick}
      onRegisterTabClick={handleRegisterTabClick}
    >
      {showWelcome ? (
        <WelcomeAnimation
          userName={loggedUserName}
          userImage={loggedUserImage}
        />
      ) : isProcessingGoogle ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <div
              className="animate-spin rounded-full h-20 w-20 border-4 mx-auto mb-4"
              style={{
                borderTopColor: "#2E3E88",
                borderRightColor: "#32B9CC",
                borderBottomColor: "#2E3E88",
                borderLeftColor: "transparent",
              }}
            ></div>
            <p className="text-lg font-semibold" style={{ color: "#2E3E88" }}>
              جاري تحميل بيانات حسابك...
            </p>
          </div>
        </div>
      ) : waitingForConfirmation ? (
        <WaitingConfirmation
          forgetMode={forgetMode}
          email={forgetMode ? forgetEmail : registerData.email}
          timer={timer}
          resendDisabled={resendDisabled}
          onResendEmail={handleResendEmail}
          onBackToLogin={() => {
            setWaitingForConfirmation(false);
            setForgetMode(false);
          }}
        />
      ) : forgetMode ? (
        <ForgotPasswordForm
          email={forgetEmail}
          onEmailChange={setForgetEmail}
          onSubmit={handleForgetPassword}
          onBack={() => setForgetMode(false)}
        />
      ) : activeTab === "login" ? (
        <div ref={loginFormRef}>
          <LoginForm
            email={loginData.email}
            password={loginData.password}
            showPassword={showPassword}
            isLoading={loginLoading}
            onEmailChange={(value) => handleLoginChange("email", value)}
            onPasswordChange={(value) => handleLoginChange("password", value)}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onForgotPassword={() => setForgetMode(true)}
            onSubmit={handleLogin}
          />
        </div>
      ) : (
        <div ref={registerFormRef}>
          <RegisterForm
            formData={registerData}
            showRegisterPassword={showRegisterPassword}
            showConfirmPassword={showConfirmPassword}
            passwordValidations={passwordValidations}
            isLoading={registerLoading}
            onInputChange={handleRegisterChange}
            onToggleRegisterPassword={() =>
              setShowRegisterPassword(!showRegisterPassword)
            }
            onToggleConfirmPassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            onSubmit={handleRegister}
          />
        </div>
      )}
    </AuthLayout>
  );
}
