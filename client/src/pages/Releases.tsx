import ReleaseList from "../components/ReleaseList";

export default function Releases() {
  return (
    <ReleaseList
      endpoint="/api/releases"
      title="Releases"
      subtitle="Latest singles & EPs."
      playerType="bandcamp"
      columns={2}
    />
  );
}
