import React from 'react';
import * as Constants from '../../../constants';
import DeviceContent from './components/device-content';
import DeviceNotFound from './components/DeviceNotFound';

export async function generateMetadata({ params }) {
  const { codename } = params;
  const deviceData = await getDeviceData(codename);

  const SOCIAL_BANNER_PATH = '/Banner.png';
  const SOCIAL_BANNER_WIDTH = 1920;
  const SOCIAL_BANNER_HEIGHT = 1080;
  const SOCIAL_BANNER_ALT = 'Banner';

  const baseDeviceImagePath = Constants.DEVICES_IMAGE;

  if (!deviceData || !deviceData.branchesData?.length) {
    return {
      title: 'Device Not Found - Evolution X',
      description: 'The requested device was not found.',
      openGraph: {
        title: 'Device Not Found - Evolution X',
        description: 'The requested device was not found.',
        url: `${Constants.SITE}/devices/${codename}`,
        siteName: 'Evolution X',
        images: [{
          url: `${Constants.SITE}${SOCIAL_BANNER_PATH}`,
          width: SOCIAL_BANNER_WIDTH,
          height: SOCIAL_BANNER_HEIGHT,
          alt: SOCIAL_BANNER_ALT,
        }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        site: '@evolutionxrom',
        creator: '@evolutionxrom',
        title: 'Device Not Found - Evolution X',
        description: 'The requested device was not found.',
        images: [`${Constants.SITE}${SOCIAL_BANNER_PATH}`],
      },
    };
  }

  const defaultBranchData = deviceData.branchesData[0];
  const otaData = defaultBranchData?.ota?.[0];
  const deviceName = otaData?.device || 'Unknown';
  const oemName = otaData?.oem || 'Unknown';
  const title = `Get Evolution X for ${oemName} ${deviceName} (${codename})`;
  const description = `Download the latest build for ${codename} and #KeepEvolving!`;

  const encodedOem = encodeURIComponent(oemName);
  const encodedDevice = encodeURIComponent(deviceName);
  const encodedCodename = encodeURIComponent(codename);
  const encodedImageUrl = encodeURIComponent(`${Constants.DEVICES_IMAGE}${codename}.png`);
  const ogImageUrl = `${Constants.SITE}/api/og?imageUrl=${encodedImageUrl}&oem=${encodedOem}&device=${encodedDevice}&codename=${encodedCodename}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${Constants.SITE}/devices/${codename}`,
      siteName: 'Evolution X',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${oemName} ${deviceName} (${codename}) - Evolution X`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@evolutionxrom',
      creator: '@evolutionxrom',
      title: title,
      description: description,
      images: [ogImageUrl],
    },
  };
}


async function getDeviceData(codename) {
  try {
    const [devicesResponse, versionsResponse] = await Promise.all([
      fetch(Constants.DEVICES, {
        next: { revalidate: Constants.REVALIDATE_TIME },
      }),
      fetch(Constants.VERSIONS, {
        next: { revalidate: Constants.REVALIDATE_TIME },
      }),
    ]);

    if (!devicesResponse.ok) {
      throw new Error(`Failed to fetch devices data: ${devicesResponse.statusText}`);
    }
    const devices = await devicesResponse.json();
    if (!Array.isArray(devices)) {
      throw new Error('Expected an array of device objects from devices.json');
    }

    if (!versionsResponse.ok) {
      throw new Error(`Failed to fetch versions data: ${versionsResponse.statusText}`);
    }
    const versions = await versionsResponse.json();
    if (!Array.isArray(versions)) {
      throw new Error('Expected an array of version objects from versions.json');
    }

    const device = devices.find((d) => d.codename === codename);

    if (!device) {
      return null;
    }

    const branchesDataPromises = device.branches.map(async (branch) => {
      const otaUrl = `${Constants.OTA}${branch}/builds/${codename}.json`;

      let ota = null;
      let gappsLink = null;
      let version = 'N/A';
      const downloads = {};
      let changelogContent = null;

      try {
        const otaRes = await fetch(otaUrl, {
          next: { revalidate: Constants.REVALIDATE_TIME },
        });

        if (otaRes.ok) {
          const otaJson = await otaRes.json();
          ota = otaJson?.response;
          if (!Array.isArray(ota)) {
            console.warn(`OTA data for ${codename} on branch ${branch} at ${otaUrl} is not an array (or 'response' is missing/not array).`);
            ota = [];
          }
        } else if (otaRes.status === 404) {
          console.warn(`OTA data (404 Not Found) for ${codename} on branch ${branch} at URL: ${otaUrl}`);
          ota = [];
        } else {
          console.error(`HTTP error fetching OTA data for ${codename}/${branch}: ${otaRes.statusText} (${otaRes.status}) from URL: ${otaUrl}`);
          ota = [];
        }
      } catch (error) {
        console.error(`Error fetching or parsing OTA data for ${codename} on branch ${branch} from URL: ${otaUrl}:`, error);
        ota = [];
      }

      if (ota && ota.length > 0) {
        try {
          const changelogUrl = `${Constants.OTA}${branch}/changelogs/${codename}.txt`;
          const changelogRes = await fetch(changelogUrl, {
            next: { revalidate: Constants.REVALIDATE_TIME },
          });

          if (!changelogRes.ok) {
            if (changelogRes.status === 404) {
              changelogContent = null;
            } else {
              console.error(`HTTP error fetching changelog for ${codename}/${branch}: ${changelogRes.statusText} (${changelogRes.status}) from URL: ${changelogUrl}`);
              changelogContent = null;
            }
          } else {
            changelogContent = await changelogRes.text();
          }
        } catch (error) {
          console.error(`Error fetching or parsing inlined changelog for ${codename} on branch ${branch}:`, error);
          changelogContent = null;
        }
      }

      const versionEntry = versions.find((entry) => entry.branch === branch);
      version = versionEntry?.version || 'N/A';
      gappsLink = versionEntry?.gapps_link || null;

      if (ota && ota.length > 0) {
        await Promise.all(
          ota.map(async (otaItem) => {
            const endDate = new Date().toISOString().split('T')[0];
            const downloadUrl = `https://sourceforge.net/projects/evolution-x/files/${codename}/${version}/${encodeURIComponent(otaItem.filename)}/stats/json?start_date=2019-03-19&end_date=${endDate}&period=monthly`;
            try {
              const downloadResponse = await fetch(downloadUrl, {
                next: { revalidate: Constants.REVALIDATE_TIME },
              });
              if (!downloadResponse.ok) {
                console.error(
                  `HTTP error fetching download count for ${otaItem.filename}! status: ${downloadResponse.status}`
                );
                downloads[otaItem.filename] = 0;
              } else {
                const downloadData = await downloadResponse.json();
                downloads[otaItem.filename] =
                  downloadData?.summaries?.time?.downloads || 0;
              }
            } catch (downloadErr) {
              console.error(
                `Error fetching download count for ${otaItem.filename}:`,
                downloadErr
              );
              downloads[otaItem.filename] = 0;
            }
          })
        );
      }

      if (ota && ota.length > 0) {
        return { branch, version, ota, downloads, gappsLink, changelog: changelogContent };
      }
      return null;
    });

    const branchesData = await Promise.all(branchesDataPromises);
    const filteredBranchesData = branchesData.filter((data) => data !== null);

    return { ...device, branchesData: filteredBranchesData };
  } catch (error) {
    console.error(`Error in getDeviceData for ${codename}:`, error);
    throw error;
  }
}

