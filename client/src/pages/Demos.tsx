import ReleaseList from "../components/ReleaseList";

export default function Demos() {
  return <ReleaseList endpoint="/api/demos" title="Demos" subtitle="Works in progress & unreleased ideas." />;
}
