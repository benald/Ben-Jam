import ReleaseList from "../components/ReleaseList";

export default function Releases() {
  return (
    <ReleaseList
      endpoint="/api/releases"
      title="Releases"
      subtitle="Released tracks & remixes, available on Bandcamp."
      playerType="bandcamp"
      columns={2}
    />
  );
}
