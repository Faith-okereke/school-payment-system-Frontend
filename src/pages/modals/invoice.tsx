import type { FeeStructure } from "../../types"

type props={
    closeModal:()=>void
    initiating:boolean
    confirmPayment:()=>void
    feeStructure: FeeStructure
}

const Invoice = ({closeModal, initiating, confirmPayment, feeStructure}: props) => {
  return (
     <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-8">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scaleUp overflow-hidden">
            <div className="futo-maroon p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Payment Summary</h3>
              <button
                onClick={() => closeModal()}
                className="text-white/60 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-8">
                {feeStructure.breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-gray-50 text-sm"
                  >
                    <span className="text-gray-600 font-medium">
                      {item.item}
                    </span>
                    <span className="text-gray-800 font-bold">
                      ₦ {item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 text-lg font-black futo-text-maroon">
                  <span>TOTAL AMOUNT</span>
                  <span>₦ {feeStructure.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start mb-6">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Clicking "Proceed" will securely initiate a transaction on
                  Paystack. Ensure you have your ATM card ready.
                </p>
              </div>

              <button
                onClick={confirmPayment}
                disabled={initiating}
                className="w-full futo-maroon text-white font-bold py-4 rounded-xl hover:bg-red-900 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer "
              >
                {initiating ? (
                   <span className="flex items-center gap-2">
                     <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                     Processing...
                   </span>
                ) : (
                  "Proceed to Payment Gate"
                )}
              </button>
            </div>
          </div>
        </div>
  )
}

export default Invoice