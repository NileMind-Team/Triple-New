import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const hasConfirmed = useRef(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");
    const decodedCode = code ? decodeURIComponent(code) : null;

    if (!userId || !decodedCode) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "The link you used is incomplete or invalid.",
      });
      setLoading(false);
      setSuccess(false);
      return;
    }

    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    const confirmEmail = async () => {
      try {
        const res = await axiosInstance.post("/api/Auth/ConfirmEmail", {
          userId,
          code: decodedCode,
        });

        setMessage(
          res.data.message || "Your email has been confirmed successfully."
        );
        setSuccess(true);

        Swal.fire({
          icon: "success",
          title: "Email Confirmed",
          text:
            res.data.message || "Your email has been confirmed successfully.",
          showConfirmButton: false,
          timer: 2000,
        });

        setLoading(false);
      } catch (err) {
        const errorCode = err.response?.data?.errors?.[0]?.code || "";
        if (errorCode === "User.DuplicatedConfirmation") {
          setMessage("Your email has already been confirmed.");
          setSuccess(true);
          Swal.fire({
            icon: "info",
            title: "Already Confirmed",
            text: "Your email was already confirmed previously.",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setMessage(
            err.response?.data?.errors?.[0]?.description ||
              "An error occurred while confirming your email."
          );
          setSuccess(false);
          Swal.fire({
            icon: "error",
            title: "Email Confirmation Failed",
            text:
              err.response?.data?.errors?.[0]?.description ||
              "An error occurred while confirming your email.",
          });
        }
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 w-full max-w-md text-center transition-all duration-500">
        {loading ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Confirming Your Email...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait a moment while we verify your email.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div
              className={`rounded-full p-4 ${
                success
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {success ? (
                <svg
                  className="w-12 h-12 text-green-500 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {success ? "Email Confirmed" : "Confirmation Failed"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>

            {success && (
              <button
                onClick={() => navigate("/login")}
                className="mt-4 bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200"
              >
                Back to Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
