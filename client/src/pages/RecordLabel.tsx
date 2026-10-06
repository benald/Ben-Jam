import ReleaseList from "../components/ReleaseList";

export default function RecordLabel() {
  return (
    <ReleaseList
      endpoint="/api/label"
      title="Brain Kat Records"
      subtitle="Archived releases from the Brain Kat vaults, available on Bandcamp."
      playerType="bandcamp"
    />
  );
}

