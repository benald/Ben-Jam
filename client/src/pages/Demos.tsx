import ReleaseList from "../components/ReleaseList";

export default function Demos() {
  return <ReleaseList endpoint="/api/demos" title="Demos" subtitle="Demos, Works in progress & unreleased tracks." playerType="bandcamp" />;
}