async function getAllCodenames() {
  try {
    const res = await fetch(Constants.DEVICES, {
      next: { revalidate: Constants.REVALIDATE_TIME },
    });

    if (!res.ok) {
      console.error(`Failed to fetch all devices for codenames: ${res.statusText}`);
      return [];
    }

    const devices = await res.json();
    if (Array.isArray(devices)) {
      return devices.map(device => device.codename).filter(Boolean);
    } else {
      console.error('Expected an array of device objects when fetching all codenames.');
      return [];
    }
  } catch (error) {
    console.error("Error in getAllCodenames:", error);
    return [];
  }
}

export default async function DevicePage({ params }) {
  const { codename } = params;

  const [deviceData, allCodenames] = await Promise.all([
    getDeviceData(codename),
    getAllCodenames()
  ]);

  if (!deviceData || !deviceData.branchesData?.length) {
    return <DeviceNotFound codename={codename} allCodenames={allCodenames} />;
  }

  return <DeviceContent codename={codename} deviceData={deviceData} />;
}

export async function generateStaticParams() {
  const devicesRes = await fetch(Constants.DEVICES);
  const devices = await devicesRes.json();

  if (!Array.isArray(devices)) {
    console.error('generateStaticParams: Expected an array of device objects.');
    return [];
  }

  return devices.map((device) => ({
    codename: device.codename,
  }));
}
