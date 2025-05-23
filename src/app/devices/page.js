import * as Constants from '../../constants';
import DevicesClientPage from './DevicesClientPage';

const fetchOTAData = async (codename, branch) => {
  const res = await fetch(`${Constants.OTA}${branch}/builds/${codename}.json`, {
    next: { revalidate: Constants.REVALIDATE_TIME },
  });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`HTTP ${res.status} for ${codename}`);
  }
  const json = await res.json();
  return json.response || [];
};

export default async function DevicesPage() {
  let deviceMap = [];
  let error = null;

  try {
    const [devicesRes, versionsRes] = await Promise.all([
      fetch(Constants.DEVICES, { next: { revalidate: Constants.REVALIDATE_TIME } }),
      fetch(Constants.VERSIONS, { next: { revalidate: Constants.REVALIDATE_TIME } }),
    ]);

    if (!devicesRes.ok || !versionsRes.ok) {
      throw new Error('Failed to fetch devices or versions');
    }

    const devices = await devicesRes.json();
    const versions = await versionsRes.json();
    const latestVersion = versions[0]?.branch || null;

    const results = await Promise.all(
      devices.map(async ({ codename, branches }) => {
        const ota = await fetchOTAData(codename, branches[0]);

        const isMaintained = ota.some((build) => build.currently_maintained === true);
        const latestBuild = ota.reduce((max, b) => (b.timestamp > max ? b.timestamp : max), 0);
        const deviceName = ota.find((b) => b.device)?.device || 'N/A';
        const oem = ota.find((b) => b.oem)?.oem || 'N/A';

        return {
          codename,
          device: deviceName,
          oem,
          supportsLatest: branches.includes(latestVersion),
          isMaintained,
          latestBuild,
          imageUrl: `${Constants.DEVICES_IMAGE}${codename}.png`,
        };
      })
    );

    results.sort((a, b) => b.latestBuild - a.latestBuild);
    deviceMap = results;
  } catch (e) {
    console.error('Error fetching devices:', e);
    error = { message: e.message };
    deviceMap = [];
  }

  if (error) {
    return <p className='text-center'>{error.message}</p>;
  }

  return (
    <DevicesClientPage initialDeviceMap={deviceMap} initialError={error} />
  );
}
