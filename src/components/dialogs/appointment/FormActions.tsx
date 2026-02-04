import { useTranslation } from "@/hooks/useTranslation";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

/**
 * Form Actions Component
 * Displays submit and cancel buttons for the appointment form
 */
export const FormActions = ({ isSubmitting, onCancel }: FormActionsProps) => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 transition-all font-medium w-full"
      >
        {t("cancel")}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold w-full shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {t("creating")}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t("saveAppointment")}
          </>
        )}
      </button>
    </div>
  );
};

