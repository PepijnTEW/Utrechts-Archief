import GrachtVideo from "./assets/gracht.mp4"
export default function App() {
  return (
    <>
      <div className="h-dvh w-dvw">
        <video className="h-full" loop autoPlay playsInline>
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
      </div>
    </>
  );
}
