import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingIntro from "../../ReusableFolder/loadingIntro";
import { motion, AnimatePresence } from "framer-motion";
import PatientFormModal from "../Login/Register";
import { UserDisplayContext } from "../../contexts/UserContext/userContext";
import ForgotPassword from "../Login/ForgotPassword";

export default function AuthFormModal({ isOpen, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDoctorModalOpen, setDoctorModalOpen] = useState(false);
  const [isStaffModalOpen, setStaffModalOpen] = useState(false);
  const [isPatientModalOpen, setPatientModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { isUser } = useContext(UserDisplayContext);
  const [isForgotPassword, setForgotPassword] = useState(false);

  const [values, setValues] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    confirmPassword: "",
    contact_number: "",
    specialty: "",
    age: "",
    gender: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    dob: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleInput = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const handleRoleSelect = useCallback((role) => {
    setUserRole(role);
    if (role === "doctor") setDoctorModalOpen(true);
    else if (role === "patient") setPatientModalOpen(true);
    else if (role === "staff") setStaffModalOpen(true);
  }, []);

  const handleBackToRoleSelect = useCallback(() => {
    setCurrentStep(1);
    setUserRole(null);
    setValues({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      confirmPassword: "",
      contact_number: "",
      specialty: "",
      age: "",
      gender: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      dob: "",
    });
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await login(values.email, values.password);

    if (response.success) {
      toast.success("Login successful!");
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        navigate("/dashboard");
      }, 1000);
    } else {
      setIsLoading(false);
      toast.error(response.message || "Login failed. Please check your credentials.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const userData = {
      email: values.email,
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
      role: userRole,
      ...(userRole === "doctor" && {
        contact_number: values.contact_number,
        specialty: values.specialty,
      }),
      ...(userRole === "staff" && {
        contact_number: values.contact_number,
        specialty: values.specialty,
      }),
      ...(userRole === "patient" && {
        age: values.age,
        gender: values.gender,
        contact_number: values.contact_number,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        dob: values.dob,
      }),
    };

    const response = await register(userData);

    if (response.success) {
      toast.success("Registration successful! You can now log in.");
      setIsFlipped(false);
      handleBackToRoleSelect();
      setDoctorModalOpen(false);
      setPatientModalOpen(false);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      toast.error(response.message || "Registration failed. Please try again.");
    }
  };

  const flipVariants = {
    hidden: { rotateY: 90, opacity: 0 },
    visible: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  };

  const RoleSelectionStep = useCallback(() => (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFlipped(false)}
          className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Login
        </button>
        <h3 className="text-base font-semibold text-blue-800 sm:text-lg">Select Your Role</h3>
        <div className="w-16 sm:w-24"></div>
      </div>

      <div className="flex justify-center">
        <motion.button
          type="button"
          onClick={() => handleRoleSelect("patient")}
          className="flex w-full max-w-xs flex-col items-center rounded-xl border-2 border-blue-200 p-4 sm:p-6 transition-colors hover:bg-blue-50"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mb-2 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-blue-800 sm:text-base">Patient</h4>
          <p className="mt-1 text-center text-xs text-blue-600 sm:text-sm">Book appointments and manage your dental care</p>
        </motion.button>
      </div>
    </div>
  ), [handleRoleSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xs sm:max-w-md">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="login"
              className="rounded-xl border border-blue-100 bg-white p-5 sm:p-8 shadow-lg relative"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={flipVariants}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>

              <div className="mb-6 flex flex-col items-center sm:mb-8">
                <div className="relative mb-3 h-16 w-16 sm:mb-4 sm:h-20 sm:w-20">
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white sm:h-12 sm:w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 2C8.79086 2 7 3.79086 7 6V11.547C7 13.9174 5.09349 15.8285 4.24945 18.1517C3.39324 20.5065 4.13524 21.9961 6.5 22C8.86476 22.0039 9.60676 20.5143 8.75055 18.1595C7.90651 15.8363 6 13.9252 6 11.554L6 6C6 4.34315 7.34315 3 9 3H15C16.6569 3 18 4.34315 18 6V11.554C18 13.9252 16.0935 15.8363 17.021 18.1595C17.9486 20.4828 17.1866 22 14.5 22C11.8134 22 11.0514 20.4828 11.979 18.1595C12.9065 15.8363 11 13.9252 11 11.554V6C11 3.79086 11.7909 2 11 2Z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-center text-xl font-bold text-blue-800 sm:text-2xl">DENTAL CARE</h2>
                <p className="mt-0.5 text-xs text-blue-600 sm:mt-1 sm:text-sm">Clinic Monitoring System</p>
              </div>

              <form className="space-y-3 sm:space-y-5" onSubmit={handleLoginSubmit}>
                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-medium text-blue-700 sm:mb-2 sm:text-sm">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleInput}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-xs font-medium text-blue-700 sm:mb-2 sm:text-sm">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={values.password}
                    onChange={handleInput}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-1.5 ${isLoading ? "cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200`}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingIntro /> : "Login"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-blue-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setIsFlipped(true); setCurrentStep(1); }}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    Register here
                  </button>
                </p>
                <p className="mt-2 text-xs text-blue-600">
                  <a onClick={() => setForgotPassword(true)} className="group inline-flex cursor-pointer items-center font-medium text-blue-700 transition-colors duration-200 hover:text-blue-900 hover:underline">
                    Forgot password
                  </a>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              className="rounded-xl border border-blue-100 bg-white p-5 sm:p-8 shadow-lg relative"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={flipVariants}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
              {currentStep === 1 && <RoleSelectionStep />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested Modals */}
      <PatientFormModal
        isOpen={isDoctorModalOpen}
        onClose={() => { setDoctorModalOpen(false); handleBackToRoleSelect(); }}
        role={userRole}
        values={values}
        onInputChange={handleInput}
        onSubmit={handleRegisterSubmit}
      />
      <PatientFormModal
        isOpen={isStaffModalOpen}
        onClose={() => { setStaffModalOpen(false); handleBackToRoleSelect(); }}
        role={userRole}
        values={values}
        onInputChange={handleInput}
        onSubmit={handleRegisterSubmit}
      />
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => { setPatientModalOpen(false); handleBackToRoleSelect(); }}
        role={userRole}
        values={values}
        onInputChange={handleInput}
        onSubmit={handleRegisterSubmit}
      />

      <ForgotPassword
        show={isForgotPassword}
        onClose={() => setForgotPassword(false)}
      />
    </div>
  );
}