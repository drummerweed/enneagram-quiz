import { ClientStartButton } from '@/components/ClientStartButton';

export default function Home() {
  return (
    <>
      {/* Quiz Start Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto text-center">
        <ClientStartButton />
      </div>
    </>
  );
}
