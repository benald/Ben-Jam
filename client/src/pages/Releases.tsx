import ReleaseList from "../components/ReleaseList";

export default function Releases() {
  return (
    <ReleaseList
      endpoint="/api/releases"
      title="Releases"
      subtitle="Released tracks & remixes."
      playerType="bandcamp"
      columns={2}
    />
  );
}
