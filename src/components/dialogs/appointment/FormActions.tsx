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
    <div className="flex justify-end gap-3 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium"
      >
        {t("cancel")}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 rounded-md bg-teal-500 hover:bg-teal-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? t("creating") : t("saveAppointment")}
      </button>
    </div>
  );
};

