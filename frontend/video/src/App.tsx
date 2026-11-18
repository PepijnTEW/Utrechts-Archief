import GrachtVideo from "./assets/gracht.mp4"

export default function App() {
  return (
    <div className=" h-dvh w-dvw overflow-hidden">
      <div className="relative h-full inline-block overflow-hidden">
        <video className="block h-full" loop autoPlay playsInline>
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
        <div className="absolute inset-0 z-10">
        </div>
      </div>
    </div>
  );
}
