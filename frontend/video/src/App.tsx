import PlayPauseBtn from "./components/PlayPauseBtn";
import TimelineBtn from "./components/TimelineBtn";
import GrachtVideo from "./assets/gracht.mp4"

export default function App() {
  return (
    <div className=" h-dvh w-dvw overflow-hidden">
      <div className="relative h-full inline-block overflow-hidden">
        <video className="block h-full" loop autoPlay playsInline>
          <source src={GrachtVideo} type="video/mp4"/>
        </video>
        <div className="bg-white absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-4">
          <TimelineBtn direction="back"/>
          <PlayPauseBtn status="play"/>
          <TimelineBtn direction="forward"/>
        </div>
      </div>
    </div>
  );
}
