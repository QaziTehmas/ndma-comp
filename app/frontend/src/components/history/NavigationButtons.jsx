export default function NavigationButtons({
  goNext,
  goPrevious,
  disableNext,
  disablePrev,
}) {
  return (
    <div className="flex justify-between mt-6">
      <button
        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-40"
        onClick={goPrevious}
        disabled={disablePrev}
      >
        Previous
      </button>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-40"
        onClick={goNext}
        disabled={disableNext}
      >
        Next
      </button>
    </div>
  );
}