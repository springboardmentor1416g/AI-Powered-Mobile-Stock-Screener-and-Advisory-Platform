export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center text-red-600 py-6">
      <p>{message}</p>
      <p className="text-sm text-gray-500">Please try again later.</p>
    </div>
  );
}
