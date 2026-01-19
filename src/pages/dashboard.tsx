import { useEffect, useState } from "react";
import axios from "axios"; // <--- Added Axios
import type { FeeStructure, Payment, User } from "../types";
import Invoice from "./modals/invoice";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import logo from "../../public/FUTOLOGO.png";

const Dashboard = ({ user }: { user: User | null }) => {
  const [activeSession, setActiveSession] = useState("2025/2026");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentFeeStructure, setCurrentFeeStructure] =
    useState<FeeStructure | null>(null);
  const currentYear = new Date().getFullYear();
  console.log(parseInt(activeSession.split("/")[0]));

  const [showModal, setShowModal] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success"
  >("idle");

  const downloadReceipt = (payment: Payment) => {
    const doc = new jsPDF();

    // --- COLORS & FONTS ---
    const maroon = "#808080"; // FUTO Maroon
    const gray = "#707070";
    const lightGray = "#f5f5f5";
    try {
      doc.addImage(logo, "PNG", 15, 15, 20, 20);
    } catch (e) {
      // Fallback if image format acts up
      doc.setFillColor(maroon);
      doc.circle(25, 25, 10, "F");
    }

    // 2. University Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(maroon);
    doc.text("FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI", 45, 22);

    doc.setFontSize(10);
    doc.setTextColor(gray);
    doc.setFont("helvetica", "normal");
    doc.text("P.M.B. 1526, Owerri, Imo State, Nigeria", 45, 28);
    doc.text("Bursary Department - Student Accounts Unit", 45, 33);

    // 3. Divider Line
    doc.setDrawColor(maroon);
    doc.setLineWidth(1);
    doc.line(15, 40, 195, 40);

    // --- RECEIPT TITLE ---
    doc.setFillColor(lightGray);
    doc.rect(15, 45, 180, 10, "F"); // Background box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor("black");
    doc.text("OFFICIAL PAYMENT RECEIPT", 105, 51, { align: "center" });

    // --- STUDENT DETAILS (Left Side) ---
    doc.setFontSize(10);
    doc.setTextColor("black");

    let y = 70;
    const lineHeight = 8;

    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(user?.full_name || "N/A", 55, y);

    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text("Reg Number:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(user?.username || "N/A", 55, y);

    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text("Department:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text("Computer Science (CSC)", 55, y); // Hardcoded or from user profile

    // --- TRANSACTION DETAILS (Right Side) ---
    y = 70;
    doc.setFont("helvetica", "bold");
    doc.text("Receipt No:", 120, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(maroon);
    doc.text(payment.reference, 150, y);
    doc.setTextColor("black");

    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 120, y);
    doc.setFont("helvetica", "normal");
    doc.text(payment.date, 150, y);

    y += lineHeight;
    doc.setFont("helvetica", "bold");
    doc.text("Session:", 120, y);
    doc.setFont("helvetica", "normal");
    doc.text(payment.session, 150, y);

    // --- PAYMENT BREAKDOWN TABLE ---
    y = 105;

    // Table Header
    doc.setFillColor(maroon);
    doc.rect(15, y, 180, 8, "F");
    doc.setTextColor("white");
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", 20, y + 5.5);
    doc.text("AMOUNT (NGN)", 190, y + 5.5, { align: "right" });

    // Table Row 1 (The main payment)
    y += 8;
    doc.setTextColor("black");
    doc.setFont("helvetica", "normal");

    // Light alternating row background
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y, 180, 10, "F");

    doc.text(payment.purpose, 20, y + 6);
    doc.text(payment.amount.toLocaleString() + ".00", 190, y + 6, {
      align: "right",
    });

    // Total Line
    y += 15;
    doc.setDrawColor(0);
    doc.line(120, y, 195, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL PAID:", 140, y, { align: "right" });
    doc.setTextColor(maroon);
    doc.text("NGN " + payment.amount.toLocaleString() + ".00", 190, y, {
      align: "right",
    });

    // --- FOOTER & AUTHENTICATION ---
    y = 160;
    doc.setFontSize(8);
    doc.setTextColor(gray);
    doc.text(
      "This receipt was generated electronically from the FUTO Student Portal.",
      105,
      y,
      { align: "center" }
    );
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, y + 5, {
      align: "center",
    });

    // Status Stamp
    doc.setDrawColor(0, 150, 0); // Green
    doc.setLineWidth(1);
    doc.rect(140, 125, 40, 15);
    doc.setTextColor(0, 150, 0);
    doc.setFontSize(10);
    doc.setFont("courier", "bold");
    doc.text("PAID & VERIFIED", 160, 134, { align: "center" });

    // Save File
    doc.save(`FUTO_Receipt_${payment.reference}.pdf`);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(
            "http://127.0.0.1:8000/payment-history/",
            {
              headers: { Authorization: `Token ${token}` },
            }
          );

          const history = res.data;
          setPayments(history);

          // --- NEW LOGIC: Calculate Next Session ---
          if (history.length > 0) {
            const schoolFeePayments = history.filter(
              (p: Payment) => p.purpose === "School Fees"
            );

            if (schoolFeePayments.length > 0) {
              const startYears = schoolFeePayments.map((p: Payment) =>
                parseInt(p.session.split("/")[0])
              );

              // 2. Find the highest year paid so far
              const maxYear = Math.max(...startYears);

              // 3. Set the NEXT session
              setActiveSession(`${maxYear + 1}/${maxYear + 2}`);
            }
          }
          // -----------------------------------------
        } catch (err) {
          console.error("Failed to load history", err);
        }
      }
    };

    const fetchFeeStructure = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://127.0.0.1:8000/fee-structure/", {
            headers: { Authorization: `Token ${token}` },
          });
          setCurrentFeeStructure(res.data);
        } catch (err) {
          console.error("Failed to load fee structure", err);
        }
      }
    };

    fetchHistory();
    fetchFeeStructure();
  }, []);

  const confirmPayment = async () => {
    setInitiating(true);
    const token = localStorage.getItem("token");
    console.log(token);

    if (!token) {
      toast.error("Authentication error. Please login again.");
      setInitiating(false);
      return;
    }

    if (!currentFeeStructure) {
      toast.error("Fee structure not loaded. Please refresh the page.");
      setInitiating(false);
      return;
    }

    try {
      // 1. Initiate Payment with Backend
      const response = await axios.post(
        "http://127.0.0.1:8000/initiate-payment/",
        {
          amount: currentFeeStructure.amount,
          session: activeSession,
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      console.log(response.data);

      const { public_key, ref, email, amount_kobo } = response.data;

      // 2. Open Paystack Popup
      // @ts-ignore (Because PaystackPop is loaded via script tag)
      const handler = PaystackPop.setup({
        key: public_key,
        email: email,
        amount: amount_kobo,
        ref: ref, // Use the ref generated by Django

        onClose: () => {
          toast.success("Transaction cancelled");
          setInitiating(false);
        },

        callback: (response: any) => {
          const verifyTransaction = async () => {
            setShowModal(false);
            setVerificationState("verifying");

            try {
              // 4. Verify with Backend
              const verifyResponse = await axios.get(
                `http://127.0.0.1:8000/verify/${ref}/`,
                {
                  headers: { Authorization: `Token ${token}` },
                }
              );

              // Extract dynamic data from backend response
              const { id, purpose, session, status, date } =
                verifyResponse.data;

              const newPayment: Payment = {
                id: id || Date.now().toString(),
                reference: ref,
                amount: currentFeeStructure.amount,
                status: status || "success",
                date: date || new Date().toISOString().split("T")[0],
                purpose: purpose || "School Fees",
                session: session || "2023/2024",
              };

              setPayments([newPayment, ...payments]);
              setVerificationState("success");

              // Reset after 3 seconds
              setTimeout(() => setVerificationState("idle"), 3000);
            } catch (error) {
              console.error(error);
              toast.success(
                "Payment successful at Paystack, but server verification failed."
              );
              setVerificationState("idle");
            } finally {
              setInitiating(false);
            }
          };
          verifyTransaction();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment. Check connection.");
      setInitiating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Verification Overlay */}
      {verificationState !== "idle" && (
        <div className="fixed inset-0 z-50 bg-maroon-900/10 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center border border-gray-100">
            {verificationState === "verifying" ? (
              <>
                <div className="animate-spin h-12 w-12 border-4 border-red-800 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Verifying Payment
                </h3>
                <p className="text-gray-500 mt-2">
                  Communicating with Paystack and FUTO Bursary servers...
                </p>
              </>
            ) : (
              <>
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Payment Confirmed!
                </h3>
                <p className="text-gray-500 mt-2">
                  Your receipt has been generated and your portal updated.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-100">
            <span className="text-2xl font-bold futo-text-maroon">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "S"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {user?.full_name || "Student"}
            </h1>
            <p className="text-gray-500 font-medium">
              Reg: {user?.username || "N/A"}
            </p>
            <span className="inline-block mt-1 px-3 py-1 bg-red-50 futo-text-maroon rounded-full text-xs font-bold uppercase tracking-wider">
              Computer Science • 400L
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer bg-[#008000] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-red-900 transition-all flex items-center gap-3 w-full md:w-auto justify-center disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-none"
          disabled={parseInt(activeSession.split("/")[0]) >= currentYear}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Pay {activeSession} Fees
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">Account Status</p>
          <p className="text-2xl font-black text-green-600 mt-2 uppercase">
            Verified
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">
              All sessions cleared
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Active Session</p>
          <p className="text-2xl font-black text-gray-800 mt-2">
            {activeSession || "N/A"}
          </p>
          <p className="text-xs text-blue-600 mt-4 font-bold">
            Registration Open
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-maroon-800">
          <p className="text-gray-500 text-sm font-medium">
            Outstanding Balance
          </p>
          <p className="text-2xl font-black text-red-800 mt-2">₦ 0.00</p>
          <p className="text-xs text-gray-400 mt-4">
            Last updated today, 10:45 AM
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Recent Transactions
          </h3>
          {payments.length > 0 && (
            <button className="text-red-800 text-sm font-bold hover:underline bg-red-50 px-3 py-1 rounded-lg">
              View All History
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Reference No.</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-5 text-center text-gray-400"
                  >
                    No Recent Payments
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-5 font-mono text-sm text-gray-500">
                      {p.reference}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-800">{p.purpose}</p>
                      <p className="text-xs text-gray-400">
                        Session: {p.session}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-black text-gray-800">
                      ₦ {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`${
                          p.status === "success"
                            ? `bg-green-100 text-green-700`
                            : p.status === "pending"
                            ? `bg-yellow-100 text-yellow-700`
                            : `bg-red-100 text-red-700`
                        }  px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group-hover:text-red-800"
                        onClick={() => downloadReceipt(p)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && currentFeeStructure && (
        <Invoice
          initiating={initiating}
          confirmPayment={confirmPayment}
          closeModal={() => setShowModal(false)}
          feeStructure={currentFeeStructure}
        />
      )}
    </div>
  );
};
export default Dashboard;
