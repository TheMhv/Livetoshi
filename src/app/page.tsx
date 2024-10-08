import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center my-2">Livetoshi</h2>

          <p className="text-center text-gray-600">
            Enable TTS messages with voice models in your live stream using the
            Lightning Network
          </p>
        </CardHeader>

        <CardContent>
          <div className="text-center">
            <a
              className="text-blue-500 underline"
              href="https://github.com/TheMhv/Livetoshi"
            >
              Source-Code
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
