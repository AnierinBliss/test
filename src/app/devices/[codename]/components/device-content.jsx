'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowOutwardIcon } from '../../../../components/icons';
import * as Constants from '../../../../constants';
import Download from './Download';
import DeviceNotFound from './DeviceNotFound';
import ThermonuclearWarning from './ThermonuclearWarning';
import BuildTypeInfo from './BuildTypeInfo';
import FlashingInstructions from './FlashingInstructions';
import Changelog from './Changelog';

const initialVariants = {
  hidden: { opacity: 0, y: 75 },
  visible: { opacity: 1, y: 0 }
}

const switchVariants = {
  hidden: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0.8,
    rotateX: -5,
    transformOrigin: 'top center'
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    rotateX: 0,
    transformOrigin: 'top center',
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 22
    }
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0.8,
    rotateX: 5,
    transformOrigin: 'bottom center'
  }
}

const DeviceContent = ({ codename, deviceData: initialDeviceData }) => {
  const [currentBranch, setCurrentBranch] = useState(null);
  const [showBuildTypeInfo, setShowBuildTypeInfo] = useState(false);

  useEffect(() => {
    if (initialDeviceData?.branchesData?.length && !currentBranch) {
      setCurrentBranch(initialDeviceData.branchesData[0].branch);
    }
  }, [initialDeviceData, currentBranch]);

  useEffect(() => {
    if (currentBranch?.toLowerCase().includes('vanilla')) {
      setShowBuildTypeInfo(true);
    } else {
      setShowBuildTypeInfo(false);
    }
  }, [currentBranch]);

  const handleCloseBuildTypeInfo = (action) => {
    if (action === 'gotIt') {
      setShowBuildTypeInfo(false);
    }
  };

  const currentBranchData = initialDeviceData
    ? initialDeviceData.branchesData.find(
        (branchData) => branchData.branch === currentBranch
      )
    : null;

  const currentOtas = currentBranchData?.ota || [];
  const ota = currentOtas[0];

  const isVanilla = currentBranch?.toLowerCase().includes('vanilla');
  const gappsLink = currentBranchData?.gappsLink;

  const downloadCount = ota && currentBranchData?.downloads
    ? currentBranchData.downloads[ota.filename]
    : 'N/A';

  const changelogContent = currentBranchData?.changelog || null;
  const changelogError = !changelogContent ? { message: "No changelog available for this branch." } : null;

  if (!initialDeviceData || !initialDeviceData.branchesData?.length) {
    return <DeviceNotFound codename={codename} allCodenames={[]} />;
  }

  return (
    <>
      <AnimatePresence>
        <ThermonuclearWarning />
        {showBuildTypeInfo && (
          <BuildTypeInfo
            onClose={handleCloseBuildTypeInfo}
            shouldShow={showBuildTypeInfo}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={initialVariants}
        initial='hidden'
        animate='visible'
        className='mx-4 flex flex-col items-center justify-center gap-10 md:gap-20 lg:mx-16 xl:mx-auto xl:w-[80rem]'
      >
        <div className='inline-flex flex-col items-baseline gap-2 text-center font-[Prod-bold] text-4xl sm:flex-row sm:text-5xl lg:gap-4 lg:text-6xl'>
          <img className='h-7 sm:h-10 lg:h-12' src="/evolution.svg" alt='Evolution X Logo' />
          <span className='evoxhighlight'>{codename}</span>
        </div>

        <div className='flex w-full flex-col gap-4 sm:-mt-8 lg:-mb-20 lg:-mt-16'>
          <div className='inline-flex flex-wrap items-center justify-start gap-2 lg:gap-3'>
            {initialDeviceData.branchesData.map((branchData) => {
              const versionLabel = branchData.version.replace(/_/g, ' ');
              return (
                <button
                  key={branchData.branch}
                  className={`buttonSelect ${
                    currentBranch === branchData.branch ? 'bg-[#0060ff]' : ''
                  }`}
                  onClick={() => setCurrentBranch(branchData.branch)}
                >
                  {versionLabel}
                </button>
              );
            })}
          </div>

          {ota ? (
            <div
              className='flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-[#0060ff] bg-[#0f172a] p-4 md:flex-row md:gap-6 lg:gap-16 lg:p-11'
            >
              <div className='mt-4 flex flex-col gap-4 md:w-1/4 lg:w-1/4 lg:flex-shrink-0'>
                <img
                  className='max-h-56 min-h-48 w-full object-contain'
                  src={`${Constants.DEVICES_IMAGE}${codename}.png`}
                  alt='Device'
                />
                <div className='gap-4 text-center'>
                  <span>
                    <p className='text-2xl'>
                      {ota.oem} {ota.device}
                    </p>
                    <p className='evoxhighlight text-lg'>({codename})</p>
                  </span>
                </div>
              </div>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentBranch}
                  className='middleshadow flex grow flex-col gap-4 rounded-2xl border-2 border-[#0060ff] bg-[#040214] px-4 py-5 md:w-2/3 lg:w-2/3 lg:justify-between lg:gap-0'
                  variants={switchVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ duration: 0.2, delay: 0.1 }}
                  style={{ minHeight: '450px' }}
                >
                  <div className='flex grow flex-col gap-4 lg:justify-between lg:gap-0'>
                    <div className='grid grid-cols-2 gap-2 pb-4 pl-2 lg:grid-cols-3 lg:gap-6'>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Android Version</div>
                        <div className='text-2xl text-white'>
                          {currentBranchData?.version?.replace('_vanilla', '')}
                        </div>
                      </div>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Evolution X Version</div>
                        <div className='text-2xl text-white'>
                          {ota.version}
                        </div>
                      </div>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Date</div>
                        <div className='text-2xl text-white'>
                          {new Date(ota.timestamp * 1000).toDateString()}
                        </div>
                      </div>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Type</div>
                        <div className='text-2xl text-white'>
                          {ota.buildtype}
                        </div>
                      </div>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Size</div>
                        <div className='text-2xl text-white'>
                          {(ota.size / 1024 / 1024 / 1024).toFixed(2)} GB
                        </div>
                      </div>
                      <div className='grow'>
                        <div className='evoxhighlight text-base'>Download Count</div>
                        <div className='text-2xl text-white'>
                          {downloadCount}
                        </div>
                      </div>
                    </div>

                    <div className='mb-4 flex items-center justify-between gap-4 rounded-2xl border-2 border-[#0060ff] bg-[#0f172a] px-4 py-3 lg:gap-9'>
                      <div className='flex items-center justify-start gap-2'>
                        <div className='flex size-12 shrink-0 items-center justify-center lg:size-16'>
                          <img
                            className='rounded-full'
                            src={`https://avatars.githubusercontent.com/${ota.github}`}
                            alt='Maintainer avatar'
                          />
                        </div>
                        <div className='lg:max-w-90 max-w-48 text-wrap font-[Prod-Medium] text-lg text-white lg:text-xl xl:max-w-fit'>
                          {ota.maintainer}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {ota.paypal && (
                          <Link href={ota.paypal} target='_blank'>
                            <img
                              src="/donateicon.svg"
                              alt='Donate icon'
                              className='size-8 lg:size-10'
                            />
                          </Link>
                        )}
                        {ota.forum && (
                          <Link href={ota.forum} target='_blank'>
                            <img
                              src="/xdaicon.svg"
                              alt='XDA icon'
                              className='size-8 lg:size-10'
                            />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                      <FlashingInstructions
                        codename={codename}
                        version={ota.version}
                        maintained={ota.currently_maintained}
                        androidVersion={currentBranchData?.version}
                        filename={ota.filename}
                        oem={ota.oem}
                        initialInstallationImages={ota.initial_installation_images}
                        gappsLink={gappsLink}
                      />
                      <Changelog
                        initialChangelog={changelogContent}
                        changelogError={changelogError}
                      />
                    </div>
                    <div
                      className={`mt-3 grid gap-3 ${isVanilla && gappsLink ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                    >
                      <Download
                        codename={codename}
                        maintained={ota.currently_maintained}
                        download={ota.download}
                        filename={ota.filename}
                        version={ota.version}
                      />
                      {isVanilla && gappsLink && (
                        <button
                          onClick={() => window.open(gappsLink, '_blank')}
                          className='inline-flex h-16 items-center justify-center gap-2 rounded-full bg-[#0060ff] text-2xl text-white hover:bg-[#004bb5]'
                        >
                          <p>Download GApps</p>
                          <ArrowOutwardIcon className='size-4 lg:size-6' />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            currentBranch && (
              <p className='text-center text-xl text-gray-500 my-8'>
                No builds found for the {currentBranch} branch.
              </p>
            )
          )}
        </div>
      </motion.div>
    </>
  );
};

export default DeviceContent;
