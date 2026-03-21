import fs from 'fs';
import { parseStringPromise } from 'xml2js';

const CREATIVE_TV_DPID = "PA-DPIDA-2024070301-Y";

export interface DDEXTrack {
  title: string;
  isrc: string;
  fileName: string;
}

export interface DDEXAlbumData {
  albumTitle: string;
  artist: string;
  releaseDate: Date;
  tracks: DDEXTrack[];
}

export async function parseDDEXManifest(xmlFilePath: string): Promise<DDEXAlbumData> {
  const rawXml = fs.readFileSync(xmlFilePath, 'utf8');
  const manifest = await parseStringPromise(rawXml, { explicitArray: false });
  const root = manifest.NewReleaseMessage || manifest.ernm?.['NewReleaseMessage'];

  if (!root) {
    throw new Error('Invalid DDEX XML: Missing NewReleaseMessage root element.');
  }

  // 1. Validate DPID Firewall
  const recipientDPID = root.MessageHeader?.MessageRecipient?.PartyId;
  const actualRecipient = typeof recipientDPID === 'object' ? recipientDPID._ : recipientDPID;

  if (actualRecipient !== CREATIVE_TV_DPID) {
    throw new Error(`SECURITY REJECTION: Expected DPID ${CREATIVE_TV_DPID}, found ${actualRecipient}.`);
  }

  // Extract Global Release Date
  const dealList = root.DealList?.ReleaseDeal || [];
  const mainDeal = Array.isArray(dealList) ? dealList[0] : dealList;
  const releaseDateString = mainDeal?.Deal?.DealTerms?.ValidityPeriod?.StartDate || new Date().toISOString(); 
  const releaseDate = new Date(releaseDateString);

  // 2. Extract Metadata
  const releaseList = root.ReleaseList?.Release || [];
  const mainRelease = Array.isArray(releaseList) ? releaseList[0] : releaseList;
  
  if (!mainRelease) {
      throw new Error('Invalid DDEX XML: Missing Release data.');
  }

  const soundRecordings = root.ResourceList?.SoundRecording || [];
  const tracksArray = Array.isArray(soundRecordings) ? soundRecordings : [soundRecordings];

  return {
    albumTitle: mainRelease.ReferenceTitle?.TitleText || 'Unknown Album',
    artist: mainRelease.ReleaseId?.DisplayArtistName || 'Unknown Artist',
    releaseDate: releaseDate,
    tracks: tracksArray.map((track: any) => ({
      title: track.ReferenceTitle?.TitleText || 'Unknown Track',
      isrc: track.SoundRecordingId?.ISRC || '',
      fileName: track.SoundRecordingDetailsByTerritory?.File?.FileName || track.SoundRecordingDetailsByTerritory?.[0]?.File?.FileName || ''
    }))
  };
}
