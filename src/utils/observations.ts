/* Based on code by elliotsayes from https://github.com/elliotsayes/gateway-explorer */

import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import { log, NAME_PASS_THRESHOLD, REFERENCE_GATEWAY_FQDN } from '@src/constants';
import { ArNSAssessment, Assessment, OwnershipAssessment } from '@src/types';
import { arrayBufferToBase64Url, fetchWithTimeout } from '.';

export const assessOwnership = async (
  gateway: AoGatewayWithAddress,
): Promise<OwnershipAssessment> => {
  try {
    const res = await fetchWithTimeout(
      `${gateway.settings.protocol}://${gateway.settings.fqdn}:${gateway.settings.port}/ar-io/info`,
    );
    if (res.status !== 200) {
      return {
        expectedWallets: [gateway.gatewayAddress],
        observedWallet: '',
        pass: false,
      };
    }

    const data = await res.json();

    const expectedWallet = gateway.gatewayAddress;
    const observedWallet = data.wallet;

    const assessment: OwnershipAssessment = {
      expectedWallets: [expectedWallet],
      observedWallet: observedWallet,
      pass: expectedWallet === observedWallet,
    };

    return assessment;
  } catch (error) {
    return {
      expectedWallets: [gateway.gatewayAddress],
      observedWallet: '',
      pass: false,
    };
  }
};

const fetchArnsData = async (arnsNameURL: string) => {
  try {
    const res = await fetchWithTimeout(arnsNameURL);

    if(res.status === 404) {
      return {
        statusCode: 404,
        resolvedId: '',
        ttlSeconds: '',
        contentType: '',
        contentLength: '',
        dataHashDigest: '',
      }
    }

    if (res.status !== 200) {
      throw new Error('Unable to fetch ARNS data');
    }

    const data = await res.arrayBuffer();

    const dataHash = await crypto.subtle.digest('SHA-256', data);
    const dataHashBase64URL = arrayBufferToBase64Url(dataHash);

    return {
      statusCode: res.status,
      resolvedId: res.headers.get('x-arns-resolved-id'),
      ttlSeconds: res.headers.get('x-arns-ttl-seconds'),
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-length'),
      dataHashDigest: dataHashBase64URL,
    };
  } catch (error) {
    log.error(error);
    return undefined;
  }
};

const assessArNSName = async (
  gateway: AoGatewayWithAddress,
  arnsName: string,
): Promise<[string, ArNSAssessment]> => {
  const referenceURL = `https://${arnsName}.${REFERENCE_GATEWAY_FQDN}:443`;
  const gatewayURL = `${gateway.settings.protocol}://${arnsName}.${gateway.settings.fqdn}:${gateway.settings.port}`;

  const referenceRes = await fetchArnsData(referenceURL);

  const startTimestamp = Date.now();
  const gatewayRes = await fetchArnsData(gatewayURL);

  const endTimestamp = Date.now(); 

  if (!referenceRes) {
    throw new Error('Unable to fetch reference ARNS data');
  }

  const arnsAssessment: ArNSAssessment = {
    assesedAt: Date.now(),
    expectedDataHash: referenceRes.dataHashDigest,
    expectedId: referenceRes.resolvedId ?? '',
    expectedStatusCode: referenceRes.statusCode,
    pass:
      referenceRes.resolvedId === gatewayRes?.resolvedId &&
      referenceRes.resolvedId !== null &&
      referenceRes.dataHashDigest == gatewayRes?.dataHashDigest &&
      referenceRes.statusCode == gatewayRes?.statusCode,
    resolvedDataHash: gatewayRes?.dataHashDigest ?? '',
    resolvedId: gatewayRes?.resolvedId ?? '',
    resolvedStatusCode: gatewayRes?.statusCode ?? 0,
    timings: {
      total: endTimestamp - startTimestamp,
      dns: undefined,
      download: undefined,
      firstByte: undefined,
      request: undefined,
      tcp: undefined,
      tls: undefined,
      wait: undefined,
    },
  };
  return [arnsName, arnsAssessment];
};

export const performAssessment = async (
  gateway: AoGatewayWithAddress,
  prescribedNames: string[],
  chosenNames: string[],
): Promise<Assessment> => {
  const ownershipAssessment = await assessOwnership(gateway);

  const chosenNamesResults = await Promise.all(
    chosenNames.map((name) => assessArNSName(gateway, name)),
  );
  const prescribedNamesResults = await Promise.all(
    prescribedNames.map((name) => assessArNSName(gateway, name)),
  );

  const nameCount = prescribedNames.length + chosenNames.length;
  const namePassCount = [...chosenNamesResults, ...prescribedNamesResults]
  .reduce((count, assessment) => (assessment[1].pass ? count + 1 : count), 0);
  const arnsAssessmentPass = namePassCount >= nameCount * NAME_PASS_THRESHOLD;

  const assessment: Assessment = {
    arnsAssessments: {
      chosenNames: Object.fromEntries(chosenNamesResults),
      pass: arnsAssessmentPass,
      prescribedNames: Object.fromEntries(prescribedNamesResults),
    },
    ownershipAssessment: ownershipAssessment,
    pass: arnsAssessmentPass && ownershipAssessment.pass,
  };

  return assessment;
};
