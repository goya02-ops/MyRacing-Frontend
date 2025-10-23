export default function Spinner() {
  return (
    <div className="flex items-center gap-2 text-white">
      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
      <span>Calculando tiempo...</span>
    </div>
  );
}
