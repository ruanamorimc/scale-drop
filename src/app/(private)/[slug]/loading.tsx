export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-120px)] w-full items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}